const TypingIndicator = () => (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow">
        AI
      </div>
  
      <div className="bg-white border rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
  
export default TypingIndicator;