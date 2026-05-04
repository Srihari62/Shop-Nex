import { kafka } from "@packages/utils/kafka";
import { WebSocket, WebSocketServer } from "ws";
import { Server as HttpServer } from "http";
import redis from "@packages/libs/redis";
import prisma from "@packages/libs/prisma";

const producer = kafka.producer();
const connectedUsers: Map<string, WebSocket> = new Map();
const activeChats: Map<string, string> = new Map(); // userId -> conversationId
const unseenCounts: Map<string, number> = new Map();

type IncomingMessage = {
  type?: string;
  fromUserId: string;
  toUserId: string;
  messageBody: string;
  conversationId: string;
  senderType: string;
  userType?: string;
};
export async function createWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server });
  await producer.connect();
  console.log("Kafka producer connected");

  wss.on("connection", (ws: WebSocket) => {
    console.log("new websocket connection");

    let registeredUserId: string | null = null;

    ws.on("message", async (rawMessage: Buffer) => {
      try {
        const messageStr = rawMessage.toString();

        //Register  the  user on first plain message
        if (!registeredUserId && !messageStr.startsWith("{")) {
          registeredUserId = messageStr;
          connectedUsers.set(registeredUserId, ws);
          (ws as any).registeredId = registeredUserId; // Store for easy access
          console.log(`User registered: ${registeredUserId}`);

          const isSeller = registeredUserId.startsWith("seller_");
          const redisKey = isSeller
            ? `online:seller:${registeredUserId.replace("seller_", "")}`
            : `online:user:${registeredUserId}`;
          await redis.set(redisKey, "1");
          await redis.expire(redisKey, 300);
          return;
        }
        //process the JSON message
        const data: IncomingMessage = JSON.parse(messageStr);

        switch (data.type) {
          case "ACTIVE_CHAT": {
            const { conversationId, fromUserId, userType } = data;
            const regId = userType === "seller" ? `seller_${fromUserId}` : `user_${fromUserId}`;
            
            if (!conversationId) {
              activeChats.delete(regId);
              return;
            }
            
            activeChats.set(regId, conversationId);

            try {
              await prisma.message.updateMany({
                where: {
                  conversationId,
                  senderId: { not: fromUserId },
                  status: { not: "seen" },
                },
                data: { status: "seen" },
              });

              // Notify other participants
              const conversation = await prisma.conversationGroup.findUnique({
                where: { id: conversationId },
              });
              if (conversation) {
                conversation.participantsIds.forEach((pId) => {
                  const pKeyUser = `user_${pId}`;
                  const pKeySeller = `seller_${pId}`;
                  [pKeyUser, pKeySeller].forEach((k) => {
                    if (k !== regId && connectedUsers.has(k)) {
                      connectedUsers.get(k)?.send(
                        JSON.stringify({
                          type: "MESSAGES_SEEN",
                          payload: { conversationId, seenBy: regId },
                        }),
                      );
                    }
                  });
                });
              }
            } catch (error) {
              console.error("Error in ACTIVE_CHAT:", error);
            }
            break;
          }

          case "MARK_AS_SEEN": {
            const { conversationId, fromUserId, userType } = data;
            const regId = userType === "seller" ? `seller_${fromUserId}` : `user_${fromUserId}`;
            
            await prisma.message.updateMany({
              where: {
                conversationId,
                senderId: { not: fromUserId },
                status: { not: "seen" },
              },
              data: { status: "seen" },
            });

            const conversation = await prisma.conversationGroup.findUnique({
              where: { id: conversationId },
            });
            if (conversation) {
              conversation.participantsIds.forEach((pId) => {
                const pKeyUser = `user_${pId}`;
                const pKeySeller = `seller_${pId}`;
                [pKeyUser, pKeySeller].forEach((k) => {
                  if (k !== regId && connectedUsers.has(k)) {
                    connectedUsers.get(k)?.send(
                      JSON.stringify({
                        type: "MESSAGES_SEEN",
                        payload: { conversationId, seenBy: regId },
                      }),
                    );
                  }
                });
              });
            }
            break;
          }
        }

        //regular message
        const {
          fromUserId,
          toUserId,
          messageBody,
          conversationId,
          senderType,
        } = data;

        if (!data || !toUserId || !messageBody || !conversationId) {
          console.warn("Invalid message format:", data);
          return;
        }

        const recieverKey = senderType === "seller" ? `user_${toUserId}` : `seller_${toUserId}`;
        const myKey = (ws as any).registeredId;

        const isReceiverActive = activeChats.get(recieverKey) === conversationId;
        const initialStatus = isReceiverActive ? "seen" : (connectedUsers.has(recieverKey) ? "delivered" : "sent");

        const now = new Date().toISOString();
        const messagePayload = {
          conversationId,
          senderId: fromUserId,
          senderType,
          content: messageBody,
          status: initialStatus,
          createdAt: now,
        };

        const messageEvent = JSON.stringify({
          type: "NEW_MESSAGE",
          payload: messagePayload,
        });

        //update unseen count dynaically

        const unseenKey = `${recieverKey}_${conversationId}`;
        if (!isReceiverActive) {
          const prevCount = unseenCounts.get(unseenKey) || 0;
          unseenCounts.set(unseenKey, prevCount + 1);

          //send new messgae to receiver
          const receiverSocket = connectedUsers.get(recieverKey);
          if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
            receiverSocket.send(messageEvent);

            //also notify unseen count
            receiverSocket.send(
              JSON.stringify({
                type: "UNSEEN_COUNT_UPDATE",
                payload: {
                  conversationId,
                  count: prevCount + 1,
                },
              }),
            );

            console.log(`Sent new message and unseen count to ${recieverKey}`);
          } else {
            console.log(`User ${recieverKey} is offline.message is queued `);
          }
        } else {
          // If receiver is active, just send the message
          const receiverSocket = connectedUsers.get(recieverKey);
          if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
            receiverSocket.send(messageEvent);
          }
        }

        //echo to sender
        const senderSocket = connectedUsers.get(myKey);
        if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
          senderSocket.send(messageEvent);
          console.log(`Echoed message to sender ${myKey}`);
        }

        //push to kafka consumer
        await producer.send({
          topic: "chat.new.message",
          messages: [
            {
              key: conversationId,
              value: JSON.stringify(messagePayload),
            },
          ],
        });
        console.log(`Message queued to kafka ${conversationId} `);
      } catch (error) {
        console.error("Failed to process WebSocket message", error);
      }
    });
    ws.on("close", async () => {
      if (registeredUserId) {
        connectedUsers.delete(registeredUserId);
        console.log(`Disconnected user ${registeredUserId}`);
        const isSeller = registeredUserId.startsWith("seller_");
        const redisKey = isSeller
          ? `online:seller:${registeredUserId.replace("seller_", "")}`
          : `online:user:${registeredUserId}`;
        await redis.del(redisKey);
        console.log(`Removed from online status ${redisKey}`);
      }
    });

    ws.on("error", (error) => {
      console.error("Websocket error:", error);
    });
  });
  console.log("Websocket server is ready");
}
