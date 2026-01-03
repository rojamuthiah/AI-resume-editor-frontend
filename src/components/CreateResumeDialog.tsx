import React, { useEffect, useState } from "react";
import { UploadCloud, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (
    name: string,
    description?: string,
    file?: File | null
  ) => void;

  title?: string;
  initialName?: string;
  initialDescription?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CreateResumeDialog: React.FC<Props> = ({
  open,
  onClose,
  onCreate,
  title = "Create Resume",
  initialName = "",
  initialDescription = ""
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription(initialDescription);
      setFile(null);
      setError("");
      setFileError("");
    }
  }, [open, initialName, initialDescription]);

  if (!open) return null;

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);
      setFileError("Only PDF or DOCX files are allowed");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setFileError("File size must be under 5MB");
      return;
    }

    // replace existing file
    setFile(selectedFile);
    setFileError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Resume name is required");
      return;
    }

    if (fileError) return;

    onCreate(name.trim(), description.trim() || undefined, file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        {/* NAME */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Resume Name <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
          {error && (
            <p className="text-red-500 text-xs mt-1">{error}</p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* FILE UPLOAD BOX */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Upload Existing Resume (optional)
          </label>

          {!file ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-blue-500 transition">
              <UploadCloud className="text-gray-400 mb-2" size={28} />
              <p className="text-sm text-gray-600">
                Click to upload or drop file
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF or DOCX • Max 5MB • Only 1 file
              </p>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2">
                <UploadCloud size={18} className="text-blue-600" />
                <p className="text-sm text-gray-700 truncate max-w-[220px]">
                  {file.name}
                </p>
              </div>

              <button
                onClick={() => setFile(null)}
                className="text-gray-500 hover:text-red-600"
                title="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {fileError && (
            <p className="text-xs text-red-500 mt-1">
              {fileError}
            </p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {title === "Create Resume" ? "Create" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateResumeDialog;
