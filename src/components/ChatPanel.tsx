import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChatInput from "./chatInput";
import { askAI, editAI, acceptEdit } from "../api/ai";

export type ConversationMessage = {
  role: "user" | "ai";
  type: "ask" | "edit";
  text?: string;
  message?: string;
  sections?: any[];
  previewJson?: any;
  collapsed?: boolean;
};

interface ChatPanelProps {
  conversation: ConversationMessage[];
  setConversation: React.Dispatch<React.SetStateAction<ConversationMessage[]>>;
  resumeJson: any;
  setResumeJson: React.Dispatch<React.SetStateAction<any>>;
  setPreviewJson: React.Dispatch<React.SetStateAction<any | null>>;
  templateKey: string | null;
  conversationId: string | null;
  conversationList: { id: string; title: string; updatedAt?: string }[];
  onSelectConversation: (id: string | null) => void;
  onConversationCreated: (meta: { id: string; title: string }) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  conversation,
  setConversation,
  resumeJson,
  setResumeJson,
  setPreviewJson,
  templateKey,
  conversationId,
  conversationList,
  onSelectConversation,
  onConversationCreated,
}) => {
  const [mode, setMode] = useState<"ask" | "edit">("ask");
  const [loading, setLoading] = useState(false);
  const [acceptingIndex, setAcceptingIndex] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /** Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, loading]);

  /** Close dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const RobotIcon = () => (
    <div className="w-10 h-10 bg-gray-200 border flex items-center justify-center rounded-full shadow-sm">
      <svg width="22" height="22" strokeWidth="1.6" fill="none" stroke="black" viewBox="0 0 24 24">
        <path d="M12 2v2" />
        <rect x="4" y="6" width="16" height="14" rx="3" />
        <circle cx="9" cy="13" r="1.6" />
        <circle cx="15" cy="13" r="1.6" />
        <path d="M8 17h8" />
      </svg>
    </div>
  );

  const sendMessage = async (text: string) => {
    if (!text.trim() || !templateKey) return;

    setConversation((prev) => [...prev, { role: "user", text, type: mode }]);
    setPreviewJson(null);
    setLoading(true);

    const currentConversationId = conversationId ?? null;

    try {
      if (mode === "ask") {
        const res = await askAI(text, resumeJson, templateKey, currentConversationId);

        setConversation((prev) => [
          ...prev,
          { role: "ai", type: "ask", text: res.message },
        ]);

        if (!currentConversationId && res.conversationId) {
          onConversationCreated({
            id: res.conversationId,
            title: res.title || text.slice(0, 80),
          });
        }
      } else {
        const result = await editAI(text, resumeJson, templateKey, currentConversationId);

        let preview = { ...resumeJson };
        result.sections.forEach((s: any) => {
          preview[s.name] = s.new[s.name];
        });

        setConversation((prev) => [
          ...prev,
          {
            role: "ai",
            type: "edit",
            message: result.message,
            sections: result.sections,
            previewJson: preview,
          },
        ]);

        if (!currentConversationId && result.conversationId) {
          onConversationCreated({
            id: result.conversationId,
            title: result.title || text.slice(0, 80),
          });
        }
      }
    } catch (err) {
      console.error("chat err", err);
    }

    setLoading(false);
  };

  const computePreview = (msg: ConversationMessage): any | null => {
    if (msg.previewJson) return msg.previewJson;
    if (!resumeJson || !msg.sections) return null;

    const merged = { ...resumeJson };
    msg.sections.forEach((section) => {
      if (section?.name && section.new?.[section.name] !== undefined) {
        merged[section.name] = section.new[section.name];
      }
    });
    return merged;
  };

  const handlePreview = (msg: ConversationMessage, index: number) => {
    const previewData = computePreview(msg);
    if (!previewData) return;

    setPreviewJson(previewData);

    if (!msg.previewJson) {
      setConversation((prev) =>
        prev.map((m, idx) => (idx === index ? { ...m, previewJson: previewData } : m))
      );
    }
  };

  const handleAccept = async (msg: ConversationMessage, index: number) => {
    if (!templateKey) return;
    const previewData = computePreview(msg);
    if (!previewData) return;

    setAcceptingIndex(index);
    try {
      const result = await acceptEdit(previewData, templateKey, conversationId ?? null);
      setResumeJson(result.resumeJson || previewData);
      setPreviewJson(null);
    } catch (err) {
      console.error("Accept edit error:", err);
    } finally {
      setAcceptingIndex(null);
    }
  };

  const handleDecline = (index: number) => {
    setPreviewJson(null);
    setConversation((prev) =>
      prev.map((msg, idx) => (idx === index ? { ...msg, collapsed: true } : msg))
    );
  };

  const reopenSuggestion = (index: number) => {
    setConversation((prev) =>
      prev.map((msg, idx) => (idx === index ? { ...msg, collapsed: false } : msg))
    );
  };

  const renderMessage = (msg: any, i: number) => {
    if (msg.role === "user") {
      return (
        <div key={i} className="flex items-end gap-3 justify-end">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-xl rounded-br-none max-w-[70%] text-sm shadow leading-relaxed">
            {msg.text}
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shadow">
            U
          </div>
        </div>
      );
    }

    if (msg.role === "ai" && msg.type === "ask") {
      return (
        <div key={i} className="flex items-start gap-3">
          <RobotIcon />
          <div className="bg-gray-100 px-4 py-3 rounded-xl rounded-bl-none max-w-[80%] text-sm shadow leading-relaxed prose prose-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
          </div>
        </div>
      );
    }

    if (msg.role === "ai" && msg.type === "edit") {
      if (msg.collapsed) {
        return (
          <div key={i} className="flex items-start gap-3 cursor-pointer opacity-80" onClick={() => reopenSuggestion(i)}>
            <RobotIcon />
            <div className="bg-gray-100 px-4 py-2 rounded-xl border border-dashed text-sm text-gray-600">
              Suggestion dismissed. Click to reopen.
            </div>
          </div>
        );
      }

      return (
        <div key={i} className="flex items-start gap-3">
          <RobotIcon />
          <div className="bg-gray-50 p-4 rounded-xl border w-full max-w-[80%] text-sm shadow">
            <p className="font-semibold mb-3">{msg.message}</p>
            {msg.sections.map((sec: any, idx: number) => (
              <div key={idx} className="mb-4 p-3 bg-white rounded border shadow-sm">
                <p className="text-blue-700 font-semibold uppercase tracking-wide mb-1">{sec.name}</p>
                <p className="text-red-600 font-medium mt-1">OLD</p>
                <pre className="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap mb-2">
                  {JSON.stringify(sec.old[sec.name], null, 2)}
                </pre>
                <p className="text-green-600 font-medium">NEW</p>
                <pre className="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap">
                  {JSON.stringify(sec.new[sec.name], null, 2)}
                </pre>
              </div>
            ))}
            <div className="flex gap-3 mt-3">
              <button onClick={() => handlePreview(msg, i)} className="px-3 py-1 bg-blue-600 text-white rounded">
                Preview
              </button>
              <button
                onClick={() => handleAccept(msg, i)}
                disabled={acceptingIndex === i}
                className={`px-3 py-1 rounded text-white ${acceptingIndex === i ? "bg-green-400 cursor-not-allowed" : "bg-green-600"}`}
              >
                {acceptingIndex === i ? "Saving..." : "Accept"}
              </button>
              <button onClick={() => handleDecline(i)} className="px-3 py-1 bg-red-600 text-white rounded">
                Decline
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const currentConversation = conversationList.find((c) => c.id === conversationId);

  return (
    <div className="flex flex-col h-full bg-white border-r">
      {/* HEADER */}
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI Resume Assistant</h2>

        {/* Conversation Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {currentConversation?.title.slice(0, 25) || "New conversation"}
              {currentConversation?.title && currentConversation.title.length > 25 ? "..." : ""}
            </span>
            <svg className={`w-4 h-4 text-gray-600 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              <button
                onClick={() => {
                  onSelectConversation(null);
                  setDropdownOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b flex items-center gap-2"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium text-blue-600">New Conversation</span>
              </button>

              {conversationList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectConversation(c.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b transition ${
                    c.id === conversationId ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900 truncate">{c.title}</div>
                  {c.updatedAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </button>
              ))}

              {conversationList.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No conversations yet. Start a new one!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {conversation.map((m, i) => renderMessage(m, i))}

        {loading && (
          <div className="flex items-start gap-3">
            <RobotIcon />
            <div className="bg-gray-100 px-3 py-2 rounded-xl shadow">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <ChatInput mode={mode} setMode={setMode} loading={loading} onSend={sendMessage} />
    </div>
  );
};

export default ChatPanel;