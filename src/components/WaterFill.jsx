export default function WaterFill({ percent, size = 160 }) {
  const clamp = Math.min(100, Math.max(0, percent))
  const fillHeight = (clamp / 100) * size

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Circle clip */}
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <clipPath id="circleClip">
            <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} />
          </clipPath>
        </defs>
        {/* Background */}
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill="#ddf0f8" />
        {/* Water fill */}
        <rect
          x={4}
          y={size - fillHeight - 4}
          width={size - 8}
          height={fillHeight}
          fill="#4ab8e8"
          clipPath="url(#circleClip)"
          opacity={0.85}
        />
        {/* Wave overlay */}
        <path
          d={`M 4 ${size - fillHeight - 4} Q ${size * 0.25} ${size - fillHeight - 14} ${size * 0.5} ${size - fillHeight - 4} Q ${size * 0.75} ${size - fillHeight + 6} ${size - 4} ${size - fillHeight - 4} L ${size - 4} ${size} L 4 ${size} Z`}
          fill="#4ab8e8"
          clipPath="url(#circleClip)"
          opacity={0.85}
        />
        {/* Border */}
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill="none" stroke="#b8dff0" strokeWidth={3} />
      </svg>
      {/* Center label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size * 0.18, fontWeight: 700, color: clamp > 55 ? '#fff' : '#2a6080' }}>
          {clamp.toFixed(0)}%
        </span>
        <span style={{ fontSize: size * 0.09, color: clamp > 55 ? '#e0f4ff' : '#7ab8d4', fontWeight: 500 }}>
          of limit
        </span>
      </div>
    </div>
  )
}
