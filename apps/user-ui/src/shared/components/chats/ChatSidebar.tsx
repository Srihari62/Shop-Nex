import React from "react";
import { Search } from "lucide-react";
import ChatItem from "./ChatItem";

interface ChatSidebarProps {
  chats: any[];
  selectedChatId?: string | null;
  onSelectChat: (chat: any) => void;
  unReadCounts: Record<string, number>;
  isLoading?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  unReadCounts,
  isLoading,
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
      <div className="p-6 border-b border-slate-50">
        <h2 className="text-2xl font-black text-[#365870] tracking-tight mb-4">Messages</h2>
        <div className="relative group">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-50 focus:border-[#47718F] focus:bg-white outline-none rounded-xl px-10 py-2.5 text-sm transition-all"
          />
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-[#47718F] transition-colors" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Search size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-sm">No conversations yet.</p>
          </div>
        ) : (
          chats.map((chat) => (
            <ChatItem
              key={chat.conversationId}
              chat={chat}
              isSelected={selectedChatId === chat.conversationId}
              onClick={() => onSelectChat(chat)}
              unReadCount={unReadCounts[chat.conversationId]}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
