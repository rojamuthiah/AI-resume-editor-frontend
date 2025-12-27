import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import ChatInput from "./chatInput";
import TypingIndicator from "./typingIndicator";
import { askAI, editAI } from "../api/ai";
import type { ConversationMessage } from "../types/conversations";

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
      let res;
      if (mode === "ask") {
        res = await askAI(text, resumeJson, templateKey, conversationId);
        setConversation((prev) => [
          ...prev,
          { role: "ai", type: "ask", text: res.message },
        ]);
      } else {
        // Edit mode - call editAI without resumeJson
        res = await editAI(text, templateKey, conversationId);
        setConversation((prev) => [
          ...prev,
          { 
            role: "ai", 
            type: "edit", 
            message: res.message,
            text: res.message.messageinfo 
          },
        ]);
      }
  
      // Handle new conversation creation
      if (!conversationId && res.conversationId) {
        onConversationCreated({
          id: res.conversationId,
          title: res.title || text.slice(0, 80),
        });
      }
    } catch (err) {
      console.error("Send message error:", err);
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
              className={`max-w-[85%] text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3"
                  : "bg-white text-gray-800 border rounded-2xl rounded-bl-sm shadow-sm"
              }`}
            >
              {m.role === "user" ? (
                // User message
                <div className="px-4 py-3">{m.text}</div>
              ) : m.type === "edit" && m.message ? (
                // EDIT MESSAGE DISPLAY
                <div className="p-4 space-y-4">
                  {/* AI Message Info */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <p className="text-sm text-gray-800 font-medium">{m.message.messageinfo}</p>
                  </div>

                  {/* Keywords Box (only if present) */}
                  {m.message.keywords && m.message.keywords.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-800 mb-2">ATS Keywords Matched:</p>
                      <div className="flex flex-wrap gap-2">
                        {m.message.keywords.map((keyword: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Edits Box */}
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Edits:</p>
                    
                    {m.message.keys.map((key: string) => {
                      const edit = m.message.edits[key];
                      if (!edit) return null;

                      return (
                        <div key={key} className="border rounded-lg p-4 bg-gray-50">
                          <p className="text-sm font-semibold text-blue-700 mb-3 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>

                          {/* Before */}
                          <div className="mb-3">
                            <p className="text-xs font-medium text-red-600 mb-2">Before:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 bg-red-50 p-2 rounded">
                              {edit.before.map((point: string, idx: number) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          </div>

                          {/* After */}
                          <div className="mb-3">
                            <p className="text-xs font-medium text-green-600 mb-2">After:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 bg-green-50 p-2 rounded">
                              {edit.after.map((point: string, idx: number) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => {
                                // Preview handler - to be implemented
                                console.log("Preview clicked for", key);
                              }}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => {
                                // Accept handler - to be implemented
                                console.log("Accept clicked for", key);
                              }}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // ASK MESSAGE (markdown rendering)
                <div className="px-4 py-3">
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
                    {m.text || ""}
                  </ReactMarkdown>
                </div>
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