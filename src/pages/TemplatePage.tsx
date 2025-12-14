import React, { useEffect, useState } from "react";
import { fetchTemplates } from "../api/template";
import TemplateCard from "../components/TemplateCard";

interface Template {
  _id: string;
  name: string;
  key: string;
  previewUrl: string;
  description: string;
}

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetchTemplates()
      .then((res) => setTemplates(res.data.templates))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-12 py-12">
        <h1 className="text-4xl font-bold mb-10">
          Choose Your Resume Template
        </h1>

        {templates.map((t) => (
          <TemplateCard key={t._id} template={t} />
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage;
