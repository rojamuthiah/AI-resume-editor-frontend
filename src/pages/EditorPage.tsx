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
  const [conversationId, setConversationId] = useState<string | null>(urlConversationId);
  const [conversationList, setConversationList] = useState<
    { id: string; title: string; updatedAt?: string }[]
  >([]);
  const [previewJson, setPreviewJson] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  /** ✅ MOBILE STATE */
  const [isMobile, setIsMobile] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  /** Detect screen size */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const normalizeConversation = (messages: any[] = []): ConversationMessage[] =>
    messages.map((m) => {
      if (m.role === "user") {
        return { role: "user", type: m.type || "ask", text: m.content };
      }
      if (m.type === "ask") {
        return { role: "ai", type: "ask", text: m.content };
      }
      if (m.type === "edit") {
        try {
          const parsed = typeof m.content === "string" ? JSON.parse(m.content) : m.content;
          return {
            role: "ai",
            type: "edit",
            message: parsed,
            text: parsed.messageinfo,
          };
        } catch {
          return { role: "ai", type: "edit", text: m.content };
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

  /** Load selected conversation */
  useEffect(() => {
    if (!templateKey || !conversationId) return;
    getConversationById(templateKey, conversationId).then((c) => {
      setConversation(normalizeConversation(c.messages));
    });
  }, [templateKey, conversationId]);

  if (loading || !resumeJson) {
    return <div className="h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col bg-[#eef3fb] overflow-hidden">
      <Navbar />

      {/* ================= MOBILE LAYOUT ================= */}
      {isMobile ? (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* PREVIEW SECTION */}
          {isPreviewOpen && (
            <div className="flex-shrink-0 h-[50vh] bg-[#f5f7fb] border-b relative overflow-hidden">
              <ResumePreview
                resumeJson={resumeJson}
                editMode={false}
                templateKey={templateKey}
                category={category}
                previewJson={previewJson}
                isPreviewMode={!!previewJson}
              />

              {/* Collapse button */}
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white shadow px-4 py-2 rounded-full text-sm z-20 hover:bg-gray-50"
              >
                Hide Preview
              </button>
            </div>
          )}

          {/* EXPAND BAR */}
          {!isPreviewOpen && (
            <div className="flex-shrink-0 bg-white border-b">
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="w-full py-3 text-sm flex justify-center items-center gap-2 hover:bg-gray-50 transition"
              >
                Show Resume Preview
              </button>
            </div>
          )}

          {/* CHAT */}
          <div className="flex-1 overflow-hidden bg-white">
            <ChatPanel
              conversation={conversation}
              setConversation={setConversation}
              resumeJson={resumeJson}
              setResumeJson={setResumeJson}
              setPreviewJson={setPreviewJson}
              templateKey={templateKey}
              category={category}
              conversationId={conversationId}
              conversationList={conversationList}
              onSelectConversation={(id) => setConversationId(id)}
              onConversationCreated={({ id }) => setConversationId(id)}
            />
          </div>

        </div>
      ) : (
        /* ================= DESKTOP LAYOUT ================= */
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 bg-white overflow-hidden">
            <ChatPanel
              conversation={conversation}
              setConversation={setConversation}
              resumeJson={resumeJson}
              setResumeJson={setResumeJson}
              setPreviewJson={setPreviewJson}
              templateKey={templateKey}
              category={category}
              conversationId={conversationId}
              conversationList={conversationList}
              onSelectConversation={(id) => setConversationId(id)}
              onConversationCreated={({ id }) => setConversationId(id)}
            />
          </div>

          <div className="w-1/2 bg-[#f5f7fb] overflow-hidden">
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
      )}
    </div>
  );
};

export default EditorPage;