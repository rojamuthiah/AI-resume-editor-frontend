import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ChatPanel, { type ConversationMessage } from "../components/ChatPanel";
import ResumePreview from "../components/ResumePreview";
import api from "../api/api";

const EditorPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const templateKey = searchParams.get("template");
  const initialConversationId = searchParams.get("conversation");

  const [resumeJson, setResumeJson] = useState<any>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [conversationList, setConversationList] = useState<
    { id: string; title: string; updatedAt?: string }[]
  >([]);
  const [editMode, setEditMode] = useState(false);
  const [previewJson, setPreviewJson] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeConversation = (messages: any[] = []): ConversationMessage[] =>
    messages
      .map((msg) => {
        if (msg.role === "user") {
          return { role: "user", type: msg.type || "ask", text: msg.content };
        }

        if (msg.role === "assistant" && msg.type === "ask") {
          return { role: "ai", type: "ask", text: msg.content };
        }

        if (msg.role === "assistant" && msg.type === "edit") {
          let parsed;
          try {
            parsed = JSON.parse(msg.content);
          } catch {
            parsed = { sections: [], message: "Resume update", previewJson: null };
          }

          return {
            role: "ai",
            type: "edit",
            message: parsed.message || "Resume update",
            sections: parsed.sections || [],
            previewJson: null,
          };
        }

        return null;
      })
      .filter(Boolean) as ConversationMessage[];

  /** Fetch resume ONLY on first load / template change */
  useEffect(() => {
    if (!templateKey) return;

    setLoading(true);

    api
      .get(`/resume/${templateKey}`)
      .then((res) => {
        setResumeJson(res.data.resumeJson);
      })
      .catch((err) => {
        console.error("Failed to load resume:", err);
      })
      .finally(() => setLoading(false));
  }, [templateKey]);

  /** Fetch conversation list - triggers on template or conversation changes */
  useEffect(() => {
    if (!templateKey) return;

    console.log("Fetching conversation list for:", templateKey);

    api
      .get(`/resume/${templateKey}/conversations`)
      .then((res) => {
        console.log("Conversations loaded:", res.data.conversations);
        setConversationList(res.data.conversations || []);
      })
      .catch((err) => {
        console.error("Failed to load conversations:", err);
      });
  }, [templateKey, conversationId]); // ✅ Re-fetch when conversationId changes

  /** Load messages when a conversation is selected */
  useEffect(() => {
    if (!templateKey) return;

    if (!conversationId) {
      console.log("No conversation selected, clearing messages");
      setConversation([]);
      return;
    }

    console.log("Loading conversation:", conversationId);

    api
      .get(`/resume/${templateKey}/conversations/${conversationId}`)
      .then((res) => {
        console.log("Conversation messages loaded:", res.data);
        setConversation(normalizeConversation(res.data.messages));
      })
      .catch((err) => {
        console.error("Failed to load conversation messages:", err);
      });
  }, [templateKey, conversationId]);

  /** Handle conversation selection */
  const handleSelectConversation = (id: string | null) => {
    console.log("Selecting conversation:", id);
    setConversationId(id);
    
    // Update URL to reflect selected conversation
    if (id) {
      setSearchParams({ template: templateKey || "", conversation: id });
    } else {
      setSearchParams({ template: templateKey || "" });
    }
  };

  /** Handle new conversation creation */
  const handleConversationCreated = (meta: { id: string; title: string }) => {
    console.log("New conversation created:", meta);
    setConversationId(meta.id);
    
    // Add to list immediately (optimistic update)
    setConversationList((prev) => {
      // Avoid duplicates
      if (prev.some(c => c.id === meta.id)) {
        return prev;
      }
      return [meta, ...prev];
    });
    
    // Update URL
    setSearchParams({ 
      template: templateKey || "", 
      conversation: meta.id 
    });
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-lg text-gray-600">
        Loading your resume...
      </div>
    );
  }

  if (!resumeJson) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500 text-xl">
        Failed to load resume.
      </div>
    );
  }

  const effectiveJson = previewJson || resumeJson;

  return (
    <div className="w-full h-screen flex bg-[#eef3fb] overflow-hidden">

      {/* LEFT — CHAT (50%) */}
      <div className="w-1/2 h-full border-r border-gray-200 bg-white shadow-md">
        <ChatPanel
          conversation={conversation}
          setConversation={setConversation}
          resumeJson={resumeJson}
          setResumeJson={setResumeJson}
          setPreviewJson={setPreviewJson}
          templateKey={templateKey}
          conversationId={conversationId}
          conversationList={conversationList}
          onSelectConversation={handleSelectConversation}
          onConversationCreated={handleConversationCreated}
        />
      </div>

      {/* RIGHT — RESUME (50%) */}
      <div className="w-1/2 h-full flex flex-col bg-[#f5f7fb]">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Your Resume</h2>

          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-1 rounded-full text-xs font-medium transition ${
              editMode
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {editMode ? "Exit Edit Mode" : "Edit Mode"}
          </button>
        </div>

        {/* RESUME PREVIEW */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-[95%] max-w-3xl h-[100%] bg-white shadow-lg rounded-md overflow-hidden border border-gray-300">
            <ResumePreview resumeJson={effectiveJson} editMode={editMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;