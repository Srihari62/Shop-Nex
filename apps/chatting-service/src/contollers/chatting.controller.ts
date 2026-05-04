import { AuthenticationError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import {
  clearUnseenCount,
  getUnseenCount,
} from "@packages/libs/redis/message.redis";
import { NextFunction, Request, Response } from "express";

export const newConversation = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.body;
    const userId = req.user.id;
    if (!sellerId) {
      return next(new ValidationError("Seller id is required"));
    }
    //check any conversation group exists between the user and seller
    const existiGroup = await prisma.conversationGroup.findFirst({
      where: {
        isGroup: false,
        participantsIds: {
          hasEvery: [userId, sellerId],
        },
      },
    });
    if (existiGroup) {
      return res.status(200).json({
        conversation: existiGroup,
        isNew: false,
      });
    }

    const newGroup = await prisma.conversationGroup.create({
      data: {
        participantsIds: [userId, sellerId],
        isGroup: false,
        creatorId: userId,
      },
    });

    await prisma.participant.createMany({
      data: [
        {
          conversationId: newGroup.id,
          userId,
        },
        {
          conversationId: newGroup.id,
          sellerId,
        },
      ],
    });
    return res.status(201).json({
      conversation: newGroup,
      isNew: true,
    });
  } catch (error) {
    return next(error);
  }
};

//get user conversations
export const getUserConversations = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantsIds: {
          has: userId,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (group) => {
        const sellerParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            sellerId: { not: null },
          },
        });

        let seller = null;
        if (sellerParticipant?.sellerId) {
          seller = await prisma.sellers.findUnique({
            where: {
              id: sellerParticipant.sellerId,
            },
            include: {
              shop: true,
            },
          });
        }
        //GEt last essage in the conversation
        const lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: group.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        //check online status from redis
        let isOnline = false;
        if (sellerParticipant?.sellerId) {
          const redisKey = `online:seller:${sellerParticipant.sellerId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount("user", group.id);
        return {
          conversationId: group.id,
          seller: {
            id: seller?.id || null,
            name: seller?.shop?.name || "Unknown Seller",
            isOnline,
            avatar: seller?.shop?.avatarUrl || null,
          },
          lastMessage:
            lastMessage?.content || "Say something to start a conversation",
          lastMessageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        };
      }),
    );
    return res.status(200).json({ conversations: responseData });
  } catch (error) {
    return next(error);
  }
};

//get seller conversations
export const getSellerConversations = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller.id;

    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantsIds: {
          has: sellerId,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (group) => {
        const userParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            userId: { not: null },
          },
        });

        let user = null;
        if (userParticipant?.userId) {
          user = await prisma.users.findUnique({
            where: { id: userParticipant.userId },
          });
        }
        //GEt last essage in the conversation
        const lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: group.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        //check online status from redis
        let isOnline = false;
        if (userParticipant?.userId) {
          const redisKey = `online:user:user${userParticipant.userId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount("seller", group.id);
        return {
          conversationId: group.id,
          user: {
            id: user?.id || null,
            name: user?.name || "Unknown User",
            isOnline,
            avatar: user?.avatarId || null,
          },
          lastMessage:
            lastMessage?.content || "Say something to start a conversation",
          lastMessageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        };
      }),
    );
    return res.status(200).json({ conversations: responseData });
  } catch (error) {
    return next(error);
  }
};

//fetch user messages
export const fetchUserMessages = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;
    if (!conversationId) {
      return next(new ValidationError("Conversation id is required"));
    }
    //conversartion must belong to the user
    const conversation = await prisma.conversationGroup.findUnique({
      where: {
        id: conversationId,
      },
    });
    if (!conversation) {
      return next(new ValidationError("Conversation not found"));
    }
    const hasAccess = conversation.participantsIds.includes(userId);
    if (!hasAccess) {
      return next(new AuthenticationError("Unauthorized to this conversation"));
    }
    //
    await clearUnseenCount("user", conversationId);

    //get seller participant
    const sellerParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        sellerId: { not: null },
      },
    });

    let seller = null;
    let isOnline = false;

    if (sellerParticipant?.sellerId) {
      seller = await prisma.sellers.findUnique({
        where: { id: sellerParticipant.sellerId },
        include: {
          shop: true,
        },
      });
    }

    const redisKey = `online:seller:${sellerParticipant?.sellerId}`;
    const redisResult = await redis.get(redisKey);
    isOnline = !!redisResult;

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    return res.status(200).json({
      messages,
      seller: {
        id: seller?.id || null,
        name: seller?.shop?.name || "Unknown Seller",
        isOnline,
        avatar: seller?.shop?.avatarUrl,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};

//fetch seller messages
export const fetchSellerMessages = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;
    if (!conversationId) {
      return next(new ValidationError("Conversation id is required"));
    }
    //conversartion must belong to the seller
    const conversation = await prisma.conversationGroup.findUnique({
      where: {
        id: conversationId,
      },
    });
    if (!conversation) {
      return next(new ValidationError("Conversation not found"));
    }
    const hasAccess = conversation.participantsIds.includes(sellerId);
    if (!hasAccess) {
      return next(new AuthenticationError("Unauthorized to this conversation"));
    }
    //
    await clearUnseenCount("seller", conversationId);

    //get user participant
    const userParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: { not: null },
      },
    });

    let user = null;
    let isOnline = false;

    if (userParticipant?.userId) {
      user = await prisma.users.findUnique({
        where: { id: userParticipant.userId },
      });
    }

    const redisKey = `online:user:user_${userParticipant?.userId}`;
    const redisResult = await redis.get(redisKey);
    isOnline = !!redisResult;

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    return res.status(200).json({
      messages,
      user: {
        id: user?.id || null,
        name: user?.name || "Unknown User",
        isOnline,
        avatar: user?.avatarId,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};
