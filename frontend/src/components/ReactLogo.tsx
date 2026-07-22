/* Animated React Atom SVG component */
export const ReactLogo = ({
  size = 40,
  animate = true,
}: {
  size?: number
  animate?: boolean
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible' }}
  >
    <defs>
      <radialGradient id="coreg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#61dafb" stopOpacity="1" />
        <stop offset="100%" stopColor="#21a1c4" stopOpacity="1" />
      </radialGradient>
    </defs>

    {/* Orbit 1 */}
    <ellipse
      cx="50" cy="50" rx="46" ry="18"
      fill="none" stroke="#61dafb" strokeWidth="2.5" strokeOpacity="0.7"
      style={animate ? { animation: 'orbit1 3s linear infinite', transformOrigin: '50px 50px' } : {}}
    />
    {/* Orbit 2 Ã¢â‚¬â€œ rotated 60Ã‚Â° */}
    <ellipse
      cx="50" cy="50" rx="46" ry="18"
      fill="none" stroke="#61dafb" strokeWidth="2.5" strokeOpacity="0.7"
      transform="rotate(60 50 50)"
      style={animate ? { animation: 'orbit2 3s linear infinite reverse', transformOrigin: '50px 50px' } : {}}
    />
    {/* Orbit 3 Ã¢â‚¬â€œ rotated 120Ã‚Â° */}
    <ellipse
      cx="50" cy="50" rx="46" ry="18"
      fill="none" stroke="#61dafb" strokeWidth="2.5" strokeOpacity="0.7"
      transform="rotate(120 50 50)"
      style={animate ? { animation: 'orbit1 3s linear infinite', transformOrigin: '50px 50px', animationDelay: '-1.5s' } : {}}
    />

    {/* Core nucleus */}
    <circle cx="50" cy="50" r="8" fill="url(#coreg)" style={animate ? { animation: 'pulse 2s ease-in-out infinite' } : {}} />

    <style>{`
      @keyframes orbit1 {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes orbit2 {
        from { transform: rotate(60deg); }
        to   { transform: rotate(420deg); }
      }
      @keyframes pulse {
        0%, 100% { r: 8; opacity: 1; }
        50%       { r: 10; opacity: 0.8; }
      }
    `}</style>
  </svg>
)
