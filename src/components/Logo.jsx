export default function Logo({ size = 120, showText = true }) {
  const scale = size / 120

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="60,6 106,32.5 106,87.5 60,114 14,87.5 14,32.5"
          fill="none"
          stroke="#34D399"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="60" cy="60" r="22" fill="none" stroke="#34D399" strokeWidth="2" />
        <text
          x="60"
          y="67"
          textAnchor="middle"
          fill="#34D399"
          fontSize="22"
          fontWeight="600"
          fontFamily="system-ui, sans-serif"
        >
          $
        </text>
      </svg>

      {showText && (
        <div style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: 500,
          fontSize: `${14 * scale}px`,
          letterSpacing: '0.2px',
          lineHeight: 1,
        }}>
          <span style={{ color: '#ffffff' }}>my.</span>
          <span style={{ color: '#34D399' }}>budget</span>
        </div>
      )}
    </div>
  )
}
