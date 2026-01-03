import { Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  text?: string;
}

const AILoadingOverlay: React.FC<Props> = ({
  open,
  text = "Extracting and optimizing content from your resume..."
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl px-8 py-6 shadow-xl flex flex-col items-center">
        {/* Animated icon */}
        <div className="relative mb-4">
          <Sparkles
            size={36}
            className="text-blue-600 animate-pulse"
          />
        </div>

        <p className="text-sm font-medium text-gray-700 text-center max-w-xs">
          {text}
        </p>

        {/* subtle progress dots */}
        <div className="flex gap-1 mt-3">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150" />
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300" />
        </div>
      </div>
    </div>
  );
};

export default AILoadingOverlay;
