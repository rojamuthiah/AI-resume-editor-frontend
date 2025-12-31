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
    description,
  });

/**
 * Get all resumes
 */
export const fetchResumes = (templateKey: string, category: string) =>
  api.get("/resume", {
    params: { templateKey, category },
  });

/**
 * Get single resume
 */
export const fetchResumeById = (resumeId: string) =>
  api.get(`/resume/${resumeId}`);

/* =========================================================
   ✅ NEW: Render HTML (LIVE PREVIEW)
   ========================================================= */
export const renderResumeHtml = (
  resumeId: string,
  previewData?: any
) =>
  api.post("/resume/render-html", {
    resumeId,
    previewData,
  });

/* =========================================================
   📄 PDF EXPORT (ON DEMAND ONLY)
   ========================================================= */
export const renderResumePdf = (
  resumeId: string,
  previewMode = false,
  previewData?: any
) =>
  api.post(
    "/resume/render",
    {
      resumeId,
      previewMode,
      previewData,
    },
    {
      responseType: "blob",
    }
  );

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
    description,
  });

/**
 * Delete resume
 */
export const deleteResume = (resumeId: string) =>
  api.delete(`/resume/${resumeId}`);


/* =========================================================
   ⬇ DOWNLOAD PDF (SYSTEM DOWNLOAD)
   ========================================================= */
export const downloadResumePdf = (resumeId: string) =>
  api.get(`/resume/${resumeId}/download`, {
    responseType: "blob",
  });
