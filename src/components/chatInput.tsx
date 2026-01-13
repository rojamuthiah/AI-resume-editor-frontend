import React, { useState, useRef, useEffect } from "react";

type ChatMode = "ask" | "edit" | "analyse";

interface ChatInputProps {
  mode: ChatMode;
  setMode: React.Dispatch<React.SetStateAction<ChatMode>>;
  onSend: (text: string) => void;
  loading: boolean;
  showChatHistory: boolean;
  setShowChatHistory: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  mode, 
  setMode, 
  onSend, 
  loading,
  showChatHistory,
  setShowChatHistory,
  disabled = false
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
    const maxHeight = isMobile ? 100 : 160;
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, maxHeight) + "px";
  }, [input, isMobile]);

  // Handle Enter vs Shift+Enter (desktop only)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      !isMobile &&
      e.key === "Enter" &&
      !e.shiftKey &&
      !disabled
    ) {
      e.preventDefault();
      if (!loading && input.trim()) {
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className={`border-t bg-gradient-to-b from-white to-gray-50 ${isMobile ? "p-2" : "p-4"}`}>
      
      {/* MODE SELECTOR WITH CHAT HISTORY TOGGLE */}
      <div className={`flex items-center justify-between ${isMobile ? "mb-2" : "mb-3"}`}>
        <div className="flex items-center gap-2">
          {!isMobile && (
            <span className="text-xs font-medium text-gray-500">Mode:</span>
          )}

          <div className={`flex bg-gray-100 rounded-lg ${isMobile ? "p-0.5" : "p-1"}`}>
            {/* ASK */}
            <button
              onClick={() => setMode("ask")}
              className={`
                ${isMobile ? "px-2 py-1" : "px-4 py-1.5"}
                rounded-md ${isMobile ? "text-xs" : "text-sm"} font-medium transition-all
                ${mode === "ask"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"}
              `}
            >
              <div className="flex items-center gap-1">
                <svg className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3
                    0 1.4-1.278 2.575-3.006 2.907
                    -.542.104-.994.54-.994 1.093m0 3h.01
                    M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Ask
              </div>
            </button>

            {/* EDIT */}
            <button
              onClick={() => setMode("edit")}
              className={`
                ${isMobile ? "px-2 py-1" : "px-4 py-1.5"}
                rounded-md ${isMobile ? "text-xs" : "text-sm"} font-medium transition-all
                ${mode === "edit"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"}
              `}
            >
              <div className="flex items-center gap-1">
                <svg className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11
                    a2 2 0 002-2v-5m-1.414-9.414
                    a2 2 0 112.828 2.828L11.828 15H9v-2.828
                    l8.586-8.586z"
                  />
                </svg>
                Edit
              </div>
            </button>

            {/* ANALYSE */}
            <button
              onClick={() => setMode("analyse")}
              className={`
                ${isMobile ? "px-2 py-1" : "px-4 py-1.5"}
                rounded-md ${isMobile ? "text-xs" : "text-sm"} font-medium transition-all
                ${mode === "analyse"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"}
              `}
            >
              Analyse
            </button>
          </div>
        </div>

        {/* Chat History Toggle (EYE ICON KEPT) */}
        <button
          onClick={() => setShowChatHistory(!showChatHistory)}
          className={`flex items-center gap-1 ${isMobile ? "px-2 py-1" : "px-3 py-1.5"}
            rounded-md ${isMobile ? "text-xs" : "text-sm"}
            font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all`}
        >
          <svg className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showChatHistory ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z
                M2.458 12C3.732 7.943 7.523 5 12 5
                c4.478 0 8.268 2.943 9.542 7
                -1.274 4.057-5.064 7-9.542 7
                -4.477 0-8.268-2.943-9.542-7z"
              />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19
                c-4.478 0-8.268-2.943-9.543-7
                a9.97 9.97 0 011.563-3.029m5.858.908
                a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242
                M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29
                M3 3l3.59 3.59"
              />
            )}
          </svg>
          {!isMobile && <span className="text-xs">Chat History</span>}
        </button>
      </div>

      
      {/* INPUT CONTAINER */}
{!disabled && (
  <div className={`flex items-center ${isMobile ? "gap-2" : "gap-3"}`}>
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
            : mode === "edit"
            ? "Describe the changes you want to make..."
            : "Analysis mode is active"
        }
        className={`
          w-full bg-white ${isMobile ? "p-2 text-xs" : "p-3 text-sm"}
          rounded-xl border-2 resize-none leading-relaxed
          focus:outline-none focus:border-blue-500 transition-all
          ${loading ? "bg-gray-50 cursor-not-allowed" : ""}
          ${
            mode === "ask"
              ? "border-blue-200"
              : mode === "edit"
              ? "border-green-200"
              : "border-purple-200"
          }
        `}
      />
    </div>
    
    {/* SEND BUTTON WITH PAPER PLANE ICON */}
    <button
      onClick={handleSend}
      disabled={loading || !input.trim()}
      className={`
        ${isMobile ? "h-9 w-9" : "h-11 w-11"} flex items-center justify-center
        rounded-xl transition-all
        ${loading || !input.trim()
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 active:scale-95"}
      `}
    >
      <svg 
        className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-white`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>
    </button>
  </div>
)}
    </div>
  );
};

export default ChatInput;