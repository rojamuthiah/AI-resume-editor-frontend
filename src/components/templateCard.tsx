import React from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  template: {
    name: string;
    key: string;
    previewUrl: string;
    description: string;
  };
}

const TemplateCard: React.FC<Props> = ({ template }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-10 flex gap-12 h-[90vh]">

      {/* LEFT SIDE — Resume preview */}
      <div className="w-[55%] h-full overflow-y-auto rounded-xl border bg-gray-50 shadow-sm">
        <img
          src={`http://localhost:5000${template.previewUrl}`}
          alt={template.name}
          className="w-full"
        />
      </div>

      {/* RIGHT SIDE — Title + description + button */}
      <div className="w-[45%] flex flex-col justify-center pr-10">
        <h2 className="text-3xl font-semibold mb-4">{template.name}</h2>

        <p className="text-gray-600 text-lg leading-relaxed mb-10">
          {template.description}
        </p>

        <button
          onClick={() => navigate(`/editor?template=${template.key}`)}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-blue-700 transition shadow"
        >
          Select Template
        </button>
      </div>

    </div>
  );
};

export default TemplateCard;
