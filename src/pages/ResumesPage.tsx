import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
  useLocation
} from "react-router-dom";

import { Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";

import {
  fetchResumes,
  createResume,
  renameResume,
  deleteResume
} from "../api/resume";

import CreateResumeDialog from "../components/CreateResumeDialog";
import ResumeAnalyzerDrawer from "../components/ResumeAnalyzerDrawer";

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

  const [openDialog, setOpenDialog] = useState(false);
  const [editResume, setEditResume] = useState<ResumeItem | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // 🔍 Analyzer state
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [analyzerResume, setAnalyzerResume] = useState<ResumeItem | null>(null);
  const [analysisCache, setAnalysisCache] = useState<Record<string, any>>({});

  const loadResumes = async () => {
    if (!templateKey || !category) return;
    setLoading(true);

    try {
      const res = await fetchResumes(templateKey, category);
      setResumes(res.data.resumes || []);
    } catch (err) {
      console.error("Failed to load resumes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, [templateKey, category]);

  const handleCreate = async (name: string, description?: string) => {
    if (!templateKey || !category) return;

    const res = await createResume(templateKey, category, name, description);

    navigate(`/editor/${res.data.resumeId}`, {
      state: {
        fromResumes: location.pathname + location.search
      }
    });
  };

  const handleRename = async (name: string, description?: string) => {
    if (!editResume) return;

    await renameResume(editResume._id, name, description);
    setEditResume(null);
    loadResumes();
  };

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

  /* ================= EMPTY STATE ================= */
  if (resumes.length === 0) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <button
            onClick={() => setOpenDialog(true)}
            className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
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
          onCreate={(name, description) => {
            setOpenDialog(false);
            handleCreate(name, description);
          }}
        />
      </>
    );
  }

  /* ================= LIST STATE ================= */
  return (
    <>
      <div className="min-h-screen px-8 py-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Your Resumes</h1>

          <button
            onClick={() => setOpenDialog(true)}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
            title="Create Resume"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* RESUME GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map(resume => (
            <div
              key={resume._id}
              onClick={() =>
                navigate(`/editor/${resume._id}`, {
                  state: {
                    fromResumes: location.pathname + location.search
                  }
                })
              }
              className="relative cursor-pointer bg-white border rounded-xl p-6 hover:shadow transition"
            >
              {/* MENU */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === resume._id ? null : resume._id);
                }}
                className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpenId === resume._id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-10 right-3 bg-white border rounded shadow w-36 z-10"
                >
                  <button
                    onClick={() => {
                      setEditResume(resume);
                      setMenuOpenId(null);
                    }}
                    className="w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50"
                  >
                    <Edit2 size={14} /> Rename
                  </button>

                  <button
                    onClick={() => handleDelete(resume._id)}
                    className="w-full px-3 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}

              <h2 className="font-medium text-lg mb-1">
                {resume.name}
              </h2>

              {resume.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {resume.description}
                </p>
              )}

              <p className="text-xs text-gray-400">
                Last updated:{" "}
                {new Date(resume.lastUpdated).toLocaleString()}
              </p>

              {/* ANALYZER */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAnalyzerResume(resume);
                  setAnalyzerOpen(true);
                }}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Analyze Resume
              </button>
            </div>
          ))}
        </div>

        {/* CREATE DIALOG */}
        <CreateResumeDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onCreate={(name, description) => {
            setOpenDialog(false);
            handleCreate(name, description);
          }}
        />

        {/* RENAME DIALOG */}
        <CreateResumeDialog
          open={!!editResume}
          title="Rename Resume"
          initialName={editResume?.name}
          initialDescription={editResume?.description}
          onClose={() => setEditResume(null)}
          onCreate={(name, description) =>
            handleRename(name, description)
          }
        />
      </div>

      {/* ANALYZER DRAWER */}
      <ResumeAnalyzerDrawer
        open={analyzerOpen}
        resume={analyzerResume}
        cachedResult={
          analyzerResume ? analysisCache[analyzerResume._id] : null
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
    </>
  );
};

export default ResumesPage;
