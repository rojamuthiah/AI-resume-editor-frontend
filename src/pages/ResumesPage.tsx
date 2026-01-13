import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
  useLocation
} from "react-router-dom";

import {
  Plus,
  Trash2,
  Pencil
} from "lucide-react";

import {
  fetchResumes,
  createResume,
  renameResume,
  deleteResume
} from "../api/resume";

import CreateResumeDialog from "../components/CreateResumeDialog";
import ResumeAnalyzerDrawer from "../components/ResumeAnalyzerDrawer";
import AILoadingOverlay from "../components/AILoadingOverlay";

interface ResumeItem {
  _id: string;
  name: string;
  description?: string;
  lastUpdated: string;
}

const ResumesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const templateKey = searchParams.get("template");
  const category = searchParams.get("category");

  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  // Inline rename
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Analyzer
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [analyzerResume, setAnalyzerResume] = useState<ResumeItem | null>(null);
  const [analysisCache, setAnalysisCache] = useState<Record<string, any>>({});

  const loadResumes = async () => {
    if (!templateKey || !category) return;
    setLoading(true);
    try {
      const res = await fetchResumes(templateKey, category);
      setResumes(res.data.resumes || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, [templateKey, category]);

  /* ================= CREATE ================= */
  const handleCreate = async (
    name: string,
    description?: string,
    file?: File | null
  ) => {
    if (!templateKey || !category) return;

    try {
      setAiLoading(true);
      const res = await createResume(
        templateKey,
        category,
        name,
        description,
        file
      );

      navigate(`/editor/${res.data.resumeId}`, {
        state: {
          fromResumes: location.pathname + location.search
        }
      });
    } finally {
      setAiLoading(false);
    }
  };

  /* ================= RENAME ================= */
  const startRename = (resume: ResumeItem) => {
    setRenamingId(resume._id);
    setRenameValue(resume.name);
  };

  const saveRename = async (resumeId: string) => {
    if (!renameValue.trim()) return;
    await renameResume(resumeId, renameValue.trim());
    setRenamingId(null);
    loadResumes();
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  /* ================= DELETE ================= */
  const handleDelete = async (resumeId: string) => {
    if (!confirm("Delete this resume permanently?")) return;
    await deleteResume(resumeId);
    setResumes(prev => prev.filter(r => r._id !== resumeId));
  };

  const clearAnalysis = (resumeId: string) => {
    setAnalysisCache(prev => {
      const copy = { ...prev };
      delete copy[resumeId];
      return copy;
    });
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading resumes...
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (resumes.length === 0) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <button
            onClick={() => setOpenDialog(true)}
            className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
          >
            <Plus size={36} />
          </button>
          <p className="mt-4 text-gray-600 text-sm">
            Create your first resume
          </p>
        </div>

        <CreateResumeDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onCreate={(n, d, f) => {
            setOpenDialog(false);
            handleCreate(n, d, f);
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen px-8 py-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Your Resumes</h1>
          <button
            onClick={() => setOpenDialog(true)}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* GRID – ORIGINAL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map(resume => (
            <div
              key={resume._id}
              className="bg-white border rounded-xl p-6 hover:shadow transition group cursor-pointer"
              onClick={() => {
                if (renamingId !== resume._id) {
                  navigate(`/editor/${resume._id}`, {
                    state: {
                      fromResumes:
                        location.pathname + location.search
                    }
                  });
                }
              }}
            >
              {/* NAME ROW */}
              {/* NAME ROW */}
<div
  className="flex items-center justify-between mb-1"
  onClick={(e) => e.stopPropagation()}
>
  {renamingId === resume._id ? (
    <div className="flex items-center gap-2 w-full">
      <input
        autoFocus
        value={renameValue}
        onChange={(e) => setRenameValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            saveRename(resume._id);
          }
          if (e.key === "Escape") {
            cancelRename();
          }
        }}
        className="flex-1 border rounded px-2 py-1 text-sm"
      />

      {/* SAVE */}
      <button
        onClick={() => saveRename(resume._id)}
        className="text-green-600 hover:text-green-700"
        title="Save"
      >
        ✓
      </button>

      {/* CANCEL */}
      <button
        onClick={cancelRename}
        className="text-gray-400 hover:text-gray-600"
        title="Cancel"
      >
        ✕
      </button>
    </div>
  ) : (
    <>
      <div className="flex items-center gap-2">
        <h2 className="font-medium text-lg">
          {resume.name}
        </h2>
        <button
          onClick={() => startRename(resume)}
          className="opacity-0 group-hover:opacity-100 transition"
          title="Rename"
        >
          <Pencil size={14} />
        </button>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(resume._id);
        }}
        className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-600"
        title="Delete resume"
      >
        <Trash2 size={16} />
      </button>
    </>
  )}
</div>


              {resume.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {resume.description}
                </p>
              )}

              <p className="text-xs text-gray-400">
                Last updated:{" "}
                {new Date(resume.lastUpdated).toLocaleString()}
              </p>

              {/* <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAnalyzerResume(resume);
                  setAnalyzerOpen(true);
                }}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Analyze Resume with AI
              </button> */}
            </div>
          ))}
        </div>

        <CreateResumeDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onCreate={(n, d, f) => {
            setOpenDialog(false);
            handleCreate(n, d, f);
          }}
        />
      </div>

      {/* ANALYZER */}
      <ResumeAnalyzerDrawer
        open={analyzerOpen}
        resume={analyzerResume}
        cachedResult={
          analyzerResume
            ? analysisCache[analyzerResume._id]
            : null
        }
        onAnalyzeComplete={(result) => {
          if (!analyzerResume) return;
          setAnalysisCache(prev => ({
            ...prev,
            [analyzerResume._id]: result
          }));
        }}
        onClearAnalysis={clearAnalysis}
        onClose={() => {
          setAnalyzerOpen(false);
          setAnalyzerResume(null);
        }}
      />

      {/* AI LOADING */}
      {aiLoading && <AILoadingOverlay open />}
    </>
  );
};

export default ResumesPage;
