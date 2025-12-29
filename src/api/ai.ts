import api from "./api";

// Ask AI - Removed resumeJson parameter
export const askAI = async (
  prompt: string,
  templateKey: string,
  category: string,
  conversationId: string | null
) => {
  const response = await api.post("/ai/ask", {
    prompt,
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

// Accept Edit
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

// Revert Edit
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