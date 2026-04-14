export default function Logo({ size = 'md' }) {
  const iconSize  = size === 'lg' ? 42 : size === 'sm' ? 28 : 34;
  const fontSize  = size === 'lg' ? 24 : size === 'sm' ? 16 : 20;
  const radius    = size === 'lg' ? 12 : size === 'sm' ? 8 : 10;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div
        style={{
          width:          iconSize,
          height:         iconSize,
          borderRadius:   radius,
          background:     'linear-gradient(135deg, #7c6cfc 0%, #a78bfa 100%)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          boxShadow:      '0 4px 20px rgba(124,108,252,0.35)',
          flexShrink:     0,
        }}
      >
        <svg
          width={iconSize * 0.52}
          height={iconSize * 0.52}
          viewBox="0 0 22 22"
          fill="none"
        >
          {/* Lock body */}
          <rect x="3" y="10" width="16" height="11" rx="3" fill="white" fillOpacity="0.95" />
          {/* Lock shackle */}
          <path
            d="M7 10V7a4 4 0 0 1 8 0v3"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeOpacity="0.7"
            fill="none"
          />
          {/* Keyhole */}
          <circle cx="11" cy="15.5" r="1.8" fill="rgba(124,108,252,0.8)" />
        </svg>
      </div>
      <span
        style={{
          fontSize:      fontSize,
          fontWeight:    800,
          letterSpacing: '-0.03em',
          color:         'var(--text)',
          lineHeight:    1,
        }}
      >
        StockKit
      </span>
    </div>
  );
}
