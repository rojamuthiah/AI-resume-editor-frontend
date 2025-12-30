import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  const { resumeId } = useParams<{ resumeId: string }>();

  const [resumeJson, setResumeJson] = useState<any>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationList, setConversationList] = useState<
    { id: string; title: string; updatedAt?: string }[]
  >([]);
  const [previewJson, setPreviewJson] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  /** MOBILE */
  const [isMobile, setIsMobile] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);

  /* Detect screen */
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
          const parsed =
            typeof m.content === "string"
              ? JSON.parse(m.content)
              : m.content;
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

  /* Load resume */
  useEffect(() => {
    if (!resumeId) return;
    api.get(`/resume/${resumeId}`).then((res) => {
      setResumeJson(res.data.resumeJson);
      setLoading(false);
    });
  }, [resumeId]);

  /* Load conversations */
  useEffect(() => {
    if (!resumeId) return;

    getConversationTitles(resumeId).then(async (titles = []) => {
      setConversationList(titles);

      if (!conversationId && titles.length > 0) {
        const latest = await getLatestConversation(resumeId);
        if (!latest) return;

        setConversationId(latest.conversationId);
        setConversation(normalizeConversation(latest.messages));
      }
    });
  }, [resumeId]);

  useEffect(() => {
    if (!resumeId || !conversationId) return;

    getConversationById(resumeId, conversationId).then((c) => {
      setConversation(normalizeConversation(c.messages));
    });
  }, [resumeId, conversationId]);

  if (loading || !resumeJson) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-[#eef3fb] overflow-hidden">
      <Navbar />

      {/* ================= MOBILE ================= */}
      {isMobile ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* PREVIEW */}
          {isPreviewVisible && (
            <div className="h-[30vh] bg-[#f5f7fb] border-b relative overflow-hidden">
              <ResumePreview
                resumeId={resumeId!}
                resumeJson={resumeJson}
                editMode={false}
                previewJson={previewJson}
                isPreviewMode={!!previewJson}
              />

              {/* SMALLER BUTTONS */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                <button
                  onClick={() => setIsPreviewVisible(false)}
                  className="bg-white shadow px-3 py-1 text-xs min-w-[80px] rounded-full hover:bg-gray-50"
                >
                  Hide
                </button>

                <button
                  onClick={() => setShowFullPreview(true)}
                  className="bg-white shadow px-3 py-1 text-xs min-w-[80px] rounded-full hover:bg-gray-50"
                >
                  View
                </button>
              </div>
            </div>
          )}

          {/* SHOW PREVIEW */}
          {!isPreviewVisible && (
            <button
              onClick={() => setIsPreviewVisible(true)}
              className="py-2 border-b bg-white text-xs hover:bg-gray-50"
            >
              Show Resume Preview
            </button>
          )}

          {/* CHAT */}
          <div className="flex-1 overflow-hidden bg-white">
            <ChatPanel
              conversation={conversation}
              setConversation={setConversation}
              resumeJson={resumeJson}
              setResumeJson={setResumeJson}
              setPreviewJson={setPreviewJson}
              conversationId={conversationId}
              conversationList={conversationList}
              onSelectConversation={(id) => setConversationId(id)}
              onConversationCreated={({ id }) => setConversationId(id)}
              resumeId={resumeId}
            />
          </div>

          {/* FULL PREVIEW MODAL */}
          {showFullPreview && (
            <div className="fixed inset-0 bg-black/40 z-50">
              <div className="absolute inset-0 bg-[#f5f7fb]">
                <ResumePreview
                  resumeId={resumeId!}
                  resumeJson={resumeJson}
                  editMode={false}
                  previewJson={previewJson}
                  isPreviewMode={!!previewJson}
                />

                <button
                  onClick={() => setShowFullPreview(false)}
                  className="absolute top-14 left-1/2 -translate-x-1/2
                             bg-white shadow px-4 py-1 text-xs rounded-full hover:bg-gray-50"
                >
                  ✕ Close
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= DESKTOP ================= */
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 bg-white overflow-hidden">
            <ChatPanel
              conversation={conversation}
              setConversation={setConversation}
              resumeJson={resumeJson}
              setResumeJson={setResumeJson}
              setPreviewJson={setPreviewJson}
              conversationId={conversationId}
              conversationList={conversationList}
              onSelectConversation={(id) => setConversationId(id)}
              onConversationCreated={({ id }) => setConversationId(id)}
              resumeId={resumeId}
            />
          </div>

          <div className="w-1/2 bg-[#f5f7fb] overflow-hidden">
            <ResumePreview
              resumeId={resumeId!}
              resumeJson={resumeJson}
              editMode={false}
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
