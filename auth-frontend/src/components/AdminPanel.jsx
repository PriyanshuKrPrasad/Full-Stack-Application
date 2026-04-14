'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/services/api';
import Spinner from '@/components/Spinner';
import Alert from '@/components/Alert';

/* ── Helpers ────────────────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const RoleBadge = ({ role }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
    background: role === 'ADMIN' ? 'rgba(124,108,252,0.12)' : 'rgba(52,211,153,0.1)',
    border: `1px solid ${role === 'ADMIN' ? 'rgba(124,108,252,0.25)' : 'rgba(52,211,153,0.22)'}`,
    color: role === 'ADMIN' ? 'var(--accent)' : 'var(--success)',
  }}>
    {role === 'ADMIN' ? '👑' : '✦'} {role}
  </span>
);

/* ── Stat Card ───────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '20px 22px',
    borderTop: `2px solid ${color}`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        {label}
      </span>
      <span style={{ fontSize: 18 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', color, marginBottom: 4 }}>
      {value ?? <span style={{ fontSize: 18, color: 'var(--muted)' }}>—</span>}
    </div>
    {sub && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</div>}
  </div>
);

/* ── Confirm Dialog ──────────────────────────────────────────── */
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  }}>
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 16, padding: 32, maxWidth: 400, width: '90%',
      boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
    }}>
      <div style={{ fontSize: 32, marginBottom: 16, textAlign: 'center' }}>⚠️</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 10 }}>
        Are you sure?
      </h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '10px', background: 'none',
          border: '1.5px solid var(--border)', borderRadius: 9,
          color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          Cancel
        </button>
        <button onClick={onConfirm} style={{
          flex: 1, padding: '10px',
          background: 'rgba(248,113,113,0.12)', border: '1.5px solid rgba(248,113,113,0.3)',
          borderRadius: 9, color: 'var(--danger)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>
          Yes, delete
        </button>
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════ */
export default function AdminPanel({ currentUserId }) {
  const [stats,       setStats]       = useState(null);
  const [users,       setUsers]       = useState([]);
  const [pagination,  setPagination]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [tableLoading,setTableLoading]= useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('');
  const [page,        setPage]        = useState(1);
  const [confirm,     setConfirm]     = useState(null); // { userId, userName }
  const [actionLoading, setActionLoading] = useState(null); // userId being acted on

  /* ── Load stats ───────────────────────────────────────────── */
  const loadStats = useCallback(async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.data.stats);
    } catch {
      setError('Failed to load statistics.');
    }
  }, []);

  /* ── Load users ───────────────────────────────────────────── */
  const loadUsers = useCallback(async (opts = {}) => {
    setTableLoading(true);
    try {
      const res = await adminAPI.getUsers({
        page:   opts.page   ?? page,
        limit:  10,
        search: opts.search ?? search,
        role:   opts.role   ?? roleFilter,
      });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch {
      setError('Failed to load users.');
    } finally {
      setTableLoading(false);
    }
  }, [page, search, roleFilter]);

  /* ── Initial load ─────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadUsers({ page: 1 })]);
      setLoading(false);
    })();
  }, []); // eslint-disable-line

  /* ── Auto-clear success ───────────────────────────────────── */
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 3500);
    return () => clearTimeout(t);
  }, [success]);

  /* ── Search handler (debounced) ───────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      loadUsers({ page: 1, search, role: roleFilter });
    }, 350);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  /* ── Role filter ──────────────────────────────────────────── */
  const handleRoleFilter = (r) => {
    setRoleFilter(r);
    setPage(1);
    loadUsers({ page: 1, search, role: r });
  };

  /* ── Pagination ───────────────────────────────────────────── */
  const goTo = (p) => {
    setPage(p);
    loadUsers({ page: p, search, role: roleFilter });
  };

  /* ── Change role ──────────────────────────────────────────── */
  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId);
    setError('');
    try {
      await adminAPI.changeRole(userId, newRole);
      setSuccess(`Role updated to ${newRole} successfully.`);
      await Promise.all([loadStats(), loadUsers()]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Delete user ──────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!confirm) return;
    setActionLoading(confirm.userId);
    setConfirm(null);
    setError('');
    try {
      await adminAPI.deleteUser(confirm.userId);
      setSuccess(`User "${confirm.userName}" deleted successfully.`);
      await Promise.all([loadStats(), loadUsers()]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Full loading state ───────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Stat skeletons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Alerts ─────────────────────────────────────────── */}
      {error   && <Alert variant="error"   onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}

      {/* ── Stats row ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <StatCard label="Total Users"    value={stats?.totalUsers}   sub="All registered accounts" color="var(--accent)"  icon="👥" />
        <StatCard label="New Today"      value={stats?.newToday}     sub="Registered today"         color="var(--success)" icon="✨" />
        <StatCard label="New This Week"  value={stats?.newThisWeek}  sub="Last 7 days"              color="var(--warning)" icon="📈" />
        <StatCard label="New This Month" value={stats?.newThisMonth} sub="This calendar month"      color="#a78bfa"        icon="📅" />
      </div>

      {/* ── Role breakdown ─────────────────────────────────── */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 6 }}>
            Role distribution
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700 }}>
              <span style={{ color: 'var(--accent)', fontSize: 18 }}>👑</span>
              <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent)' }}>
                {stats?.adminCount ?? 0}
              </span>
              <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: 13 }}>Admins</span>
            </div>
            <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--success)', fontSize: 18 }}>✦</span>
              <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--success)' }}>
                {stats?.userCount ?? 0}
              </span>
              <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: 13 }}>Members</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
            <span>Members ({stats?.userCount ?? 0})</span>
            <span>Admins ({stats?.adminCount ?? 0})</span>
          </div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, var(--success), var(--accent))',
              width: stats?.totalUsers
                ? `${Math.max(4, (stats.userCount / stats.totalUsers) * 100)}%`
                : '0%',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => Promise.all([loadStats(), loadUsers()])}
          style={{
            background: 'var(--subtle)', border: '1px solid var(--border)',
            borderRadius: 9, padding: '8px 16px', color: 'var(--muted)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Users table ────────────────────────────────────── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>

        {/* Table header bar */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 34px',
                background: 'var(--input-bg)', border: '1.5px solid var(--border)',
                borderRadius: 9, color: 'var(--text)', fontSize: 13, outline: 'none',
              }}
            />
          </div>

          {/* Role filter pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[['', 'All'], ['USER', 'Members'], ['ADMIN', 'Admins']].map(([val, label]) => (
              <button key={val} onClick={() => handleRoleFilter(val)} style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: `1.5px solid ${roleFilter === val ? 'var(--accent)' : 'var(--border)'}`,
                background: roleFilter === val ? 'rgba(124,108,252,0.1)' : 'transparent',
                color: roleFilter === val ? 'var(--accent)' : 'var(--muted)',
                transition: 'all 0.15s',
              }}>
                {label}
              </button>
            ))}
          </div>

          {pagination && (
            <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}>
              {pagination.total} user{pagination.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface)' }}>
                {['User', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left', fontSize: 11,
                    fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                    color: 'var(--muted)', borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 48, textAlign: 'center' }}>
                    <Spinner size={28} color="var(--accent)" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                    No users found.
                  </td>
                </tr>
              ) : users.map((u, i) => (
                <tr key={u.id} style={{
                  borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.1s',
                  background: actionLoading === u.id ? 'rgba(124,108,252,0.04)' : 'transparent',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = actionLoading === u.id ? 'rgba(124,108,252,0.04)' : 'transparent'}
                >
                  {/* User */}
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: u.role === 'ADMIN'
                          ? 'linear-gradient(135deg,#7c6cfc,#a78bfa)'
                          : 'linear-gradient(135deg,#1c1c32,#2a2a45)',
                        border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800, color: '#fff',
                      }}>
                        {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {u.name}
                          {u.id === currentUserId && (
                            <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, background: 'rgba(124,108,252,0.1)', padding: '1px 7px', borderRadius: 99 }}>
                              You
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>ID #{u.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: '13px 16px', color: 'var(--muted)', fontSize: 13 }}>{u.email}</td>

                  {/* Role */}
                  <td style={{ padding: '13px 16px' }}><RoleBadge role={u.role} /></td>

                  {/* Joined */}
                  <td style={{ padding: '13px 16px', color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {fmtDate(u.createdAt)}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '13px 16px' }}>
                    {actionLoading === u.id ? (
                      <Spinner size={16} color="var(--accent)" />
                    ) : (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {/* Toggle role */}
                        <button
                          onClick={() => handleRoleChange(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                          disabled={u.id === currentUserId && u.role === 'ADMIN'}
                          title={u.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                          style={{
                            padding: '5px 11px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                            background: u.role === 'ADMIN' ? 'rgba(248,113,113,0.08)' : 'rgba(124,108,252,0.1)',
                            border: `1px solid ${u.role === 'ADMIN' ? 'rgba(248,113,113,0.2)' : 'rgba(124,108,252,0.25)'}`,
                            color: u.role === 'ADMIN' ? 'var(--danger)' : 'var(--accent)',
                            opacity: (u.id === currentUserId && u.role === 'ADMIN') ? 0.4 : 1,
                          }}
                        >
                          {u.role === 'ADMIN' ? '↓ Demote' : '↑ Promote'}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setConfirm({ userId: u.id, userName: u.name })}
                          disabled={u.id === currentUserId}
                          title="Delete user"
                          style={{
                            padding: '5px 9px', borderRadius: 7, cursor: 'pointer',
                            background: 'rgba(248,113,113,0.08)',
                            border: '1px solid rgba(248,113,113,0.2)',
                            color: 'var(--danger)', fontSize: 13,
                            opacity: u.id === currentUserId ? 0.3 : 1,
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{
            padding: '14px 20px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => goTo(page - 1)} disabled={!pagination.hasPrev} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: 'none', border: '1.5px solid var(--border)',
                color: pagination.hasPrev ? 'var(--text)' : 'var(--muted)',
                cursor: pagination.hasPrev ? 'pointer' : 'not-allowed', opacity: pagination.hasPrev ? 1 : 0.4,
              }}>← Prev</button>
              <button onClick={() => goTo(page + 1)} disabled={!pagination.hasNext} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: 'none', border: '1.5px solid var(--border)',
                color: pagination.hasNext ? 'var(--text)' : 'var(--muted)',
                cursor: pagination.hasNext ? 'pointer' : 'not-allowed', opacity: pagination.hasNext ? 1 : 0.4,
              }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Confirm dialog ─────────────────────────────────── */}
      {confirm && (
        <ConfirmDialog
          message={`This will permanently delete "${confirm.userName}" and all their data. This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
