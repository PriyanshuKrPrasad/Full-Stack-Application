'use client';
import { useState, useId } from 'react';

export default function FormField({
  label,
  error,
  hint,
  type = 'text',
  className = '',
  style = {},
  ...inputProps
}) {
  const id            = useId();
  const [show, setShow] = useState(false);
  const isPassword    = type === 'password';
  const inputType     = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize:      '11px',
            fontWeight:    700,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color:         error ? 'var(--danger)' : 'var(--muted)',
            userSelect:    'none',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={inputType}
          {...inputProps}
          className={`form-input ${error ? 'error' : ''} ${className}`}
          style={{ paddingRight: isPassword ? '15px' : undefined }}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? 'Hide password' : 'Show password'}
            style={{
              position:  'absolute',
              right:     '12px',
              top:       '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border:    'none',
              color:     'var(--muted)',
              cursor:    'pointer',
              padding:   '2px 4px',
              display:   'flex',
              alignItems: 'center',
              lineHeight: 1,
              fontSize:   '15px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            {show ? (
              /* eye-off */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              /* eye */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          style={{ fontSize: '12px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </span>
      )}

      {hint && !error && (
        <span id={`${id}-hint`} style={{ fontSize: '12px', color: 'var(--muted)' }}>{hint}</span>
      )}
    </div>
  );
}
