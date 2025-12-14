import React, { useEffect, useState } from "react";
import api from "../api/api";

const ResumePreview = ({ resumeJson, editMode }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Render PDF whenever resumeJson changes AND editMode is off
  useEffect(() => {
    if (!resumeJson) return;

    if (editMode) {
      console.log("Edit mode ON → skip PDF rendering");
      return;
    }

    console.log("Rendering PDF for resume:", resumeJson);

    setLoading(true);

    api
      .post(
        "/resume/render",
        {
          templateKey: "classic",
          resumeJson,
        },
        { responseType: "blob" }
      )
      .then((res) => {
        console.log("PDF received:", res);

        const fileBlob = new Blob([res.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(fileBlob);
        setPdfUrl(fileURL);
      })
      .catch((err) => {
        console.error("PDF render error:", err);
      })
      .finally(() => setLoading(false));
  }, [resumeJson, editMode]);

  if (editMode) {
    return (
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Edit Resume Fields</h3>

        {Object.entries(resumeJson).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label className="font-medium">{key}</label>

            <input
              className="border rounded px-3 py-2 mt-1"
              value={typeof value === "string" ? value : JSON.stringify(value)}
              readOnly
            />
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Compiling PDF…
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        PDF preview will appear here
      </div>
    );
  }

  return (
    <iframe
      src={pdfUrl}
      className="w-full h-full border-none"
      title="Resume PDF Preview"
    />
  );
};

export default ResumePreview;
