export const MobileLogo = () => {
  return (
    <svg
      width="220"
      height="80"
      viewBox="0 0 260 110"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="JobEditor.AI mobile logo"
    >
      {/* DOCUMENT ICON */}
      <g transform="translate(0, 5)">
        <path d="M0 0 H35 L48 13 V75 H0 Z" fill="black" />
        <path d="M35 0 V13 H48 Z" fill="#BDBDBD" />

        <rect x="7" y="22" width="30" height="4" fill="#E0E0E0" />
        <rect x="7" y="34" width="30" height="4" fill="#E0E0E0" />
        <rect x="7" y="46" width="18" height="4" fill="#E0E0E0" />
      </g>

      {/* TEXT */}
      <text
        x="70"
        y="65"
        fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
        fontWeight="700"
        fontSize="28"
        fill="black"
      >
        JobEditor
        <tspan fill="#6B7280">.AI</tspan>
      </text>
    </svg>
  );
};
