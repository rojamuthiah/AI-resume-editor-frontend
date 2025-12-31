import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import ResumeHtmlPreview from "../components/ResumeHtmlPreview";
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

  /** 🔑 FORCE PREVIEW REFRESH */
  const [resumeVersion, setResumeVersion] = useState(0);

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
    <div className="w-full h-screen flex bg-[#eef3fb] overflow-hidden">

      {/* ================= MOBILE ================= */}
      {isMobile ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />

          {isPreviewVisible && (
            <div className="h-[30vh] bg-[#f5f7fb] border-b relative overflow-hidden">
              <ResumeHtmlPreview
                resumeId={resumeId!}
                previewJson={previewJson}
                version={resumeVersion}
              />

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                <button
                  onClick={() => setIsPreviewVisible(false)}
                  className="bg-white shadow px-3 py-1 text-xs rounded-full"
                >
                  Hide
                </button>
                <button
                  onClick={() => setShowFullPreview(true)}
                  className="bg-white shadow px-3 py-1 text-xs rounded-full"
                >
                  View
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 bg-white overflow-hidden">
            <ChatPanel
              conversation={conversation}
              setConversation={setConversation}
              resumeJson={resumeJson}
              setResumeJson={setResumeJson}
              setPreviewJson={setPreviewJson}
              conversationId={conversationId}
              conversationList={conversationList}
              onSelectConversation={setConversationId}
              onConversationCreated={({ id }) => setConversationId(id)}
              resumeId={resumeId}
              onAccept={() => setResumeVersion((v) => v + 1)}
            />
          </div>

          {showFullPreview && (
            <div className="fixed inset-0 bg-black/40 z-50">
              <div className="absolute inset-0 bg-[#f5f7fb]">
                <ResumeHtmlPreview
                  resumeId={resumeId!}
                  previewJson={previewJson}
                  version={resumeVersion}
                />
                <button
                  onClick={() => setShowFullPreview(false)}
                  className="absolute top-14 left-1/2 -translate-x-1/2 bg-white shadow px-4 py-1 text-xs rounded-full"
                >
                  ✕ Close
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= DESKTOP ================= */
        <>
          {/* LEFT — CHAT + NAVBAR */}
          <div className="w-1/2 flex flex-col bg-white overflow-hidden">
            <Navbar />

            <div className="flex-1 overflow-hidden">
              <ChatPanel
                conversation={conversation}
                setConversation={setConversation}
                resumeJson={resumeJson}
                setResumeJson={setResumeJson}
                setPreviewJson={setPreviewJson}
                conversationId={conversationId}
                conversationList={conversationList}
                onSelectConversation={setConversationId}
                onConversationCreated={({ id }) => setConversationId(id)}
                resumeId={resumeId}
                onVersionBump={() => setResumeVersion((v) => v + 1)}
              />
            </div>
          </div>

          {/* RIGHT — FULL HEIGHT PREVIEW */}
          <div className="w-1/2 bg-[#f5f7fb] overflow-hidden">
            <ResumeHtmlPreview
              resumeId={resumeId!}
              previewJson={previewJson}
              version={resumeVersion}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default EditorPage;
