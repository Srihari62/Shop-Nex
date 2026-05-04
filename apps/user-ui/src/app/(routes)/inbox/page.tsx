"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import useRequireAuth from "apps/user-ui/src/hooks/useRequireAuth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { useWebSocket } from "apps/user-ui/src/context/web-socket-context";
import ChatSidebar from "apps/user-ui/src/shared/components/chats/ChatSidebar";
import ChatWindow from "apps/user-ui/src/shared/components/chats/ChatWindow";
import toast from "react-hot-toast";

const Page = () => {
  const searchParams = useSearchParams();
  const { user, isLoading: userLoading } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { ws, unReadCounts } = useWebSocket();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
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
  });

  useEffect(() => {
    if (messagesData) {
      setMessages((prev) => {
        // Merge server messages with local state to ensure no losses during Kafka delay
        const serverMessages = messagesData.messages || [];
        const merged = [...serverMessages];

        prev.forEach((localMsg) => {
          const exists = serverMessages.some(
            (sm: {
              id: any;
              content: any;
              senderId: any;
              createdAt: string | number | Date;
            }) =>
              sm.id === localMsg.id ||
              (sm.content === localMsg.content &&
                sm.senderId === localMsg.senderId &&
                Math.abs(
                  new Date(sm.createdAt).getTime() -
                    new Date(localMsg.createdAt).getTime(),
                ) < 5000),
          );
          if (!exists) {
            merged.push(localMsg);
          }
        });

        return merged.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });

      // Mark as seen when messages are fetched
      if (ws && ws.readyState === WebSocket.OPEN && selectedChat) {
        ws.send(
          JSON.stringify({
            type: "MARK_AS_SEEN",
            fromUserId: user.id,
            conversationId: selectedChat.conversationId,
          }),
        );
      }
    }
  }, [messagesData, selectedChat, ws, user?.id]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

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

          // If message is for currently selected chat, also update local state to trigger UI immediately
          if (
            selectedChat &&
            newMessage.conversationId === selectedChat.conversationId
          ) {
            setMessages((prev) => {
              const isDuplicate = prev.some((m) => {
                if (newMessage.id && m.id === newMessage.id) return true;
                return (
                  m.content === newMessage.content &&
                  m.senderId === newMessage.senderId &&
                  m.createdAt === newMessage.createdAt
                );
              });

              if (isDuplicate) return prev;
              return [...prev, newMessage].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime(),
              );
            });

            // Send mark as seen
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "MARK_AS_SEEN",
                  fromUserId: user.id,
                  conversationId: selectedChat.conversationId,
                }),
              );
            }
          }

          // Update sidebar
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
                const timeA = new Date(
                  a.lastMessageAt || a.updatedAt,
                ).getTime();
                const timeB = new Date(
                  b.lastMessageAt || b.updatedAt,
                ).getTime();
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
            messages={messages}
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
