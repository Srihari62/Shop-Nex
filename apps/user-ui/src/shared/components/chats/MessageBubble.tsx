import React from "react";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: any;
  isSelf: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSelf }) => {
  const createdAt = new Date(message.createdAt);

  return (
    <div className={`flex w-full mb-4 ${isSelf ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] md:max-w-[65%] group`}>
        <div
          className={`px-4 py-2.5 rounded-2xl shadow-sm relative ${
            isSelf
              ? "bg-gradient-to-br from-[#47718F] to-[#365870] text-white rounded-tr-none"
              : "bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div className={`flex items-center mt-1.5 px-1 ${isSelf ? "justify-end" : "justify-start"}`}>
          <span className="text-[10px] text-slate-400 font-medium">
            {format(createdAt, "p")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
