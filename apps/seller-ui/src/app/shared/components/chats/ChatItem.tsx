import React from "react";
import { format } from "date-fns";

interface ChatItemProps {
  chat: any;
  isSelected: boolean;
  onClick: () => void;
  unReadCount?: number;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, isSelected, onClick, unReadCount }) => {
  const lastMessageAt = new Date(chat.lastMessageAt);
  
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 cursor-pointer transition-all border-b border-[#1f2326] hover:bg-[#1f2326] ${
        isSelected ? "bg-[#1f2326] border-l-4 border-l-[#0085ff]" : ""
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2e3338] shadow-sm bg-[#2e3338]">
          {chat.user.avatar ? (
            <img src={chat.user.avatar} alt={chat.user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0085ff] text-white font-bold text-lg">
              {chat.user.name.charAt(0)}
            </div>
          )}
        </div>
        {chat.user.isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className={`font-bold text-sm truncate ${isSelected ? "text-[#ecedee]" : "text-[#ecedee]"}`}>
            {chat.user.name}
          </h3>
          <span className="text-[10px] text-[#969696] font-medium whitespace-nowrap ml-2">
            {format(lastMessageAt, "p")}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-[#969696] truncate pr-4">
            {chat.lastMessage}
          </p>
          {(unReadCount || 0) > 0 && (
            <div className="bg-[#0085ff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center">
              {unReadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
