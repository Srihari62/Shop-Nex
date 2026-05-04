import prisma from "@packages/libs/prisma";
import { incrementUnseenCount } from "@packages/libs/redis/message.redis";
import { kafka } from "@packages/utils/kafka";
import { Consumer, EachMessagePayload } from "kafkajs";

interface BufferedMessage {
  conversationId: string;
  senderId: string;
  senderType: string;
  content: string;
  createdAt: string;
}

const TOPIC = "chat.new.message";
const GROUP_ID = "chat-message-db-writer";
const BATCH_INTERVAL_MS = 3000;

let buffer: BufferedMessage[] = [];
let flushTimer: NodeJS.Timeout | null = null;

//Initialize kafka consumer
export async function startConsumer() {
  const consumer: Consumer = kafka.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
  console.log("Kafka consumer connected");
  //start consuming
  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      const messageStr = message.value?.toString();
      if (!messageStr) {
        return;
      }
      try {
        const parsed: BufferedMessage = JSON.parse(messageStr);
        buffer.push(parsed);
        //if this is theh first message in the empty array then start the timer
        if (buffer.length === 1 && !flushTimer) {
          flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
        }
      } catch (error) {
        console.error("Error parsing kafka message", error);
      }
    },
  });
}

//Flush the buffer to the database and simply revieve the timer

async function flushBufferToDb() {
  const toInsert = buffer.splice(0, buffer.length);
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (toInsert.length === 0) return;
  try {
    const prismaPayload = toInsert.map((msg) => ({
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderType: msg.senderType,
      content: msg.content,
      createdAt: new Date(msg.createdAt),
    }));
    await prisma.message.createMany({
      data: prismaPayload,
    });

    // Update conversationGroup updatedAt for sorting
    const uniqueConversationIds = Array.from(new Set(prismaPayload.map(m => m.conversationId)));
    for (const convId of uniqueConversationIds) {
      await prisma.conversationGroup.update({
        where: { id: convId },
        data: { updatedAt: new Date() }
      });
    }

    //Redis update unseen counter(only if db insert successfull)
    for (const msg of prismaPayload) {
      const recieverType = msg.senderType === "user" ? "seller" : "user";
      await incrementUnseenCount(recieverType, msg.conversationId);
    }

    console.log(`Flushed ${prismaPayload.length} messages to DB and REDIS, updated ${uniqueConversationIds.length} conversations.`);
  } catch (error) {
    console.error("Failed to flush messages to DB and REDIS", error);
    buffer.unshift(...toInsert);
    if (!flushTimer) {
      flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
    }
  }
}
