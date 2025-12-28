import api from "./api";

export const askAI = async (
  prompt: string,
  resumeJson: any,
  templateKey: string | null,
  conversationId: string | null
) => {
  const res = await api.post("/ai/ask", { prompt, resumeJson, templateKey, conversationId });
  return res.data;
};

export const editAI = async (
  prompt: string,
  templateKey: string | null,
  conversationId: string | null,
  jobDescription?: string
) => {
  const res = await api.post("/ai/edit", { 
    prompt, 
    templateKey, 
    conversationId,
    jobDescription 
  });
  return res.data;
};

export const acceptEdit = async (
  section: string,
  sectionData: any,
  beforeData: any,
  templateKey: string | null
) => {
  const res = await api.post("/ai/accept", { 
    section, 
    sectionData, 
    beforeData,
    templateKey 
  });
  return res.data; // { success: true/false, resumeJson, message? }
};

export const revertEdit = async (
  section: string,
  beforeData: any,
  templateKey: string | null
) => {
  const res = await api.post("/ai/revert", { 
    section, 
    beforeData,
    templateKey 
  });
  return res.data; // { success: true/false, resumeJson, message? }
};