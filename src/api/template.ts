import api from "./api";

// Fetch all templates
export const fetchTemplates = () => api.get("/templates");

// Save selected template for the user (optional later)
export const selectTemplate = (templateKey: string) =>
  api.post("/user/select-template", { templateKey });
