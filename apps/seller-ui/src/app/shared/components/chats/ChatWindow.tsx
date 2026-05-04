import React, { useEffect, useRef, useState } from "react";
import { Send, Image, Smile, MoreVertical, ChevronLeft } from "lucide-react";
import MessageBubble from "./MessageBubble";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface ChatWindowProps {
  selectedChat: any | null;
  messages: any[];
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  userId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedChat,
  messages,
  onSendMessage,
  onBack,
  userId
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setInputValue((prev) => prev + emojiData.emoji);
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black p-8 text-center h-full">
        <div className="w-24 h-24 bg-[#1f2326] rounded-[2rem] shadow-xl shadow-black/50 flex items-center justify-center mb-6 border border-[#2e3338]">
          <Smile size={48} className="text-[#0085ff] opacity-20" />
        </div>
        <h3 className="text-xl font-black text-[#ecedee] mb-2">Select a Customer</h3>
        <p className="text-[#969696] max-w-xs mx-auto text-sm leading-relaxed">
          Select a conversation from the sidebar to start chatting with your customers.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-[#1f2326] flex items-center justify-between bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="md:hidden p-2 -ml-2 hover:bg-[#1f2326] rounded-full transition-colors shrink-0">
            <ChevronLeft size={22} className="text-[#ecedee]" />
          </button>
          <div className="relative shrink-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[#1f2326] shadow-sm bg-[#1f2326]">
              {selectedChat.user.avatar ? (
                <img src={selectedChat.user.avatar} alt={selectedChat.user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#0085ff] text-white font-bold text-sm md:text-base">
                  {selectedChat.user.name.charAt(0)}
                </div>
              )}
            </div>
            {selectedChat.user.isOnline && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-black rounded-full"></div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[#ecedee] leading-tight truncate text-sm md:text-base">{selectedChat.user.name}</h3>
            <span className="text-[10px] md:text-[11px] text-[#969696] font-medium">
              {selectedChat.user.isOnline ? "Online now" : "Offline"}
            </span>
          </div>
        </div>
        <button className="p-2 hover:bg-[#1f2326] rounded-full transition-colors shrink-0">
          <MoreVertical size={20} className="text-[#969696]" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-black"
      >
        <div className="flex flex-col">
          {messages.map((msg, index) => (
            <MessageBubble 
              key={msg.id || index} 
              message={msg} 
              isSelf={msg.senderId === userId} 
            />
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 md:p-4 bg-black border-t border-[#1f2326] relative">
        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef}
            className="absolute bottom-full left-0 right-0 md:left-auto md:right-4 mb-2 md:mb-4 z-50 shadow-2xl animate-fade-in px-2 md:px-0"
          >
            <div className="max-w-full overflow-hidden rounded-2xl border border-[#1f2326]">
              <EmojiPicker 
                onEmojiClick={onEmojiClick}
                autoFocusSearch={false}
                theme={"dark" as any}
                width="100%"
                height={350}
              />
            </div>
          </div>
        )}
        <form 
          onSubmit={handleSubmit}
          className="flex items-center gap-2 md:gap-3 bg-[#1f2326] rounded-2xl md:rounded-[1.25rem] px-3 md:px-4 py-1.5 md:py-2 focus-within:bg-black focus-within:ring-2 focus-within:ring-[#0085ff]/20 transition-all border border-transparent focus-within:border-[#0085ff]/30"
        >
          <button type="button" className="p-1.5 text-[#969696] hover:text-[#0085ff] transition-colors shrink-0">
            <Image size={20} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm py-2 placeholder:text-[#969696] text-[#ecedee] min-w-0"
          />
          <button 
            type="button" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-1.5 transition-colors shrink-0 ${showEmojiPicker ? "text-[#0085ff]" : "text-[#969696] hover:text-[#0085ff]"}`}
          >
            <Smile size={20} />
          </button>
          <button 
            type="submit" 
            disabled={!inputValue.trim()}
            className="p-2 md:p-2.5 bg-gradient-to-br from-[#0085ff] to-[#0066cc] text-white rounded-lg md:rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
