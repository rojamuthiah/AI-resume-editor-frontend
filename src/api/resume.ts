import api from "./api";

/**
 * Create a new resume from a template + category
 * name is mandatory, description optional
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
 * Get all resumes for a user by template + category
 */
export const fetchResumes = (templateKey: string, category: string) =>
  api.get("/resume", {
    params: {
      templateKey,
      category
    }
  });

/**
 * Get a single resume by resumeId
 */
export const fetchResumeById = (resumeId: string) =>
  api.get(`/resume/${resumeId}`);

/**
 * Render resume PDF
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
