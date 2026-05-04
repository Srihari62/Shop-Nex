import React from "react";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: any;
  isSelf: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSelf }) => {
  const createdAt = new Date(message.createdAt);

  const StatusIcon = () => {
    if (!isSelf) return null;
    if (message.status === "seen") return <CheckCheck size={14} className="text-[#0085ff]" />;
    if (message.status === "delivered") return <CheckCheck size={14} className="text-[#969696]" />;
    return <Check size={14} className="text-[#969696]" />;
  };

  return (
    <div className={`flex w-full mb-4 ${isSelf ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] md:max-w-[65%] group`}>
        <div
          className={`px-4 py-2.5 rounded-2xl shadow-sm relative ${
            isSelf
              ? "bg-gradient-to-br from-[#0085ff] to-[#0066cc] text-white rounded-tr-none"
              : "bg-[#1f2326] text-[#ecedee] rounded-tl-none border border-[#2e3338]"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isSelf ? "justify-end" : "justify-start"}`}>
          <span className="text-[10px] text-[#969696] font-medium">
            {format(createdAt, "p")}
          </span>
          <StatusIcon />
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
