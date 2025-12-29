export const NavLogo = ({ variant = "dark" }) => {
  const isLight = variant === "light";

  return (
    <div className="flex items-center gap-1 leading-none">
      {/* DOCUMENT ICON */}
      <svg
        viewBox="0 0 70 110"              // 🔥 trimmed viewBox (NO RIGHT GAP)
        xmlns="http://www.w3.org/2000/svg"
        aria-label="JobEditor.AI icon"
        className="h-[44px] w-auto block"
        preserveAspectRatio="xMinYMid meet"
      >
        <g transform="translate(0, 5)">
          <path
            d="M0 0 H45 L60 15 V95 H0 Z"
            fill={isLight ? "black" : "white"}
          />
          <path
            d="M45 0 V15 H60 Z"
            fill={isLight ? "#9CA3AF" : "#E0E0E0"}
          />

          <rect x="10" y="30" width="40" height="5" fill={isLight ? "#E5E7EB" : "#333333"} />
          <rect x="10" y="45" width="40" height="5" fill={isLight ? "#E5E7EB" : "#333333"} />
          <rect x="10" y="60" width="25" height="5" fill={isLight ? "#E5E7EB" : "#333333"} />
        </g>
      </svg>

      {/* JE.AI TEXT */}
      <span className="text-[18px] font-bold leading-none">
        JE<span className="text-gray-500">.AI</span>
      </span>
    </div>
  );
};
