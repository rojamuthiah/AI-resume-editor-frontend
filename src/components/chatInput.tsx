import React, { useState, useRef, useEffect } from "react";

type ChatMode = "ask" | "edit";

interface ChatInputProps {
  mode: ChatMode;
  setMode: React.Dispatch<React.SetStateAction<ChatMode>>;
  onSend: (text: string) => void;
  loading: boolean;
  showChatHistory: boolean;
  setShowChatHistory: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  mode, 
  setMode, 
  onSend, 
  loading,
  showChatHistory,
  setShowChatHistory
}) => {
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    const maxHeight = isMobile ? 100 : 160; // Smaller on mobile
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + "px";
  }, [input, isMobile]);

  // Handle Enter vs Shift+Enter (only on desktop)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isMobile && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim()) {
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div className={`border-t bg-gradient-to-b from-white to-gray-50 ${isMobile ? 'p-2' : 'p-4'}`}>
      
      {/* MODE SELECTOR WITH CHAT HISTORY TOGGLE */}
      <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
        <div className="flex items-center gap-2">
          {!isMobile && <span className="text-xs font-medium text-gray-500">Mode:</span>}
          <div className={`flex bg-gray-100 rounded-lg ${isMobile ? 'p-0.5' : 'p-1'}`}>
            <button
              onClick={() => setMode("ask")}
              className={`
                ${isMobile ? 'px-2 py-1' : 'px-4 py-1.5'} rounded-md ${isMobile ? 'text-xs' : 'text-sm'} font-medium transition-all
                ${mode === "ask" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              <div className="flex items-center gap-1">
                <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ask
              </div>
            </button>
            
            <button
              onClick={() => setMode("edit")}
              className={`
                ${isMobile ? 'px-2 py-1' : 'px-4 py-1.5'} rounded-md ${isMobile ? 'text-xs' : 'text-sm'} font-medium transition-all
                ${mode === "edit" 
                  ? "bg-white text-green-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              <div className="flex items-center gap-1">
                <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </div>
            </button>
          </div>
        </div>

        {/* Chat History Toggle */}
        <button
          onClick={() => setShowChatHistory(!showChatHistory)}
          className={`flex items-center gap-1 ${isMobile ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-md ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all`}
          title={showChatHistory ? "Hide Chat History" : "Show Chat History"}
        >
          <svg 
            className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {showChatHistory ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            )}
          </svg>
          {!isMobile && <span className="text-xs">Chat History</span>}
        </button>
      </div>

      {/* INPUT CONTAINER */}
      <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>

        
        {/* TEXTAREA WITH FLOATING PLACEHOLDER */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={
              mode === "ask" 
                ? "Ask anything about your resume..." 
                : "Describe the changes you want to make..."
            }
            className={`
              w-full bg-white ${isMobile ? 'p-2 pr-10 text-xs' : 'p-3 pr-12 text-sm'}
              rounded-xl border-2 resize-none leading-relaxed
              focus:outline-none focus:border-blue-500
              transition-all duration-200
              ${loading ? "bg-gray-50 cursor-not-allowed" : ""}
              ${mode === "ask" ? "border-blue-200" : "border-green-200"}
            `}
            style={{ maxHeight: isMobile ? '100px' : '160px' }}
          />
          
          {/* Character count (optional) - hide on mobile */}
          {!isMobile && input.length > 0 && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {input.length}
            </div>
          )}
        </div>

        {/* SEND BUTTON */}
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className={`
            ${isMobile ? 'w-10 h-9' : 'w-12 h-12'} rounded-xl flex items-center justify-center
            shadow-lg transition-all duration-200 transform
            ${loading || !input.trim()
              ? "bg-gray-300 cursor-not-allowed"
              : mode === "ask"
              ? "bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95"
              : "bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95"
            }
          `}
        >
          {loading ? (
            <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white animate-spin`} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* HINT TEXT - Only show on desktop */}
      {!isMobile && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Press Enter to send • Shift+Enter for new line
        </div>
      )}
    </div>
  );
};

export default ChatInput;