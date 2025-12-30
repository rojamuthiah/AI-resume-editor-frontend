import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { fetchResumes, createResume } from "../api/resume";
import CreateResumeDialog from "../components/CreateResumeDialog";

interface ResumeItem {
  _id: string;
  name: string;
  description?: string;
  lastUpdated: string;
}

const ResumesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const templateKey = searchParams.get("template");
  const category = searchParams.get("category");

  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (!templateKey || !category) return;

    const load = async () => {
      try {
        const res = await fetchResumes(templateKey, category);
        setResumes(res.data.resumes || []);
      } catch (err) {
        console.error("Failed to load resumes", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [templateKey, category]);

  const handleCreateResume = async (
  name: string,
  description?: string
) => {
  if (!templateKey || !category) return;

  try {
    const res = await createResume(
      templateKey,
      category,
      name,
      description
    );

    navigate(`/editor/${res.data.resumeId}`);
  } catch (err) {
    console.error("Failed to create resume", err);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading resumes...
      </div>
    );
  }

  // EMPTY STATE
  if (resumes.length === 0) {
    return (
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

        <CreateResumeDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onCreate={(name, description) => {
            setOpenDialog(false);
            handleCreateResume(name, description);
          }}
        />
      </div>
    );
  }

  // LIST STATE
  return (
    <div className="min-h-screen px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Your Resumes</h1>

        <button
          onClick={() => setOpenDialog(true)}
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes.map((resume) => (
          <div
            key={resume._id}
            onClick={() => navigate(`/editor/${resume._id}`)}
            className="cursor-pointer bg-white border rounded-xl p-6 hover:shadow transition"
          >
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
          </div>
        ))}
      </div>

      <CreateResumeDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onCreate={(name, description) => {
          setOpenDialog(false);
          handleCreateResume(name, description);
        }}
      />
    </div>
  );
};

export default ResumesPage;
