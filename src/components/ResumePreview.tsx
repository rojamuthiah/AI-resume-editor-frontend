import React, { useEffect, useState } from "react";
import api from "../api/api";

interface ResumePreviewProps {
  resumeJson: any;
  editMode: boolean;
  templateKey: string | null;
  previewJson?: any | null;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ 
  resumeJson, 
  editMode, 
  templateKey,
  previewJson
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isPreviewMode = !!previewJson;

  // Render PDF whenever resumeJson or previewJson changes AND editMode is off
  useEffect(() => {
    if (!templateKey) return;

    if (editMode) {
      console.log("Edit mode ON → skip PDF rendering");
      return;
    }

    console.log(isPreviewMode ? "Rendering PREVIEW PDF" : "Rendering PDF from DB");

    setLoading(true);

    // Prepare request body
    const requestBody: any = { templateKey };

    // If in preview mode, send the preview data
    if (isPreviewMode) {
      requestBody.previewMode = true;
      requestBody.previewData = previewJson;
    }

    api
      .post("/resume/render", requestBody, { responseType: "blob" })
      .then((res) => {
        console.log("PDF received:", res);

        const fileBlob = new Blob([res.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(fileBlob);
        
        // Clean up old URL if exists
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }
        
        setPdfUrl(fileURL);
      })
      .catch((err) => {
        console.error("PDF render error:", err);
      })
      .finally(() => setLoading(false));

    // Cleanup function
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [resumeJson, previewJson, editMode, templateKey]);

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
        {isPreviewMode ? "Compiling Preview PDF…" : "Compiling PDF…"}
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
    <div className="relative w-full h-full">
      {/* Preview Mode Indicator */}
      {isPreviewMode && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-blue-600 text-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="font-semibold">Preview Mode - Viewing proposed changes</span>
          </div>
        </div>
      )}

      <iframe
        src={pdfUrl}
        className={`w-full h-full border-none ${isPreviewMode ? 'mt-12' : ''}`}
        title="Resume PDF Preview"
        style={{ 
          border: isPreviewMode ? '3px solid #2563eb' : 'none',
          boxShadow: isPreviewMode ? '0 0 20px rgba(37, 99, 235, 0.3)' : 'none'
        }}
      />
    </div>
  );
};

export default ResumePreview;