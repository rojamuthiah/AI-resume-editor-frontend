
import { useEffect } from "react";

const Toast = ({ message, type, onClose }: { message: string; type: "error" | "success"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
      type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
    }`}>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default Toast;
