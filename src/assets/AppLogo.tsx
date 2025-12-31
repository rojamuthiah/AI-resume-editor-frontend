export const Logo = ({ variant = "dark" }) => {
  const isLight = variant === "light";

  return (
    <svg
      viewBox="0 0 320 110"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Jobeditor.AI logo"
      className="w-full h-auto"
    >
      {/* SVG FONT DECLARATION */}
      <style>
        {`
          .logo-text {
            font-family: 'Poppins', system-ui, sans-serif;
            font-weight: 600;
            letter-spacing: -0.4px;
          }
        `}
      </style>

      {/* DOCUMENT ICON */}
      <g transform="translate(0, 5)">
        <path
          d="M0 0 H45 L60 15 V95 H0 Z"
          fill={isLight ? "black" : "white"}
        />
        <path
          d="M45 0 V15 H60 Z"
          fill={isLight ? "#9CA3AF" : "#E0E0E0"}
        />

        <rect x="10" y="30" width="40" height="5" fill={isLight ? "#E5E7EB" : "#333"} />
        <rect x="10" y="45" width="40" height="5" fill={isLight ? "#E5E7EB" : "#333"} />
        <rect x="10" y="60" width="25" height="5" fill={isLight ? "#E5E7EB" : "#333"} />
      </g>

      {/* TEXT */}
      <text
        x="80"
        y="92"
        fontSize="34"
        className="logo-text"
        fill={isLight ? "black" : "white"}
      >
        Jobeditor
        <tspan fill={isLight ? "#6B7280" : "#CCCCCC"}>.AI</tspan>
      </text>
    </svg>
  );
};
