// Reusable SVG mug component with live customization preview
function Mug({ model, photoUrl, name, dedication, size = 280, showPhoto = true, magic = false }) {
  const scale = model.scale || 1;
  const w = size;
  const h = size;
  const isDark = !!model.bodyTint;
  const bodyFill = model.bodyTint || "#ffffff";
  const bodyStroke = model.rim || "#e8e1da";
  const handleColor = model.handleColor || bodyStroke;
  const interiorColor = model.interiorTint || (isDark ? "#1a1311" : "#f4ece4");
  const textColor = model.textColor || "#2a1f1c";

  return (
    <svg viewBox="0 0 320 280" width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`body-${model.id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={isDark ? "#1f1612" : "#f0e8e0"} />
          <stop offset="0.15" stopColor={isDark ? "#3a2a26" : "#ffffff"} />
          <stop offset="0.85" stopColor={isDark ? "#3a2a26" : "#ffffff"} />
          <stop offset="1" stopColor={isDark ? "#1f1612" : "#e8dfd6"} />
        </linearGradient>
        <clipPath id={`clip-${model.id}`}>
          <rect x="60" y="60" width="180" height="160" rx="6" />
        </clipPath>
      </defs>

      {/* Shadow */}
      <ellipse cx="160" cy="240" rx="100" ry="8" fill="rgba(40,20,15,.10)" />

      <g transform={`translate(160 140) scale(${scale}) translate(-160 -140)`}>
        {/* Handle */}
        <path
          d={`M 240 105 C 285 105 285 175 240 175`}
          fill="none"
          stroke={handleColor}
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M 240 115 C 273 115 273 165 240 165`}
          fill="none"
          stroke={interiorColor}
          strokeWidth="2"
          opacity="0.6"
        />

        {/* Body */}
        <rect
          x="60" y="80" width="180" height="140" rx="8"
          fill={`url(#body-${model.id})`}
          stroke={bodyStroke}
          strokeWidth="1"
        />

        {/* Inner rim shadow */}
        <ellipse cx="150" cy="84" rx="90" ry="8" fill={interiorColor} />
        <ellipse cx="150" cy="82" rx="90" ry="6" fill={isDark ? "#0f0a08" : "#f6ede4"} opacity="0.9" />

        {/* Photo area on body */}
        {showPhoto && (
          <g clipPath={`url(#clip-${model.id})`}>
            {photoUrl ? (
              <image href={photoUrl} x="60" y="60" width="180" height="160" preserveAspectRatio="xMidYMid slice" opacity={magic ? 0.8 : 1} />
            ) : (
              <g>
                <rect x="60" y="60" width="180" height="160" fill={isDark ? "#2a1e1a" : "#f5e8df"} />
                <g stroke={isDark ? "#3a2a26" : "#e8d5c5"} strokeWidth="0.8">
                  {[...Array(20)].map((_, i) => (
                    <line key={i} x1={60 + i * 12} y1="60" x2={60 + i * 12 - 30} y2="220" />
                  ))}
                </g>
                <text x="150" y="140" textAnchor="middle" fontSize="9"
                  fontFamily="ui-monospace, Menlo, monospace"
                  fill={isDark ? "#a89890" : "#9b8a82"}>[ tu foto aquí ]</text>
              </g>
            )}
          </g>
        )}

        {/* Name */}
        {name && (
          <text x="150" y={photoUrl || !showPhoto ? 200 : 195} textAnchor="middle"
                fontFamily="Cormorant Garamond, serif"
                fontStyle="italic"
                fontSize="20"
                fontWeight="500"
                fill={textColor}>
            {name}
          </text>
        )}

        {/* Dedication (small) */}
        {dedication && (
          <text x="150" y={210} textAnchor="middle"
                fontFamily="DM Sans, sans-serif"
                fontSize="7"
                fill={textColor}
                opacity="0.7">
            {dedication.length > 38 ? dedication.slice(0, 36) + "…" : dedication}
          </text>
        )}

        {/* Gold rim accent */}
        {model.id === "dorada" && (
          <>
            <rect x="60" y="80" width="180" height="3" fill="#c9a472" />
            <rect x="60" y="217" width="180" height="3" fill="#c9a472" />
          </>
        )}

        {/* Highlight */}
        <rect x="68" y="84" width="6" height="130" rx="3" fill="#ffffff" opacity={isDark ? 0.08 : 0.55} />
      </g>
    </svg>
  );
}

window.Mug = Mug;
