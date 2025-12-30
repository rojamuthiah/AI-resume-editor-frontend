import React, { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

const CreateResumeDialog: React.FC<Props> = ({
  open,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleCreate = () => {
    if (!name.trim()) {
      setError("Resume name is required");
      return;
    }

    onCreate(name.trim(), description.trim() || undefined);
    setName("");
    setDescription("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Create Resume
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Resume Name <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Backend Engineer Resume"
          />
          {error && (
            <p className="text-red-500 text-xs mt-1">
              {error}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Personal notes about this resume"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateResumeDialog;
