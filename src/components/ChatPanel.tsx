import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import ChatInput from "./chatInput";
import TypingIndicator from "./TypingIndicator";
import Toast from "./Toast";
import ConversationDropdown from "./ConversationDropdown";
import { askAI, editAI, acceptEdit, revertEdit } from "../api/ai";
import type { ChatPanelProps } from "../types/conversations";

const ChatPanel: React.FC<ChatPanelProps> = ({
  conversation,
  setConversation,
  resumeJson,
  setResumeJson,
  setPreviewJson,
  templateKey,
  category,
  conversationId,
  conversationList,
  onSelectConversation,
  onConversationCreated,
}) => {
  const [mode, setMode] = useState<"ask" | "edit">("ask");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [previewingSection, setPreviewingSection] = useState<string | null>(null);
  const [showChatHistory, setShowChatHistory] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, loading]);

  const handlePreview = (sectionKey: string, afterJson: any) => {
    const previewData = {
      ...resumeJson,
      [sectionKey]: afterJson
    };
    
    setPreviewJson(previewData);
    setPreviewingSection(sectionKey);
  };

  const handleDismissPreview = () => {
    setPreviewJson(null);
    setPreviewingSection(null);
  };

  const handleAccept = async (
    sectionKey: string, 
    editData: { before: string[]; after: string[]; beforeJson: any; afterJson: any }, 
    messageIndex: number
  ) => {
    if (!templateKey || !category) return;

    try {
      if (previewingSection === sectionKey) {
        handleDismissPreview();
      }

      const sectionData = editData.afterJson;
      
      const res = await acceptEdit(
        sectionKey, 
        sectionData, 
        editData.beforeJson, 
        templateKey,
        category
      );
      
      if (!res.success) {
        setToast({
          message: res.message || "Failed to accept edit",
          type: "error"
        });
        return;
      }
      
      setResumeJson(res.resumeJson);
      
      setConversation((prev) =>
        prev.map((msg, idx) => 
          idx === messageIndex && msg.type === "edit" && msg.message
            ? { 
                ...msg, 
                message: { 
                  ...msg.message, 
                  acceptedSections: [...(msg.message.acceptedSections || []), sectionKey] 
                } 
              }
            : msg
        )
      );

      setToast({
        message: `Successfully updated ${sectionKey}`,
        type: "success"
      });
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || "Failed to accept edit",
        type: "error"
      });
    }
  };

  const handleRevert = async (
    sectionKey: string,
    editData: { before: string[]; beforeJson: any },
    messageIndex: number
  ) => {
    if (!templateKey || !category) return;

    try {
      const res = await revertEdit(
        sectionKey, 
        editData.beforeJson, 
        templateKey,
        category
      );
      
      if (!res.success) {
        setToast({
          message: res.message || "Revert is not possible",
          type: "error"
        });
        return;
      }
      
      setResumeJson(res.resumeJson);
      
      setConversation((prev) =>
        prev.map((msg, idx) => 
          idx === messageIndex && msg.type === "edit" && msg.message
            ? { 
                ...msg, 
                message: { 
                  ...msg.message, 
                  acceptedSections: (msg.message.acceptedSections || []).filter((s: string) => s !== sectionKey)
                } 
              }
            : msg
        )
      );

      setToast({
        message: `Reverted ${sectionKey}`,
        type: "success"
      });
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || "Revert is not possible",
        type: "error"
      });
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !templateKey || !category) return;
  
    setConversation((prev) => [
      ...prev,
      { role: "user", type: mode, text },
    ]);
  
    setPreviewJson(null);
    setPreviewingSection(null);
    setLoading(true);

    try {
      let res;
      if (mode === "ask") {
        res = await askAI(text, resumeJson, templateKey, category, conversationId);
        setConversation((prev) => [
          ...prev,
          { role: "ai", type: "ask", text: res.message },
        ]);
      } else {
        res = await editAI(text, templateKey, category, conversationId);
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
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Dismiss Preview Button - Fixed Position */}
      {previewingSection && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleDismissPreview}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-900 transition flex items-center gap-2"
          >
            <span>✕</span>
            <span>Dismiss Preview</span>
          </button>
        </div>
      )}

      {/* ================= HEADER WITH DROPDOWN ================= */}
      {showChatHistory && (
        <div className="px-4 py-3 border-b bg-white">
          <ConversationDropdown
            isOpen={dropdownOpen}
            onClose={() => setDropdownOpen(false)}
            currentConversationId={conversationId}
            conversationList={conversationList}
            onSelectConversation={onSelectConversation}
            currentConversationTitle={currentConversation?.title || null}
          />
        </div>
      )}

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
                <div className="px-4 py-3">{m.text}</div>
              ) : m.type === "edit" && m.message ? (
                // EDIT MESSAGE DISPLAY
                <div className="p-4 space-y-4">
                  {/* AI Message Info */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <p className="text-sm text-gray-800 font-medium">{m.message.messageinfo}</p>
                  </div>

                  {/* Keywords Box */}
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

                      const isAccepted = m.message.acceptedSections?.includes(key);
                      const isPreviewing = previewingSection === key;

                      return (
                        <div key={key} className={`border rounded-lg p-4 ${
                          isAccepted ? "bg-green-50 border-green-300" : 
                          isPreviewing ? "bg-blue-50 border-blue-300" : 
                          "bg-gray-50"
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-blue-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            {isAccepted && (
                              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                                ✓ Accepted
                              </span>
                            )}
                            {isPreviewing && (
                              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                👁 Previewing
                              </span>
                            )}
                          </div>

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
                            {!isAccepted ? (
                              <>
                                <button
                                  onClick={() => handlePreview(key, edit.afterJson)}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                                >
                                  Preview
                                </button>
                                <button
                                  onClick={() => handleAccept(key, edit, i)}
                                  className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                >
                                  Accept
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleRevert(key, edit, i)}
                                className="px-3 py-1.5 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition"
                              >
                                Revert
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // ASK MESSAGE
                <div className="px-4 py-3">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                      p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ================= INPUT ================= */}
      <ChatInput
        mode={mode}
        setMode={setMode}
        loading={loading}
        onSend={sendMessage}
        showChatHistory={showChatHistory}
        setShowChatHistory={setShowChatHistory}
      />
    </div>
  );
};

export default ChatPanel;