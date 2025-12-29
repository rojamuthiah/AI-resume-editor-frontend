import api from "./api";

// Fetch all categories
export const fetchCategories = () => api.get("/templates/categories");

// Fetch templates by category
export const fetchTemplatesByCategory = (category: string) =>
  api.get(`/templates/category/${category}`);

// Fetch all templates
export const fetchTemplates = () => api.get("/templates");