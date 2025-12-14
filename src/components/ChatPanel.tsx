import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import ChatInput from "./chatInput";
import { askAI, editAI } from "../api/ai";
import type { ConversationMessage } from "../types/conversation";

interface ChatPanelProps {
  conversation: ConversationMessage[];
  setConversation: React.Dispatch<React.SetStateAction<ConversationMessage[]>>;
  resumeJson: any;
  setPreviewJson: React.Dispatch<React.SetStateAction<any | null>>;
  templateKey: string | null;
  conversationId: string | null;
  conversationList: { id: string; title: string }[];
  onSelectConversation: (id: string | null) => void;
  onConversationCreated: (meta: { id: string; title: string }) => void;
}

/* =======================
   AI TYPING INDICATOR
======================= */
const TypingIndicator = () => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow">
      AI
    </div>

    <div className="bg-white border rounded-2xl px-4 py-3 shadow-sm">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

const ChatPanel: React.FC<ChatPanelProps> = ({
  conversation,
  setConversation,
  resumeJson,
  setPreviewJson,
  templateKey,
  conversationId,
  conversationList,
  onSelectConversation,
  onConversationCreated,
}) => {
  const [mode, setMode] = useState<"ask" | "edit">("ask");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, loading]);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !templateKey) return;

    setConversation((prev) => [
      ...prev,
      { role: "user", type: mode, text },
    ]);

    setPreviewJson(null);
    setLoading(true);

    try {
      const res =
        mode === "ask"
          ? await askAI(text, resumeJson, templateKey, conversationId)
          : await editAI(text, resumeJson, templateKey, conversationId);

      setConversation((prev) => [
        ...prev,
        { role: "ai", type: mode, text: res.message },
      ]);

      if (!conversationId && res.conversationId) {
        onConversationCreated({
          id: res.conversationId,
          title: res.title || text.slice(0, 80),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const currentConversation = conversationList.find(
    (c) => c.id === conversationId
  );

  return (
    <div className="flex flex-col h-full bg-white border-r">
      {/* ================= HEADER ================= */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-white">
        <div>
          <h2 className="font-semibold text-gray-800">AI Resume Assistant</h2>
          <p className="text-xs text-gray-500">Ask or edit your resume</p>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm bg-gray-50 hover:bg-gray-100 max-w-[260px]"
          >
            <span className="truncate">
              {currentConversation?.title || "New conversation"}
            </span>
            <span className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-50">
              <button
                onClick={() => {
                  onSelectConversation(null);
                  setDropdownOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-blue-600 font-medium hover:bg-blue-50 border-b"
              >
                + New Conversation
              </button>

              <div className="max-h-72 overflow-y-auto">
                {conversationList.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectConversation(c.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm truncate ${
                      c.id === conversationId
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= CHAT ================= */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-gray-50">
        {conversation.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* AI Avatar */}
            {m.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow">
                AI
              </div>
            )}

            {/* MESSAGE BUBBLE */}
            <div
              className={`max-w-[70%] px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                  : "bg-white text-gray-800 border rounded-2xl rounded-bl-sm shadow-sm"
              }`}
            >
              {m.role === "ai" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 mb-3 space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li>{children}</li>,
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              ) : (
                m.text
              )}
            </div>

            {/* User Avatar */}
            {m.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* ================= INPUT ================= */}
      <ChatInput
        mode={mode}
        setMode={setMode}
        loading={loading}
        onSend={sendMessage}
      />
    </div>
  );
};

export default ChatPanel;
