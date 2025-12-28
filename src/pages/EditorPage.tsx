import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import ResumePreview from "../components/ResumePreview";
import api from "../api/api";
import {
  getConversationTitles,
  getLatestConversation,
  getConversationById,
} from "../api/conversations";
import type { ConversationMessage } from "../types/conversation";

const EditorPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const templateKey = searchParams.get("template");
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
    if (!templateKey) return;

    api.get(`/resume/${templateKey}`).then((res) => {
      setResumeJson(res.data.resumeJson);
      setLoading(false);
    });
  }, [templateKey]);

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
    if (id) {
      setSearchParams({ template: templateKey!, conversation: id });
    } else {
      setConversation([]);
      setSearchParams({ template: templateKey! });
    }
  };

  const handleConversationCreated = (meta: { id: string; title: string }) => {
    setConversationId(meta.id);
    setConversationList((p) =>
      p.some((c) => c.id === meta.id) ? p : [meta, ...p]
    );
    setSearchParams({ template: templateKey!, conversation: meta.id });
  };

  if (loading || !resumeJson) {
    return <div className="h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="w-full h-screen flex bg-[#eef3fb] overflow-hidden">
      <div className="w-1/2 h-full bg-white">
        <ChatPanel
          conversation={conversation}
          setConversation={setConversation}
          resumeJson={resumeJson}
          setResumeJson={setResumeJson}
          setPreviewJson={setPreviewJson}
          templateKey={templateKey}
          conversationId={conversationId}
          conversationList={conversationList ?? []}
          onSelectConversation={handleSelectConversation}
          onConversationCreated={handleConversationCreated}
        />
      </div>

      <div className="w-1/2 h-full bg-[#f5f7fb]">
        <ResumePreview resumeJson={previewJson || resumeJson} editMode={false} templateKey={templateKey} />
      </div>
    </div>
  );
};

export default EditorPage;
