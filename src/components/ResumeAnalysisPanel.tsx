import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { CpuChipIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { analyzeResume } from "../api/ai";

/* ───────── Types ───────── */
interface AnalyseMessage {
  role: "user" | "assistant";
  type: "analyse";
  content: string;
  timestamp?: string;
}

interface AnalysisGroup {
  conversationId: string;
  title: string;
  createdAt: string;
  messages: AnalyseMessage[];
}

interface IndividualAnalysis {
  conversationId: string;
  userMessage: AnalyseMessage;
  assistantMessage: AnalyseMessage;
  timestamp: string;
}

interface Props {
  resumeId: string;
  analyses: AnalysisGroup[];
  conversationId?: string;
  onAnalysisCreated: () => void;
}

/* ───────── Helpers ───────── */
const getScoreColor = (score: number) => {
  if (score >= 75) return "text-green-600";
  if (score >= 45) return "text-orange-500";
  return "text-red-600";
};

const getConfidence = (score: number) => {
  if (score >= 75) return { label: "Strong Match", bar: "bg-green-500" };
  if (score >= 45) return { label: "Medium Match", bar: "bg-orange-500" };
  return { label: "Weak Match", bar: "bg-red-500" };
};

const extractJD = (content: string): string => {
  try {
    const parsed = JSON.parse(content);
    return parsed.jobDescription ?? content;
  } catch {
    return content;
  }
};

const flattenAnalyses = (analyses: AnalysisGroup[]): IndividualAnalysis[] => {
  const out: IndividualAnalysis[] = [];
  analyses.forEach((g) => {
    for (let i = 0; i < g.messages.length; i += 2) {
      if (g.messages[i] && g.messages[i + 1]) {
        out.push({
          conversationId: g.conversationId,
          userMessage: g.messages[i],
          assistantMessage: g.messages[i + 1],
          timestamp:
            g.messages[i + 1].timestamp ||
            g.messages[i].timestamp ||
            g.createdAt,
        });
      }
    }
  });
  return out;
};

/* ───────── Component ───────── */
const ResumeAnalysisPanel: React.FC<Props> = ({
  resumeId,
  analyses,
  conversationId,
  onAnalysisCreated,
}) => {
  const [jdInput, setJdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  const [jdExpanded, setJdExpanded] = useState(false);

  /* Mobile + Tablet detection */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ✅ FILTER ANALYSES BY CONVERSATION */
  const individualAnalyses = useMemo(() => {
    return flattenAnalyses(analyses)
      .filter((a) => a.conversationId === conversationId)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime()
      );
  }, [analyses, conversationId]);

  /* Always select latest analysis */
  useEffect(() => {
    if (individualAnalyses.length) {
      setActiveIndex(individualAnalyses.length - 1);
    }
  }, [individualAnalyses.length]);

  /* ✅ RESET STATE WHEN CONVERSATION CHANGES */
  useEffect(() => {
    setActiveIndex(0);
    setJdExpanded(false);
    setShowHistoryMobile(false);
  }, [conversationId]);

  const active =
    individualAnalyses.length > 0
      ? individualAnalyses[activeIndex]
      : null;

  const parsedAnalysis = useMemo(() => {
    if (!active?.assistantMessage?.content) return null;
    try {
      return JSON.parse(active.assistantMessage.content);
    } catch {
      return null;
    }
  }, [active]);

  const jobDescription = useMemo(() => {
    if (!active?.userMessage?.content) return "";
    return extractJD(active.userMessage.content);
  }, [active]);

  const handleAnalyze = async () => {
    if (!jdInput.trim()) return;
    setLoading(true);
    try {
      await analyzeResume(resumeId, jdInput, conversationId);
      setJdInput("");
      await onAnalysisCreated();
    } finally {
      setLoading(false);
    }
  };

  const score = Math.min(
    100,
    Math.max(0, parsedAnalysis?.relevanceScore ?? 0)
  );
  const confidence = getConfidence(score);

  return (
    <div className="relative flex min-h-full bg-white overflow-x-hidden">
      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-white/90 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
  
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 border-r bg-gray-50 p-4 overflow-y-auto no-scrollbar">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Previous Analyses ({individualAnalyses.length})
          </h4>
  
          <div className="space-y-2">
            {individualAnalyses.map((a, idx) => {
              let s = 0;
              try {
                s = JSON.parse(a.assistantMessage.content)?.relevanceScore;
              } catch {}
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={clsx(
                    "w-full p-3 rounded-lg border text-left",
                    activeIndex === idx
                      ? "bg-blue-100 border-blue-400"
                      : "bg-white"
                  )}
                >
                  <div className="flex justify-between text-xs">
                    <span>#{idx + 1} Analysis</span>
                    <span className={getScoreColor(s)}>{s}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      )}
  
      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* ⛔ PANEL DOES NOT SCROLL */}
        <div className="flex-1 overflow-hidden">
          {/* ✅ INNER CONTENT SCROLLS — SCROLLBAR HIDDEN */}
          <div className="h-full p-4 space-y-6 overflow-y-auto no-scrollbar">
            {!active && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                <p>No analysis for this conversation yet.</p>
                <p className="text-xs mt-1">
                  Paste a job description below to analyze.
                </p>
              </div>
            )}
  
            {active && (
              <>
                {/* Mobile History */}
                {isMobile && individualAnalyses.length > 1 && (
                  <div>
                    <button
                      onClick={() => setShowHistoryMobile((s) => !s)}
                      className="w-full flex justify-between text-sm font-medium mb-2"
                    >
                      Previous Analyses ({individualAnalyses.length})
                      <span>{showHistoryMobile ? "⌃" : "⌄"}</span>
                    </button>
  
                    {showHistoryMobile && (
                      <div className="flex flex-col gap-2">
                        {individualAnalyses.map((a, idx) => {
                          let s = 0;
                          try {
                            s = JSON.parse(
                              a.assistantMessage.content
                            )?.relevanceScore;
                          } catch {}
                          return (
                            <button
                              key={idx}
                              onClick={() => setActiveIndex(idx)}
                              className={clsx(
                                "p-3 rounded-lg border text-left",
                                activeIndex === idx
                                  ? "bg-blue-50 border-blue-500"
                                  : "bg-white"
                              )}
                            >
                              <div className="flex justify-between text-xs">
                                <span>#{idx + 1} Analysis</span>
                                <span className={getScoreColor(s)}>
                                  {s}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
  
                {/* Job Description */}
                <div className="border rounded-xl p-4">
                  <button
                    onClick={() => setJdExpanded((s) => !s)}
                    className="w-full flex justify-between items-center text-sm font-semibold mb-2"
                  >
                    Job Description
                    <ChevronDownIcon
                      className={clsx(
                        "w-4 h-4 transition-transform",
                        jdExpanded ? "rotate-180" : ""
                      )}
                    />
                  </button>
  
                  {/* ONLY JD HAS SCROLLBAR */}
                  <pre
                    className={clsx(
                      "text-xs whitespace-pre-wrap break-words",
                      "overflow-y-auto overflow-x-hidden thin-scrollbar",
                      jdExpanded ? "max-h-96" : "max-h-28"
                    )}
                  >
                    {jobDescription}
                  </pre>
                </div>
  
                {/* Score */}
                <div className="border rounded-xl p-4 text-center">
                  <div
                    className={clsx(
                      "text-4xl font-bold mb-2",
                      getScoreColor(score)
                    )}
                  >
                    {score}
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                    <div
                      className={clsx("h-full rounded-full", confidence.bar)}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium">
                    {confidence.label}
                  </div>
                </div>
  
                {/* Strengths */}
                {parsedAnalysis?.strengths?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Strengths</h3>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {parsedAnalysis.strengths.map(
                        (s: string, i: number) => (
                          <li key={i}>{s}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
  
                {/* Improvements */}
                {parsedAnalysis?.improvements?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Improvements</h3>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {parsedAnalysis.improvements.map(
                        (s: string, i: number) => (
                          <li
                            key={i}
                            className={
                              i < 3
                                ? "text-blue-700 font-medium"
                                : ""
                            }
                          >
                            {s}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
  
                {/* Conclusion */}
                <div className="border rounded-xl p-4">
                  <h3 className="font-medium mb-1">Conclusion</h3>
                  <p className="text-sm text-gray-700">
                    {parsedAnalysis?.finalVerdict ||
                      "No analysis available"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
  
        {/* Footer */}
        <div className="border-t p-4 bg-white">
          <textarea
            value={jdInput}
            onChange={(e) => setJdInput(e.target.value)}
            className="w-full h-24 border rounded-lg p-3 text-sm resize-none"
            placeholder="Paste job description to analyze..."
          />
  
          <button
            onClick={handleAnalyze}
            disabled={loading || !jdInput.trim()}
            className={clsx(
              "w-full mt-3 py-3 rounded-xl font-semibold text-white",
              loading || !jdInput.trim()
                ? "bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            <span className="flex items-center justify-center gap-2">
              <CpuChipIcon className="w-5 h-5" />
              Analyze with AI
            </span>
          </button>
        </div>
      </main>
    </div>
  );
  
  
};

export default ResumeAnalysisPanel;
