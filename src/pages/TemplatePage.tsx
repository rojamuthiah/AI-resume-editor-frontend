import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchTemplatesByCategory, fetchCategories } from "../api/template";
import TemplateCard from "../components/templateCard";

interface Template {
  _id: string;
  name: string;
  key: string;
  previewUrl: string;
  description: string;
  category: string;
}

interface Category {
  key: string;
  label: string;
}

const TemplatePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get("category");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(category || "");
  const [loading, setLoading] = useState(false);

  // Load all categories (for label only)
  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data.categories))
      .catch(console.error);
  }, []);

  // Load templates when category changes
  useEffect(() => {
    if (!selectedCategory) return;

    setLoading(true);
    fetchTemplatesByCategory(selectedCategory)
      .then((res) => setTemplates(res.data.templates))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const selectedCategoryLabel = categories.find(c => c.key === selectedCategory)?.label;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate("/templates/categories")}
            className="text-blue-600 hover:text-blue-700 mb-4 font-medium text-sm flex items-center gap-1"
          >
            ← Back to Categories
          </button>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            {selectedCategoryLabel} Templates
          </h1>
          <p className="text-gray-600">Choose a template to get started</p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No templates available for this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {templates.map((template) => (
              <TemplateCard
                key={template._id}
                template={template}
                category={selectedCategory}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatePage;