import api from "./api";

/**
 * Create a new resume
 */
export const createResume = (
  templateKey: string,
  category: string,
  name: string,
  description?: string
) =>
  api.post("/resume", {
    templateKey,
    category,
    name,
    description
  });

/**
 * Get all resumes
 */
export const fetchResumes = (templateKey: string, category: string) =>
  api.get("/resume", {
    params: { templateKey, category }
  });

/**
 * Get single resume
 */
export const fetchResumeById = (resumeId: string) =>
  api.get(`/resume/${resumeId}`);

/**
 * Render PDF
 */
export const renderResume = (
  resumeId: string,
  previewMode = false,
  previewData?: any
) =>
  api.post("/resume/render", {
    resumeId,
    previewMode,
    previewData
  });

/**
 * Rename resume
 */
export const renameResume = (
  resumeId: string,
  name: string,
  description?: string
) =>
  api.patch(`/resume/${resumeId}`, {
    name,
    description
  });

/**
 * Delete resume
 */
export const deleteResume = (resumeId: string) =>
  api.delete(`/resume/${resumeId}`);
