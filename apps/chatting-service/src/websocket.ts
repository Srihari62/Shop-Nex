import { kafka } from "@packages/utils/kafka";
import { WebSocket, WebSocketServer } from "ws";
import { Server as HttpServer } from "http";
import redis from "@packages/libs/redis";

const producer = kafka.producer();
const connectedUsers: Map<string, WebSocket> = new Map();
const unseenCounts: Map<String, number> = new Map();

type IncomingMessage = {
  type?: string;
  fromUserId: string;
  toUserId: string;
  messageBody: string;
  conversationId: string;
  senderType: string;
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
          console.log(`Registered Websocket for userId ${registeredUserId}`);

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

        if (data.type === "MARK_AS_SEEN" && registeredUserId) {
          const seenKey = `${registeredUserId}_${data.conversationId}`;
          unseenCounts.set(seenKey, 0);
          return;
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

        const now = new Date().toISOString();
        const messagePayload = {
          conversationId,
          senderId: fromUserId,
          senderType,
          content: messageBody,
          createdAt: now,
        };

        const messageEvent = JSON.stringify({
          type: "NEW_MESSAGE",
          payload: messagePayload,
        });

        const recieverKey =
          senderType === "user" ? `seller_${toUserId}` : `user_${toUserId}`;
        const senderKey =
          senderType === "user" ? `user_${fromUserId}` : `seller_${fromUserId}`;

        //update unseen count dynaically

        const unseenKey = `${recieverKey}_${conversationId}`;
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

        //echo to sender
        const senderSocket = connectedUsers.get(senderKey);
        if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
          senderSocket.send(messageEvent);
          console.log(`Echoed message to sender  ${senderKey}`);
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
