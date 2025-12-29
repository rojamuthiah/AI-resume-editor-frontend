export const NavLogo = ({ variant = "dark" }) => {
  const isLight = variant === "light";

  return (
    <div className="flex items-center gap-1 leading-none">
      {/* ICON */}
      <svg
        viewBox="0 0 70 110"
        className="h-[44px] w-auto block"
        preserveAspectRatio="xMinYMid meet"
      >
        <g transform="translate(0, 5)">
          <path d="M0 0 H45 L60 15 V95 H0 Z" fill={isLight ? "black" : "white"} />
          <path d="M45 0 V15 H60 Z" fill={isLight ? "#9CA3AF" : "#E0E0E0"} />
          <rect x="10" y="30" width="40" height="5" fill={isLight ? "#E5E7EB" : "#333"} />
          <rect x="10" y="45" width="40" height="5" fill={isLight ? "#E5E7EB" : "#333"} />
          <rect x="10" y="60" width="25" height="5" fill={isLight ? "#E5E7EB" : "#333"} />
        </g>
      </svg>

      
    </div>
  );
};
