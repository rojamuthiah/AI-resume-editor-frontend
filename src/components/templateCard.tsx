import React from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  template: {
    name: string;
    key: string;
    previewUrl: string;
    description: string;
  };
  category: string;
}

const TemplateCard: React.FC<Props> = ({ template, category }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
      {/* Preview */}
      <div className="bg-gray-100 border-b">
        <img
          src={`http://localhost:5000${template.previewUrl}`}
          alt={template.name}
          className="w-full h-[280px] object-contain p-4"
        />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h2 className="text-xl font-semibold mb-2">{template.name}</h2>

        <p className="text-gray-600 text-sm flex-1">
          {template.description}
        </p>

        <button
          onClick={() =>
            navigate(`/resumes?template=${template.key}&category=${category}`)
          }
          className="mt-6 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Select Template
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;
