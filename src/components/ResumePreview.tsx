import React, { useEffect, useState } from "react";
import api from "../api/api";

interface ResumePreviewProps {
  resumeJson: any;
  editMode: boolean;
  resumeId: string;
  previewJson?: any | null;
  isPreviewMode?: boolean;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({
  resumeJson,
  editMode,
  resumeId,
  previewJson,
  isPreviewMode,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previousResumeJson, setPreviousResumeJson] = useState<any>(null);
  const [previousPreviewJson, setPreviousPreviewJson] = useState<any>(null);

  const isPreviewModeActive = !!previewJson || isPreviewMode;

  /* ================= PDF RENDER ================= */
  useEffect(() => {
    if (!resumeId) return;
    if (editMode) return;

    const resumeChanged =
      JSON.stringify(previousResumeJson) !== JSON.stringify(resumeJson);
    const previewChanged =
      JSON.stringify(previousPreviewJson) !== JSON.stringify(previewJson);

    if (!resumeChanged && !previewChanged && pdfUrl) return;

    setLoading(true);

    const requestBody: any = { resumeId };

    if (isPreviewModeActive) {
      requestBody.previewMode = true;
      requestBody.previewData = previewJson;
    }

    api
      .post("/resume/render", requestBody, { responseType: "blob" })
      .then((res) => {
        const fileBlob = new Blob([res.data], {
          type: "application/pdf",
        });
        const fileURL = URL.createObjectURL(fileBlob);

        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(fileURL);
        setPreviousResumeJson(resumeJson);
        setPreviousPreviewJson(previewJson);
      })
      .catch((err) => console.error("PDF render error:", err))
      .finally(() => setLoading(false));
  }, [resumeId, resumeJson, previewJson, editMode]);

  /* ================= EDIT MODE ================= */
  if (editMode) {
    return (
      <div className="p-6 space-y-4 overflow-y-auto h-full">
        <h3 className="text-lg font-semibold mb-4">
          Edit Resume Fields
        </h3>

        {Object.entries(resumeJson).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label className="font-medium">{key}</label>
            <input
              className="border rounded px-3 py-2 mt-1"
              value={
                typeof value === "string"
                  ? value
                  : JSON.stringify(value)
              }
              readOnly
            />
          </div>
        ))}
      </div>
    );
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          {isPreviewModeActive
            ? "Compiling Preview PDF…"
            : "Compiling PDF…"}
        </div>
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (!pdfUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        PDF preview will appear here
      </div>
    );
  }

  /* ================= PREVIEW ================= */
  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gray-100">
      {/* Preview Mode Banner */}
      {isPreviewModeActive && (
        <div className="flex-shrink-0 bg-blue-600 text-white px-4 py-2 shadow-lg">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>Preview Mode</span>
          </div>
        </div>
      )}

      {/* PDF */}
      

      <div className="flex-1 overflow-hidden w-full h-full">
        <iframe
          src={`${pdfUrl}#view=FitH`}
          title="Resume PDF Preview"
          className="w-full h-full border-0"
          style={{
            border: isPreviewModeActive
              ? "3px solid #2563eb"
              : "none",
            boxShadow: isPreviewModeActive
              ? "0 0 20px rgba(37, 99, 235, 0.3)"
              : "none",
          }}
        />
      </div>
    </div>
  );
};

export default ResumePreview;
