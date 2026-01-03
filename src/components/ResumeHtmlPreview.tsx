import { useEffect, useState } from "react";
import {
  renderResumeHtml,
  renderResumePdf,
  downloadResumePdf,
} from "../api/resume";

interface ResumeHtmlPreviewProps {
  resumeId: string;
  previewJson?: any | null;
  version: number;
}

const ResumeHtmlPreview: React.FC<ResumeHtmlPreviewProps> = ({
  resumeId,
  previewJson,
  version,
}) => {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [previewingPdf, setPreviewingPdf] = useState(false);

  useEffect(() => {
    if (!resumeId) return;
    setLoading(true);
    renderResumeHtml(resumeId, previewJson)
      .then((res) => setHtml(res.data.html))
      .catch(() => setHtml(""))
      .finally(() => setLoading(false));
  }, [resumeId, previewJson, version]);

  const handlePreviewPdf = async () => {
    try {
      setPreviewingPdf(true);
      const res = await renderResumePdf(resumeId, !!previewJson, previewJson);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error("Preview PDF error:", err);
    } finally {
      setPreviewingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const res = await downloadResumePdf(resumeId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const contentDisposition = res.headers["content-disposition"] || res.headers["Content-Disposition"];
      let filename = "resume.pdf";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) filename = match[1];
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download PDF error:", err);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center text-gray-400">Updating preview…</div>;
  }

  if (!html) {
    return <div className="h-full flex items-center justify-center text-gray-400">Resume preview will appear here</div>;
  }

  return (
    <div className="relative h-full w-full bg-white overflow-hidden flex flex-col">
      {previewJson && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-md">
          Preview Mode
        </div>
      )}
      <div className="relative z-20 flex items-center justify-center gap-2 px-4 py-3 bg-white border-b">
        <button
          onClick={handlePreviewPdf}
          disabled={previewingPdf}
          className="h-8 px-5 text-xs font-medium bg-green-600 text-white rounded-full shadow-sm hover:bg-green-700 transition disabled:opacity-60"
        >
          {previewingPdf ? "Opening…" : "Preview PDF"}
        </button>
        <button
          onClick={handleDownloadPdf}
          className="h-8 px-5 text-xs font-medium bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700 transition"
        >
          Download PDF
        </button>
      </div>
      <div className="relative z-10 flex-1 overflow-y-auto p-6">
        <div className="resume-html-preview" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};

export default ResumeHtmlPreview;