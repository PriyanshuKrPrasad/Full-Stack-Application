export default function Spinner({ size = 18, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0, display: 'block' }}
      aria-label="Loading"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke={color}
        strokeWidth="2.5"
        strokeOpacity="0.18"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
