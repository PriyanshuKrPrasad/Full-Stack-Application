'use client';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, setToken, removeToken, getToken } from '@/services/api';

// ── Context ────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuthInternal();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ── Internal hook ──────────────────────────────────────────────
function useAuthInternal() {
  const router = useRouter();
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Hydrate user from token on mount
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    authAPI.getProfile()
      .then((res) => setUser(res.data.data.user))
      .catch(() => { removeToken(); })
      .finally(() => setLoading(false));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.register({ name, email, password });
      const { token, data } = res.data;
      setToken(token);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      const { token, data } = res.data;
      setToken(token);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    router.push('/login');
  }, [router]);

  const updateProfile = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.updateProfile(payload);
      setUser(res.data.data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading, error, clearError, register, login, logout, updateProfile };
}
