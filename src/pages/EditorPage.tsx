import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import ResumePreview from "../components/ResumePreview";
import Navbar from "../components/Navbar";
import api from "../api/api";
import {
  getConversationTitles,
  getLatestConversation,
  getConversationById,
} from "../api/conversations";
import type { ConversationMessage } from "../types/conversations";

const EditorPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const templateKey = searchParams.get("template");
  const category = searchParams.get("category");
  const urlConversationId = searchParams.get("conversation");

  const [resumeJson, setResumeJson] = useState<any>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(
    urlConversationId
  );
  const [conversationList, setConversationList] = useState<
    { id: string; title: string; updatedAt?: string }[]
  >([]);
  const [previewJson, setPreviewJson] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeConversation = (messages: any[] = []): ConversationMessage[] =>
    messages.map((m) => {
      if (m.role === "user") {
        return { role: "user", type: m.type || "ask", text: m.content };
      }
  
      // AI message
      if (m.type === "ask") {
        return { role: "ai", type: "ask", text: m.content };
      }
  
      // Edit message - parse stringified JSON
      if (m.type === "edit") {
        try {
          const parsed = typeof m.content === "string" ? JSON.parse(m.content) : m.content;
          return {
            role: "ai",
            type: "edit",
            message: parsed,
            text: parsed.messageinfo
          };
        } catch (err) {
          console.error("Failed to parse edit message:", err);
          return {
            role: "ai",
            type: "edit",
            text: m.content || "Edit message"
          };
        }
      }
  
      return { role: "ai", type: "ask", text: m.content };
    });

  /** Load resume */
  useEffect(() => {
    if (!templateKey || !category) return;

    api.get(`/resume/${templateKey}?category=${category}`).then((res) => {
      setResumeJson(res.data.resumeJson);
      setLoading(false);
    });
  }, [templateKey, category]);

  /** Load titles + auto-open latest */
  useEffect(() => {
    if (!templateKey) return;

    getConversationTitles(templateKey).then(async (titles = []) => {
      setConversationList(titles);

      if (!conversationId && titles.length > 0) {
        const latest = await getLatestConversation(templateKey);
        if (!latest) return;

        setConversationId(latest.conversationId);
        setConversation(normalizeConversation(latest.messages));

        setSearchParams({
          template: templateKey,
          category: category || "",
          conversation: latest.conversationId,
        });
      }
    });
  }, [templateKey]);

  /** Load conversation when selected */
  useEffect(() => {
    if (!templateKey || !conversationId) return;

    getConversationById(templateKey, conversationId).then((c) => {
      setConversation(normalizeConversation(c.messages));
    });
  }, [templateKey, conversationId]);

  const handleSelectConversation = (id: string | null) => {
    setConversationId(id);
    setPreviewJson(null);
    if (id) {
      setSearchParams({ template: templateKey!, category: category || "", conversation: id });
    } else {
      setConversation([]);
      setSearchParams({ template: templateKey!, category: category || "" });
    }
  };

  const handleConversationCreated = (meta: { id: string; title: string }) => {
    setConversationId(meta.id);
    setConversationList((p) =>
      p.some((c) => c.id === meta.id) ? p : [meta, ...p]
    );
    setSearchParams({ template: templateKey!, category: category || "", conversation: meta.id });
  };

  if (loading || !resumeJson) {
    return <div className="h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="w-full h-screen flex bg-[#eef3fb] overflow-hidden">
      {/* Left side - Chat Panel with Navbar */}
      <div className="w-1/2 h-full flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 overflow-hidden">
          <ChatPanel
            conversation={conversation}
            setConversation={setConversation}
            resumeJson={resumeJson}
            setResumeJson={setResumeJson}
            setPreviewJson={setPreviewJson}
            templateKey={templateKey}
            category={category}
            conversationId={conversationId}
            conversationList={conversationList ?? []}
            onSelectConversation={handleSelectConversation}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>

      {/* Right side - Full Resume Preview */}
      <div className="w-1/2 h-full bg-[#f5f7fb]">
        <ResumePreview 
          resumeJson={resumeJson} 
          editMode={false} 
          templateKey={templateKey}
          category={category}
          previewJson={previewJson}
          isPreviewMode={!!previewJson}
        />
      </div>
    </div>
  );
};

export default EditorPage;