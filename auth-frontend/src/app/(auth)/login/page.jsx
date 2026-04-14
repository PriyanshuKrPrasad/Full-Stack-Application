'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import FormField from '@/components/FormField';
import Spinner from '@/components/Spinner';
import Alert from '@/components/Alert';
import Logo from '@/components/Logo';

/* ── Validation ─────────────────────────────────────────────── */
function validate({ email, password }) {
  const errs = {};
  if (!email)
    errs.email = 'Email is required.';
  else if (!/\S+@\S+\.\S+/.test(email))
    errs.email = 'Please enter a valid email address.';

  if (!password)
    errs.password = 'Password is required.';
  else if (password.length < 6)
    errs.password = 'Password must be at least 6 characters.';

  return errs;
}

/* ── Component ──────────────────────────────────────────────── */
export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth();

  const [form,   setForm]   = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])   setErrors((prev) => ({ ...prev, [field]: null }));
    if (error)           clearError();
  };

  const touch = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTouched({ email: true, password: true });
      return;
    }
    await login({ email: form.email.trim(), password: form.password });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>

      {/* Background decorations */}
      <div className="auth-grid" />
      <div className="auth-glow" />

      {/* Corner accents */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '200px', height: '200px',
        background: 'radial-gradient(circle at 0 0, rgba(124,108,252,0.06), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: 0, right: 0, width: '200px', height: '200px',
        background: 'radial-gradient(circle at 100% 100%, rgba(124,108,252,0.06), transparent 70%)', pointerEvents: 'none' }} />

      {/* Card */}
      <div
        className="animate-fadeUp"
        style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}
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
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '6px' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
              Sign in to your account to continue.
            </p>
          </div>

          {/* Server error */}
          {error && (
            <Alert variant="error" onClose={clearError} style={{ marginBottom: '20px' }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <FormField
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={setField('email')}
                onBlur={touch('email')}
                error={touched.email ? errors.email : null}
                autoComplete="email"
                autoFocus
              />

              <FormField
                label="Password"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={setField('password')}
                onBlur={touch('password')}
                error={touched.password ? errors.password : null}
                autoComplete="current-password"
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ marginTop: '4px', width: '100%', padding: '13px' }}
              >
                {loading ? (
                  <><Spinner size={16} color="#fff" /> Signing in…</>
                ) : (
                  <>Sign in
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div className="divider" style={{ flex: 1 }} />
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>OR</span>
            <div className="divider" style={{ flex: 1 }} />
          </div>

          {/* Demo credentials info */}
          <div
            className="alert alert-info"
            style={{ fontSize: '12px', lineHeight: 1.6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>
              <strong>New here?</strong> Create a free account in seconds — no credit card required.
            </span>
          </div>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '13px', marginTop: '24px' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 700 }}>
            Create one free →
          </Link>
        </p>
      </div>
    </div>
  );
}
