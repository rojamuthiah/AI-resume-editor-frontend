import React from "react";
import { diffWordsWithSpace } from "diff";

interface PreviewModalProps {
  sectionKey: string;
  before: any;
  after: any;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  sectionKey,
  before,
  after,
  onClose,
}) => {
  const formatValue = (val: any): string => {
    if (typeof val === "string") return val;
    if (Array.isArray(val)) return val.join("\n");
    if (typeof val === "object") return JSON.stringify(val, null, 2);
    return String(val);
  };

  const beforeStr = formatValue(before);
  const afterStr = formatValue(after);
  const diffs = diffWordsWithSpace(beforeStr, afterStr);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Preview: {sectionKey.replace(/([A-Z])/g, " $1").trim()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Side by side comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Before */}
            <div>
              <h3 className="font-semibold text-red-700 mb-3">Before</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono text-gray-800 max-h-64 overflow-y-auto">
                {beforeStr}
              </div>
            </div>

            {/* After */}
            <div>
              <h3 className="font-semibold text-green-700 mb-3">After</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono text-gray-800 max-h-64 overflow-y-auto">
                {afterStr}
              </div>
            </div>
          </div>

          {/* Diff View */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Diff View</h3>
            <div className="bg-gray-50 border rounded-lg p-4 text-sm font-mono max-h-64 overflow-y-auto">
              {diffs.map((part, idx) => (
                <span
                  key={idx}
                  className={`${
                    part.added
                      ? "bg-green-200 text-green-900"
                      : part.removed
                      ? "bg-red-200 text-red-900"
                      : "text-gray-800"
                  }`}
                >
                  {part.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;