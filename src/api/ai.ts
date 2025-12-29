import api from "./api";

// Ask AI
export const askAI = async (
  prompt: string,
  resumeJson: any,
  templateKey: string,
  category: string,
  conversationId: string | null
) => {
  const response = await api.post("/ai/ask", {
    prompt,
    resumeJson,
    templateKey,
    category,
    conversationId
  });
  return response.data;
};

// Edit AI
export const editAI = async (
  prompt: string,
  templateKey: string,
  category: string,
  conversationId: string | null
) => {
  const response = await api.post("/ai/edit", {
    prompt,
    templateKey,
    category,
    conversationId
  });
  return response.data;
};

// Accept Edit - Changed endpoint from /resume to /ai
export const acceptEdit = async (
  section: string,
  sectionData: any,
  beforeData: any,
  templateKey: string,
  category: string
) => {
  const response = await api.post("/ai/accept", {
    section,
    sectionData,
    beforeData,
    templateKey,
    category
  });
  return response.data;
};

// Revert Edit - Changed endpoint from /resume to /ai
export const revertEdit = async (
  section: string,
  beforeData: any,
  templateKey: string,
  category: string
) => {
  const response = await api.post("/ai/revert", {
    section,
    beforeData,
    templateKey,
    category
  });
  return response.data;
};