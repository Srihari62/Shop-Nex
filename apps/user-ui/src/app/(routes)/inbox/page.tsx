"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import useRequireAuth from "@/hooks/useRequireAuth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useWebSocket } from "@/context/web-socket-context";
import ChatSidebar from "@/shared/components/chats/ChatSidebar";
import ChatWindow from "@/shared/components/chats/ChatWindow";
import toast from "react-hot-toast";

const Page = () => {
  const searchParams = useSearchParams();
  const { user, isLoading: userLoading } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { ws, unReadCounts, setUnreadCounts } = useWebSocket();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const conversationId = searchParams.get("conversationId");
  const lastInvalidatedId = useRef<string | null>(null);

  // Fetch all conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery(
    {
      queryKey: ["conversations"],
      queryFn: async () => {
        const res = await axiosInstance.get(
          "/chatting/api/get-user-conversations",
        );
        return res.data.conversations;
      },
      enabled: !!user,
      refetchOnMount: "always",
    },
  );

  useEffect(() => {
    if (conversationsData) {
      // Merge with current chats to preserve local updates (like last message)
      // but favor server data for new conversations
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

      // If conversationId is in URL, find and select it
      if (conversationId) {
        const chat = conversationsData.find(
          (c: any) => c.conversationId === conversationId,
        );
        if (chat) {
          setSelectedChat(chat);
          setIsSidebarOpen(false);
          lastInvalidatedId.current = null; // Reset on success
        } else if (
          !conversationsLoading &&
          lastInvalidatedId.current !== conversationId
        ) {
          // If NOT found and not currently loading, and we haven't tried for THIS ID yet
          lastInvalidatedId.current = conversationId;
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      }
    }
  }, [conversationsData, conversationId, queryClient, conversationsLoading]);

  // Fetch messages for selected chat
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", selectedChat?.conversationId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/chatting/api/get-user-messages/${selectedChat.conversationId}`,
      );
      return res.data;
    },
    enabled: !!selectedChat?.conversationId,
    refetchOnMount: "always",
    staleTime: 10 * 1000,
  });

  // Automatically mark as seen when chat is active
  useEffect(() => {
    if (ws && ws.readyState === WebSocket.OPEN && selectedChat && messagesData) {
      ws.send(
        JSON.stringify({
          type: "ACTIVE_CHAT",
          fromUserId: user.id,
          conversationId: selectedChat.conversationId,
        }),
      );
    }

    // Cleanup: clear active chat on unmount
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN && user?.id) {
        ws.send(
          JSON.stringify({
            type: "ACTIVE_CHAT",
            fromUserId: user.id,
            conversationId: null,
          }),
        );
      }
    };
  }, [selectedChat, ws, messagesData, user?.id]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "MESSAGES_SEEN") {
          const { conversationId } = data.payload;
          
          // Update query cache
          queryClient.setQueryData(["messages", conversationId], (old: any) => {
            if (!old) return old;
            return {
              ...old,
              messages: old.messages.map((m: any) => 
                m.senderId === user.id ? { ...m, status: "seen" } : m
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

          // Update the messages cache for this conversationId directly
          const msgQueryKey = ["messages", newMessage.conversationId];
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
                  fromUserId: user.id,
                  conversationId: selectedChat.conversationId,
                }),
              );
            }
          }

          // Update conversations cache
          queryClient.setQueryData(["conversations"], (old: any) => {
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
              queryClient.invalidateQueries({ queryKey: ["conversations"] });
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
  }, [ws, selectedChat, user?.id, queryClient]);

  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat);
    // Don't clear messages state here to allow cache to load or keep local state
    router.push(`/inbox?conversationId=${chat.conversationId}`);
    setIsSidebarOpen(false);

    // Notify server about active chat
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "ACTIVE_CHAT",
          conversationId: chat.conversationId,
          fromUserId: user.id,
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
      fromUserId: user.id,
      toUserId: selectedChat.seller.id,
      messageBody: content,
      conversationId: selectedChat.conversationId,
      senderType: "user",
    };

    ws.send(JSON.stringify(payload));
  };

  if (userLoading) return null;

  const filteredChats = chats.filter((chat) =>
    chat.seller.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className=" w-full bg-[#F8FAFC] min-h-[calc(100vh-80px)] flex flex-col items-center justify-start py-0 md:pb-10">
      <div className=" mt-10 w-full md:w-[85%] lg:w-[80%] bg-white h-[calc(100vh-80px)] md:h-[700px] lg:h-[800px] rounded-none md:rounded-[2.5rem] shadow-none md:shadow-2xl shadow-slate-200 overflow-hidden flex flex-col md:flex-row border-none md:border md:border-slate-100">
        {/* Sidebar */}
        <div
          className={`${isSidebarOpen ? "flex" : "hidden"} md:flex w-full md:w-[350px] lg:w-[400px] h-full shrink-0 border-r border-slate-100`}
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
            userId={user?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
