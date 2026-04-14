'use client';

const getStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map = [
    { label: '',        color: 'var(--border)' },
    { label: 'Weak',    color: 'var(--danger)'  },
    { label: 'Fair',    color: 'var(--warning)'  },
    { label: 'Good',    color: 'var(--success)'  },
    { label: 'Strong',  color: 'var(--accent)'   },
  ];
  return { score, ...map[score] };
};

export default function PasswordStrength({ password }) {
  if (!password) return null;
  const { score, label, color } = getStrength(password);

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            style={{
              flex:         1,
              height:       '3px',
              borderRadius: '99px',
              background:   n <= score ? color : 'var(--border)',
              transition:   'background 0.3s ease',
            }}
          />
        ))}
      </div>
      {label && (
        <span style={{ fontSize: '11px', fontWeight: 700, color, letterSpacing: '0.03em' }}>
          {label}
        </span>
      )}
    </div>
  );
}
