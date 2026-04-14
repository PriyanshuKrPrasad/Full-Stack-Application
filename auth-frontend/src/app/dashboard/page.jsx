'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import FormField from '@/components/FormField';
import Spinner from '@/components/Spinner';
import Alert from '@/components/Alert';
import Logo from '@/components/Logo';
import AdminPanel from '@/components/AdminPanel';

/* ── Helpers ────────────────────────────────────────────────── */
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

const fmtTime = (d) =>
  d
    ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '—';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

/* ── Sidebar Nav items ──────────────────────────────────────── */
const BASE_NAV = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Security',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    id: 'account',
    label: 'Account',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

const ADMIN_NAV = {
  id: 'admin',
  label: 'Admin Panel',
  admin: true,
  icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

/* ── Profile validate ───────────────────────────────────────── */
function validateProfile({ name, email }) {
  const errs = {};
  if (!name || name.trim().length < 2) errs.name  = 'Name must be at least 2 characters.';
  if (!email || !/\S+@\S+\.\S+/.test(email))       errs.email = 'Valid email required.';
  return errs;
}

/* ════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, loading, error, logout, updateProfile, clearError } = useAuth();

  const [tab,     setTab]     = useState('overview');
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({ name: '', email: '' });
  const [fErrors, setFErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState('');
  const [saving,  setSaving]  = useState(false);

  /* Reset success message after 4s */
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const initials = getInitials(user?.name);

  const openEdit = () => {
    setForm({ name: user?.name || '', email: user?.email || '' });
    setFErrors({}); setTouched({}); setSuccess(''); clearError();
    setEditing(true);
  };
  const cancelEdit = () => { setEditing(false); clearError(); };

  const setField = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    if (fErrors[f]) setFErrors((p) => ({ ...p, [f]: null }));
  };
  const touch = (f) => () => setTouched((p) => ({ ...p, [f]: true }));

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validateProfile(form);
    if (Object.keys(errs).length) {
      setFErrors(errs);
      setTouched({ name: true, email: true });
      return;
    }
    setSaving(true);
    const res = await updateProfile({ name: form.name.trim(), email: form.email.trim().toLowerCase() });
    setSaving(false);
    if (res.success) { setSuccess('Profile updated successfully!'); setEditing(false); }
  };

  /* ── Full-page loading skeleton ── */
  if (loading && !user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <aside style={{ width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '20px 12px' }}>
          <div className="skeleton" style={{ height: 30, width: 120, marginBottom: 28 }} />
          {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: 36, borderRadius: 9, marginBottom: 6 }} />)}
        </aside>
        <main style={{ flex: 1, padding: '40px 48px' }}>
          <div className="skeleton" style={{ height: 32, width: 240, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 16, width: 320, marginBottom: 36 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
          </div>
          <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
        </main>
      </div>
    );
  }

  /* ── Sidebar ─────────────────────────────────────────────── */
  const Sidebar = () => (
    <aside style={{
      width: 220, flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 12px',
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '2px 8px', marginBottom: 28 }}>
        <Logo size="sm" />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[...BASE_NAV, ...(user?.role === 'ADMIN' ? [ADMIN_NAV] : [])].map(({ id, label, icon, admin }) => (
          <button
            key={id}
            className={`nav-item ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {/* User card */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '10px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: 'linear-gradient(135deg, #7c6cfc, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
        }}>{initials}</div>

        <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out"
          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0, borderRadius: 6, transition: 'color 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>
  );

  /* ── Overview Tab ────────────────────────────────────────── */
  const OverviewTab = () => (
    <div className="animate-fadeIn">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          {
            label: 'Account Status',
            value: 'Active',
            detail: 'All systems operational',
            color: 'var(--success)',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            ),
          },
          {
            label: 'Member Since',
            value: fmtDate(user?.createdAt),
            detail: fmtTime(user?.createdAt),
            color: 'var(--accent)',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            ),
          },
          {
            label: 'Last Updated',
            value: fmtDate(user?.updatedAt),
            detail: fmtTime(user?.updatedAt),
            color: 'var(--text)',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            ),
          },
        ].map(({ label, value, detail, color, icon }, i) => (
          <div key={label} className={`stat-card animate-fadeUp delay-${i + 1}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                {label}
              </span>
              <span style={{ color: 'var(--muted)' }}>{icon}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', color, marginBottom: 3 }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{detail}</div>
          </div>
        ))}
      </div>

      {/* Profile summary card */}
      <div className="card animate-fadeUp delay-4" style={{ padding: 28, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>Account Summary</h2>
          <button className="btn-ghost" onClick={() => setTab('profile')} style={{ fontSize: 12, padding: '6px 14px' }}>
            View profile
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #7c6cfc, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
            boxShadow: '0 8px 24px rgba(124,108,252,0.3)',
          }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 3 }}>{user?.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-accent">{user?.role || 'USER'}</span>
              <span className="badge badge-success">
                <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>
                Active
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>User ID</div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
              #{String(user?.id).padStart(6, '0')}
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div>
          {[
            ['Full Name',  user?.name],
            ['Email',      user?.email],
            ['Role',       user?.role],
            ['Account ID', `usr_${String(user?.id).padStart(8, '0')}`],
          ].map(([k, v]) => (
            <div key={k} className="info-row">
              <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: 13 }}>{k}</span>
              <span style={{ fontWeight: 600, fontSize: 13, fontFamily: k === 'Account ID' ? 'DM Mono, monospace' : 'inherit', color: k === 'Account ID' ? 'var(--accent)' : 'var(--text)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card animate-fadeUp delay-5" style={{ padding: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Edit Profile',     sub: 'Update name & email', tab: 'profile',  icon: '✎' },
            { label: 'Security',         sub: 'Manage password',     tab: 'security', icon: '🔒' },
            { label: 'Account Settings', sub: 'Preferences & more',  tab: 'account',  icon: '⚙' },
          ].map(({ label, sub, tab: t, icon }) => (
            <button
              key={label}
              onClick={() => { setTab(t); if (t === 'profile') setTimeout(openEdit, 100); }}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
                padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
            >
              <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── Profile Tab ─────────────────────────────────────────── */
  const ProfileTab = () => (
    <div className="card animate-fadeIn" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 3 }}>Profile Information</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Update your name and email address.</p>
        </div>
        {!editing && (
          <button className="btn-ghost" onClick={openEdit}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {success && <Alert variant="success" style={{ marginBottom: 20 }}>{success}</Alert>}
      {error    && <Alert variant="error" onClose={clearError} style={{ marginBottom: 20 }}>{error}</Alert>}

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 28 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, flexShrink: 0,
          background: 'linear-gradient(135deg, #7c6cfc, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
          boxShadow: '0 8px 28px rgba(124,108,252,0.3)',
        }}>{initials}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', marginBottom: 3 }}>{user?.name}</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>{user?.email}</div>
          <span className="badge badge-accent">{user?.role}</span>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSave} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField
              label="Full name"
              type="text"
              value={form.name}
              onChange={setField('name')}
              onBlur={touch('name')}
              error={touched.name ? fErrors.name : null}
            />
            <FormField
              label="Email address"
              type="email"
              value={form.email}
              onChange={setField('email')}
              onBlur={touch('email')}
              error={touched.email ? fErrors.email : null}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '10px 22px' }}>
              {saving ? <><Spinner size={15} color="#fff" /> Saving…</> : 'Save changes'}
            </button>
            <button type="button" className="btn-ghost" onClick={cancelEdit}>Cancel</button>
          </div>
        </form>
      ) : (
        <div>
          {[
            ['User ID',       `#${user?.id}`],
            ['Full Name',     user?.name],
            ['Email Address', user?.email],
            ['Role',          user?.role],
            ['Member Since',  `${fmtDate(user?.createdAt)} at ${fmtTime(user?.createdAt)}`],
            ['Last Updated',  `${fmtDate(user?.updatedAt)} at ${fmtTime(user?.updatedAt)}`],
          ].map(([k, v]) => (
            <div key={k} className="info-row">
              <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: 13, minWidth: 140 }}>{k}</span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ── Security Tab ────────────────────────────────────────── */
  const SecurityTab = () => (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Security Settings</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 28 }}>Manage your password and session security.</p>

        <Alert variant="info" style={{ marginBottom: 24 }}>
          All passwords are hashed with bcrypt (12 rounds). Your plain-text password is never stored.
        </Alert>

        {[
          {
            title: 'Password',
            desc: 'Change your account password. Use a strong, unique password.',
            action: 'Change password',
            danger: false,
            onClick: () => alert('Password change flow — implement as needed.'),
          },
          {
            title: 'Active Sessions',
            desc: 'You are currently signed in on this browser. JWT expires in 7 days.',
            action: 'Sign out all sessions',
            danger: false,
            onClick: logout,
          },
          {
            title: 'Two-Factor Authentication',
            desc: '2FA adds an extra layer of security (coming soon).',
            action: 'Enable 2FA',
            danger: false,
            onClick: () => alert('2FA coming soon.'),
          },
        ].map(({ title, desc, action, danger, onClick }, i, arr) => (
          <div key={title}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{desc}</div>
              </div>
              <button
                className={danger ? 'btn-danger' : 'btn-ghost'}
                onClick={onClick}
                style={{ flexShrink: 0, marginLeft: 16 }}
              >
                {action}
              </button>
            </div>
            {i < arr.length - 1 && <div className="divider" />}
          </div>
        ))}
      </div>

      {/* JWT info */}
      <div className="card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Current Session Token</h3>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--accent)', wordBreak: 'break-all', lineHeight: 1.6 }}>
          {typeof document !== 'undefined'
            ? (document.cookie.split(';').find(c => c.includes('authkit_token'))?.split('=')?.[1]?.substring(0, 60) + '…' || 'Token stored in cookie')
            : 'JWT stored in httpOnly-safe cookie'}
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 10 }}>
          Token is stored as a secure cookie. Expires in 7 days. Attach as{' '}
          <code style={{ color: 'var(--accent)', fontFamily: 'DM Mono, monospace' }}>Authorization: Bearer &lt;token&gt;</code> for API calls.
        </p>
      </div>
    </div>
  );

  /* ── Account Tab ─────────────────────────────────────────── */
  const AccountTab = () => (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Account Settings</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 28 }}>Manage your account preferences and data.</p>

        {/* Account info tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Account ID', value: `usr_${String(user?.id).padStart(8, '0')}`, mono: true },
            { label: 'Plan', value: 'Free', color: 'var(--success)' },
            { label: 'Role', value: user?.role, color: 'var(--accent)' },
            { label: 'Status', value: 'Active', color: 'var(--success)' },
          ].map(({ label, value, mono, color }) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
              <div style={{ fontFamily: mono ? 'DM Mono, monospace' : 'inherit', fontWeight: 700, fontSize: 14, color: color || 'var(--text)' }}>{value}</div>
            </div>
          ))}
        </div>

        <div className="divider" style={{ marginBottom: 24 }} />

        {/* Danger zone */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)', marginBottom: 16 }}>
            Danger Zone
          </h3>
          <div style={{ border: '1px solid var(--danger-border)', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Delete account</div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>Permanently delete your account and all associated data.</div>
            </div>
            <button className="btn-danger" onClick={() => alert('Account deletion — implement confirmation modal as needed.')}>
              Delete account
            </button>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={logout}
        style={{
          width: '100%', padding: '14px', background: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)', borderRadius: 14,
          color: 'var(--danger)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.14)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--danger-bg)')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign out of AuthKit
      </button>
    </div>
  );

  const TABS = {
    overview: <OverviewTab />,
    profile:  <ProfileTab />,
    security: <SecurityTab />,
    account:  <AccountTab />,
    admin:    user?.role === 'ADMIN' ? <AdminPanel currentUserId={user?.id} /> : null,
  };
  const NAV = [...BASE_NAV, ...(user?.role === 'ADMIN' ? [ADMIN_NAV] : [])];

  /* ── Page ──────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div className="animate-fadeUp">
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 5 }}>
              {getGreeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              {NAV.find(n => n.id === tab)?.label} — manage your account settings and preferences.
            </p>
          </div>
          <div className="animate-fadeUp delay-1" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="badge badge-success">
              <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>
              System online
            </span>
            <span className="badge badge-accent">
              {user?.role === 'ADMIN' ? '👑 Admin' : '✦ Member'}
            </span>
          </div>
        </div>

        {/* Tab content */}
        <div style={{ maxWidth: 760 }}>
          {TABS[tab]}
        </div>
      </main>
    </div>
  );
}
