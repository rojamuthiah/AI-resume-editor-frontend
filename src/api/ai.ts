import api from "./api";

export const askAI = async (
  prompt: string,
  resumeJson: any,
  templateKey: string | null,
  conversationId: string | null
) => {
  const res = await api.post("/ai/ask", { prompt, resumeJson, templateKey, conversationId });
  return res.data; // { message: string, conversationId, title }
};

export const editAI = async (
  prompt: string,
  resumeJson: any,
  templateKey: string | null,
  conversationId: string | null
) => {
  const res = await api.post("/ai/edit", { prompt, resumeJson, templateKey, conversationId });
  return res.data; // { sections: [...], message: string, conversationId, title }
};

export const acceptEdit = async (
  resumeJson: any,
  templateKey: string | null,
  conversationId: string | null
) => {
  const res = await api.post("/ai/accept", { resumeJson, templateKey, conversationId });
  return res.data; // { success: true, resumeJson }
};
