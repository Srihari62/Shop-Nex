"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useWebSocket } from "@/context/web-socket-context";
import ChatSidebar from "@/app/shared/components/chats/ChatSidebar";
import ChatWindow from "@/app/shared/components/chats/ChatWindow";
import toast from "react-hot-toast";
import useSeller from "@/hooks/useSeller";

const InboxPageContent = () => {
  const searchParams = useSearchParams();
  const { seller, isLoading: sellerLoading } = useSeller();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { ws, unReadCounts, setUnreadCounts } = useWebSocket();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const conversationId = searchParams.get("conversationId");
  const lastInvalidatedId = useRef<string | null>(null);

  // Fetch all conversations for seller
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery(
    {
      queryKey: ["seller-conversations"],
      queryFn: async () => {
        const res = await axiosInstance.get(
          "/chatting/api/get-seller-conversations",
        );
        return res.data.conversations;
      },
      enabled: !!seller,
      refetchOnMount: "always",
    },
  );

  useEffect(() => {
    if (conversationsData) {
      setChats((prevChats) => {
        const merged = [...conversationsData].map((newChat) => {
          const existing = prevChats.find(
            (p) => p.conversationId === newChat.conversationId,
          );
          if (
            existing &&
            new Date(existing.lastMessageAt).getTime() >
              new Date(newChat.lastMessageAt).getTime()
          ) {
            return {
              ...newChat,
              lastMessage: existing.lastMessage,
              lastMessageAt: existing.lastMessageAt,
            };
          }
          return newChat;
        });

        return merged.sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || a.updatedAt).getTime();
          const timeB = new Date(b.lastMessageAt || b.updatedAt).getTime();
          return timeB - timeA;
        });
      });

      if (conversationId) {
        const chat = conversationsData.find(
          (c: any) => c.conversationId === conversationId,
        );
        if (chat) {
          setSelectedChat(chat);
          setIsSidebarOpen(false);
          lastInvalidatedId.current = null;
        } else if (
          !conversationsLoading &&
          lastInvalidatedId.current !== conversationId
        ) {
          lastInvalidatedId.current = conversationId;
          queryClient.invalidateQueries({ queryKey: ["seller-conversations"] });
        }
      }
    }
  }, [conversationsData, conversationId, queryClient, conversationsLoading]);

  // Fetch messages for selected chat
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["seller-messages", selectedChat?.conversationId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/chatting/api/get-seller-messages/${selectedChat.conversationId}`,
      );
      return res.data;
    },
    enabled: !!selectedChat?.conversationId,
    refetchOnMount: "always",
    staleTime: 10 * 1000, // 10 seconds
  });

  // Automatically mark as seen when chat is active
  useEffect(() => {
    if (ws && ws.readyState === WebSocket.OPEN && selectedChat && messagesData) {
      ws.send(
        JSON.stringify({
          type: "ACTIVE_CHAT",
          fromUserId: seller.id,
          conversationId: selectedChat.conversationId,
          userType: "seller",
        }),
      );
    }
    
    // Cleanup: clear active chat on unmount or when chat changes
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN && seller?.id) {
        ws.send(
          JSON.stringify({
            type: "ACTIVE_CHAT",
            fromUserId: seller.id,
            conversationId: null,
            userType: "seller",
          }),
        );
      }
    };
  }, [selectedChat, ws, messagesData, seller?.id]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "MESSAGES_SEEN") {
          const { conversationId } = data.payload;
          
          // Update query cache for status
          queryClient.setQueryData(["seller-messages", conversationId], (old: any) => {
            if (!old) return old;
            return {
              ...old,
              messages: old.messages.map((m: any) => 
                m.senderId === seller.id ? { ...m, status: "seen" } : m
              )
            };
          });

          if (selectedChat && conversationId === selectedChat.conversationId) {
            // Also reset unread count locally
            setUnreadCounts((prev: Record<string, number>) => ({
              ...prev,
              [conversationId]: 0,
            }));
          }
        }

        if (data.type === "NEW_MESSAGE") {
          const newMessage = data.payload;

          const msgQueryKey = ["seller-messages", newMessage.conversationId];
          queryClient.setQueryData(msgQueryKey, (old: any) => {
            const oldMessages = old?.messages || [];

            const isDuplicate = oldMessages.some((m: any) => {
              if (newMessage.id && m.id === newMessage.id) return true;
              return (
                m.content === newMessage.content &&
                m.senderId === newMessage.senderId &&
                m.createdAt === newMessage.createdAt
              );
            });

            if (isDuplicate) return old;

            return {
              ...old,
              messages: [...oldMessages, newMessage].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime(),
              ),
            };
          });

          // Mark as seen if we are in this chat
          if (selectedChat && newMessage.conversationId === selectedChat.conversationId) {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "MARK_AS_SEEN",
                  fromUserId: seller.id,
                  conversationId: selectedChat.conversationId,
                  userType: "seller",
                }),
              );
            }
          }

          // Update conversations cache
          queryClient.setQueryData(["seller-conversations"], (old: any) => {
            if (!old) return old;
            return old.map((chat: any) => {
              if (chat.conversationId === newMessage.conversationId) {
                return {
                  ...chat,
                  lastMessage: newMessage.content,
                  lastMessageAt: newMessage.createdAt,
                  updatedAt: newMessage.createdAt,
                };
              }
              return chat;
            }).sort((a: any, b: any) => {
              const timeA = new Date(a.lastMessageAt || a.updatedAt).getTime();
              const timeB = new Date(b.lastMessageAt || b.updatedAt).getTime();
              return timeB - timeA;
            });
          });

          // Update local sidebar state
          setChats((prevChats) => {
            const chatExists = prevChats.some(
              (c) => c.conversationId === newMessage.conversationId,
            );

            if (!chatExists) {
              queryClient.invalidateQueries({
                queryKey: ["seller-conversations"],
              });
              return prevChats;
            }

            return prevChats
              .map((chat) => {
                if (chat.conversationId === newMessage.conversationId) {
                  return {
                    ...chat,
                    lastMessage: newMessage.content,
                    lastMessageAt: newMessage.createdAt,
                    updatedAt: newMessage.createdAt,
                  };
                }
                return chat;
              })
              .sort((a, b) => {
                const timeA = new Date(a.lastMessageAt || a.updatedAt).getTime();
                const timeB = new Date(b.lastMessageAt || b.updatedAt).getTime();
                return timeB - timeA;
              });
          });
        }
      } catch (err) {
        console.error("Error processing websocket message:", err);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [ws, selectedChat, seller?.id, queryClient]);

  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat);
    router.push(`/dashboard/inbox?conversationId=${chat.conversationId}`);
    setIsSidebarOpen(false);

    // Notify server about active chat
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "ACTIVE_CHAT",
          conversationId: chat.conversationId,
          fromUserId: seller.id,
          userType: "seller"
        }),
      );
    }

    // Reset unread count locally
    setUnreadCounts((prev: Record<string, number>) => ({
      ...prev,
      [chat.conversationId]: 0,
    }));
  };

  const handleSendMessage = (content: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !selectedChat) {
      toast.error("Connection lost. Please try again.");
      return;
    }

    const payload = {
      fromUserId: seller.id,
      toUserId: selectedChat.user.id,
      messageBody: content,
      conversationId: selectedChat.conversationId,
      senderType: "seller",
    };

    ws.send(JSON.stringify(payload));
  };

  if (sellerLoading) return (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0085ff]"></div>
    </div>
  );

  const filteredChats = chats.filter((chat) =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full bg-black min-h-[calc(100vh-20px)] flex flex-col items-center justify-start py-0">
      <div className="w-full bg-black h-[calc(100vh-20px)] overflow-hidden flex flex-col md:flex-row border-t border-[#1f2326]">
        {/* Sidebar */}
        <div
          className={`${isSidebarOpen ? "flex" : "hidden"} md:flex w-full md:w-[350px] lg:w-[400px] h-full shrink-0`}
        >
          <ChatSidebar
            chats={filteredChats}
            selectedChatId={selectedChat?.conversationId}
            onSelectChat={handleSelectChat}
            unReadCounts={unReadCounts}
            isLoading={conversationsLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Main Content */}
        <div
          className={`${!isSidebarOpen ? "flex" : "hidden"} md:flex flex-1 h-full`}
        >
          <ChatWindow
            selectedChat={selectedChat}
            messages={messagesData?.messages || []}
            onSendMessage={handleSendMessage}
            onBack={() => setIsSidebarOpen(true)}
            userId={seller?.id}
          />
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <React.Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0085ff]"></div>
      </div>
    }>
      <InboxPageContent />
    </React.Suspense>
  );
};

export default Page;
