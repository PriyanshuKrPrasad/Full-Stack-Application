'use client';

const VARIANTS = {
  error: {
    className: 'alert alert-error',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  success: {
    className: 'alert alert-success',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
  },
  info: {
    className: 'alert alert-info',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
};

export default function Alert({ variant = 'error', children, onClose, style = {} }) {
  const { className, icon } = VARIANTS[variant] || VARIANTS.error;

  return (
    <div className={className} role="alert" style={{ ...style }}>
      {icon}
      <span style={{ flex: 1, lineHeight: 1.5 }}>{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'inherit', opacity: 0.7, padding: '0 2px',
            display: 'flex', alignItems: 'center', flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}
