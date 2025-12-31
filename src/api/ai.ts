import api from "./api";

/**
 * ASK MODE
 */
export const askAI = async (
  prompt: string,
  conversationId: string | null,
  resumeId: string
) => {
  const response = await api.post("/ai/ask", {
    prompt,
    conversationId,
    resumeId
  });
  return response.data;
};

/**
 * EDIT MODE
 */
export const editAI = async (
  prompt: string,
  conversationId: string | null,
  resumeId: string
) => {
  const response = await api.post("/ai/edit", {
    prompt,
    conversationId,
    resumeId
  });
  return response.data;
};

/**
 * ACCEPT EDIT
 */
export const acceptEdit = async (
  section: string,
  sectionData: any,
  beforeData: any,
  resumeId: string
) => {
  const response = await api.post("/ai/accept", {
    section,
    sectionData,
    beforeData,
    resumeId
  });
  return response.data;
};

/**
 * REVERT EDIT
 */
export const revertEdit = async (
  section: string,
  beforeData: any,
  resumeId: string
) => {
  const response = await api.post("/ai/revert", {
    section,
    beforeData,
    resumeId
  });
  return response.data;
};

/**
 * RESUME ANALYZER
 */
export const analyzeResume = async (
  resumeId: string,
  jobDescription: string
) => {
  const response = await api.post("/ai/analyse", {
    resumeId,
    jobDescription
  });
  return response.data;
};
