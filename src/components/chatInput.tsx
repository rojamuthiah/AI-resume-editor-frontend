import React, { useState, useRef, useEffect } from "react";

type ChatMode = "ask" | "edit";

interface ChatInputProps {
  mode: ChatMode;
  setMode: React.Dispatch<React.SetStateAction<ChatMode>>;
  onSend: (text: string) => void;
  loading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ mode, setMode, onSend, loading }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
  }, [input]);

  // Handle Enter vs Shift+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
    <div className="p-4 border-t bg-gradient-to-b from-white to-gray-50">
      
      {/* MODE SELECTOR */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-gray-500">Mode:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode("ask")}
            className={`
              px-4 py-1.5 rounded-md text-sm font-medium transition-all
              ${mode === "ask" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ask
            </div>
          </button>
          
          <button
            onClick={() => setMode("edit")}
            className={`
              px-4 py-1.5 rounded-md text-sm font-medium transition-all
              ${mode === "edit" 
                ? "bg-white text-green-600 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </div>
          </button>
        </div>
      </div>

      {/* INPUT CONTAINER */}
      <div className="flex items-end gap-3">
        
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
              w-full bg-white p-3 pr-12 rounded-xl text-sm
              border-2 resize-none leading-relaxed
              focus:outline-none focus:border-blue-500
              transition-all duration-200
              ${loading ? "bg-gray-50 cursor-not-allowed" : ""}
              ${mode === "ask" ? "border-blue-200" : "border-green-200"}
            `}
            style={{ maxHeight: '160px' }}
          />
          
          {/* Character count (optional) */}
          {input.length > 0 && (
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
            w-12 h-12 rounded-xl flex items-center justify-center
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
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* HINT TEXT */}
      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Press Enter to send • Shift+Enter for new line
      </div>
    </div>
  );
};

export default ChatInput;