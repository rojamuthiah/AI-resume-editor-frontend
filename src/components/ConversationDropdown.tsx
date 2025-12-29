import React, { useRef, useEffect } from "react";

interface ConversationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  currentConversationId: string | null;
  conversationList: { id: string; title: string }[];
  onSelectConversation: (id: string | null) => void;
  currentConversationTitle: string | null;
}

const ConversationDropdown: React.FC<ConversationDropdownProps> = ({
  isOpen,
  onClose,
  currentConversationId,
  conversationList,
  onSelectConversation,
  currentConversationTitle,
}) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownOpen, setDropdownOpen] = React.useState(isOpen);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleSelectConversation = (id: string | null) => {
    onSelectConversation(id);
    setDropdownOpen(false);
    onClose();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <button
        onClick={() => setDropdownOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 border rounded-lg text-sm bg-white hover:bg-gray-50 transition"
      >
        <span className="truncate font-medium text-gray-800">
          {currentConversationTitle || "New conversation"}
        </span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${
            dropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-xl z-50 max-h-96">
          {/* New Chat Button */}
          <button
            onClick={() => handleSelectConversation(null)}
            className="w-full px-4 py-3 text-left text-blue-600 font-medium hover:bg-blue-50 border-b transition sticky top-0 bg-white"
          >
            + New Chat
          </button>

          {/* Scrollable Conversation List - Hidden Scrollbar */}
          <div className="overflow-y-auto max-h-80 hide-scrollbar">
            {conversationList.length === 0 ? (
              <div className="px-4 py-3 text-center text-gray-500 text-sm">
                No conversations yet
              </div>
            ) : (
              conversationList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectConversation(c.id)}
                  className={`w-full px-4 py-3 text-left text-sm truncate transition border-b last:border-b-0 ${
                    c.id === currentConversationId
                      ? "bg-blue-100 text-black font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  title={c.title}
                >
                  {c.title}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationDropdown;