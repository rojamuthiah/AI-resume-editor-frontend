import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { analyzeResume } from "../api/ai";

interface Props {
  open: boolean;
  resume: { _id: string; name: string } | null;
  cachedResult: any | null;
  onAnalyzeComplete: (result: any) => void;
  onClearAnalysis: (resumeId: string) => void;
  onClose: () => void;
}

const getColor = (score: number) => {
  if (score >= 80) return "text-green-600 border-green-600";
  if (score >= 50) return "text-orange-500 border-orange-500";
  return "text-red-600 border-red-600";
};

const ResumeAnalyzerDrawer: React.FC<Props> = ({
  open,
  resume,
  cachedResult,
  onAnalyzeComplete,
  onClearAnalysis,
  onClose
}) => {
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Sync cached result per resume
  useEffect(() => {
    setResult(cachedResult);
    setJd("");
  }, [resume?._id, cachedResult]);

  const handleAnalyze = async () => {
    if (!resume || !jd.trim()) return;

    setLoading(true);
    try {
      const res = await analyzeResume(resume._id, jd);
      setResult(res);
      onAnalyzeComplete(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={clsx("fixed inset-0 z-50", open ? "visible" : "invisible")}>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={clsx(
          "absolute inset-0 bg-black/40 transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Drawer */}
      <div
        className={clsx(
          "absolute bg-white shadow-xl transition-transform flex flex-col",

          // 📱 Mobile: bottom sheet
          "w-full h-[55vh] bottom-0 rounded-t-2xl",

          // 💻 Desktop: right drawer
          "md:w-[420px] md:h-full md:bottom-auto md:right-0 md:rounded-none",

          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-x-full"
        )}
      >
        {/* Grab handle (mobile) */}
        <div className="md:hidden flex justify-center pt-2">
          <div className="w-10 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg">Resume Analyzer</h2>
            {resume && (
              <p className="text-xs text-gray-500 mt-0.5">
                {resume.name}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-xl">✕</button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {!result && (
            <>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste job description here..."
                className="w-full h-40 border rounded p-3 text-sm resize-none"
              />

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </>
          )}

          {result && (
            <div className="space-y-6">
              {/* Score */}
              <div className="flex justify-center">
                <div
                  className={clsx(
                    "w-28 h-28 rounded-full border-4 flex items-center justify-center text-3xl font-bold",
                    getColor(result.relevanceScore)
                  )}
                >
                  {result.relevanceScore}
                </div>
              </div>

              {/* Analyze Again */}
              <button
                onClick={() => {
                  if (!resume) return;
                  onClearAnalysis(resume._id);
                  setResult(null);
                  setJd("");
                }}
                className="w-full border rounded py-2 text-sm hover:bg-gray-50"
              >
                Analyze Again
              </button>

              {/* Strengths */}
              {result.strengths?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">What’s Good</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {result.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {result.improvements?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Improvements</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {result.improvements.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verdict */}
              <div className="bg-gray-50 border rounded p-4 text-sm">
                {result.finalVerdict}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzerDrawer;
