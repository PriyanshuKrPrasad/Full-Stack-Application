'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import FormField from '@/components/FormField';
import PasswordStrength from '@/components/PasswordStrength';
import Spinner from '@/components/Spinner';
import Alert from '@/components/Alert';
import Logo from '@/components/Logo';

/* ── Validation ─────────────────────────────────────────────── */
function validate({ name, email, password, confirm }) {
  const errs = {};

  if (!name || name.trim().length < 2)
    errs.name = 'Name must be at least 2 characters.';

  if (!email)
    errs.email = 'Email is required.';
  else if (!/\S+@\S+\.\S+/.test(email))
    errs.email = 'Please enter a valid email address.';

  if (!password)
    errs.password = 'Password is required.';
  else if (password.length < 6)
    errs.password = 'Password must be at least 6 characters.';

  if (!confirm)
    errs.confirm = 'Please confirm your password.';
  else if (confirm !== password)
    errs.confirm = 'Passwords do not match.';

  return errs;
}

/* ── Component ──────────────────────────────────────────────── */
export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    if (error)         clearError();
  };

  const touch = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTouched({ name: true, email: true, password: true, confirm: true });
      return;
    }
    await register({
      name:     form.name.trim(),
      email:    form.email.trim().toLowerCase(),
      password: form.password,
    });
  };

  /* ── Perks list ─────────────────────────────────────────── */
  const perks = [
    'JWT-secured authentication',
    'Protected dashboard access',
    'Profile management',
    'Role-based access control',
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>

      <div className="auth-grid" />
      <div className="auth-glow" />

      <div
        className="animate-fadeUp"
        style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
          <Logo />
        </div>

        <div
          className="card"
          style={{ padding: '40px', boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,108,252,0.05)' }}
        >
          {/* Heading */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '6px' }}>
              Create your account
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
              Free forever. No credit card required.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
            {perks.map((perk) => (
              <span key={perk} className="badge badge-accent">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                {perk}
              </span>
            ))}
          </div>

          {/* Server error */}
          {error && (
            <Alert variant="error" onClose={clearError} style={{ marginBottom: '20px' }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <FormField
                label="Full name"
                type="text"
                placeholder="Alice Johnson"
                value={form.name}
                onChange={setField('name')}
                onBlur={touch('name')}
                error={touched.name ? errors.name : null}
                autoComplete="name"
                autoFocus
              />

              <FormField
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={setField('email')}
                onBlur={touch('email')}
                error={touched.email ? errors.email : null}
                autoComplete="email"
              />

              <div>
                <FormField
                  label="Password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={setField('password')}
                  onBlur={touch('password')}
                  error={touched.password ? errors.password : null}
                  autoComplete="new-password"
                />
                <PasswordStrength password={form.password} />
              </div>

              <FormField
                label="Confirm password"
                type="password"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={setField('confirm')}
                onBlur={touch('confirm')}
                error={touched.confirm ? errors.confirm : null}
                autoComplete="new-password"
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ marginTop: '6px', width: '100%', padding: '13px' }}
              >
                {loading ? (
                  <><Spinner size={16} color="#fff" /> Creating account…</>
                ) : (
                  <>Create free account
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>

            </div>
          </form>

          {/* Terms */}
          <p style={{ color: 'var(--muted)', fontSize: '11px', textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }}>
            By creating an account, you agree to our{' '}
            <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Terms of Service</span>{' '}
            and{' '}
            <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '13px', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
