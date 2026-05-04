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
      className={`flex items-center gap-4 p-4 cursor-pointer transition-all border-b border-slate-50 hover:bg-slate-50 ${
        isSelected ? "bg-slate-100 border-l-4 border-l-[#47718F]" : ""
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-200">
          {chat.seller.avatar ? (
            <img src={chat.seller.avatar} alt={chat.seller.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#47718F] text-white font-bold text-lg">
              {chat.seller.name.charAt(0)}
            </div>
          )}
        </div>
        {chat.seller.isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className={`font-bold text-sm truncate ${isSelected ? "text-[#365870]" : "text-slate-700"}`}>
            {chat.seller.name}
          </h3>
          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
            {format(lastMessageAt, "p")}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-slate-500 truncate pr-4">
            {chat.lastMessage}
          </p>
          {(unReadCount || 0) > 0 && (
            <div className="bg-[#47718F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center">
              {unReadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
