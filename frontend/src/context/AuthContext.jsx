import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Session restore on mount ───────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      // Support both rememberMe (localStorage) and session-only (sessionStorage)
      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      const savedUser =
        localStorage.getItem('user') || sessionStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Optimistically set user from storage so UI doesn't flash
          setUser(JSON.parse(savedUser));

          // Verify token with backend
          const response = await api.get('/auth/me');
          if (response.success && response.user) {
            setUser(response.user);
            // Persist updated user data in whichever store was used
            if (localStorage.getItem('token')) {
              localStorage.setItem('user', JSON.stringify(response.user));
            } else {
              sessionStorage.setItem('user', JSON.stringify(response.user));
            }
          }
        } catch (err) {
          // Token is invalid/expired — clean up
          console.warn('Session verification failed, logging out:', err.message);
          _clearSession();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  // ── Internal helpers ───────────────────────────────────────────────────────
  const _clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const _persistSession = (token, userData, rememberMe) => {
    const store = rememberMe ? localStorage : sessionStorage;
    store.setItem('token', token);
    store.setItem('user', JSON.stringify(userData));
    // Ensure the other store is clean
    if (rememberMe) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  // ── Auth actions ───────────────────────────────────────────────────────────

  const login = async (email, password, rememberMe = false) => {
    setError(null);
    const data = await api.post('/auth/login', { email, password, rememberMe });
    if (data.success && data.token && data.user) {
      _persistSession(data.token, data.user, rememberMe);
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Login failed.');
  };

  const register = async (userData) => {
    setError(null);
    const data = await api.post('/auth/register', userData);
    // If pending approval — no token issued, return pending flag
    if (data.success && data.pending) {
      return { pending: true, message: data.message };
    }
    // Immediate login (e.g. admin-created accounts in future)
    if (data.success && data.token && data.user) {
      _persistSession(data.token, data.user, false);
      setUser(data.user);
      return { pending: false, user: data.user };
    }
    throw new Error(data.message || 'Registration failed.');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Ignore server errors on logout
    }
    _clearSession();
  };

  const forgotPassword = async (email) => {
    setError(null);
    const data = await api.post('/auth/forgot-password', { email });
    if (!data.success) throw new Error(data.message || 'Failed to send OTP.');
    return data.message;
  };

  const resetPassword = async (email, otp, newPassword) => {
    setError(null);
    const data = await api.post('/auth/reset-password', { email, otp, newPassword });
    if (!data.success) throw new Error(data.message || 'Password reset failed.');
    return data.message;
  };

  const updateProfile = async (updates) => {
    setError(null);
    const data = await api.put('/auth/profile', updates);
    if (data.success && data.user) {
      setUser(data.user);
      // Update whichever store is active
      if (localStorage.getItem('token')) {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }
      return data.user;
    }
    throw new Error(data.message || 'Profile update failed.');
  };

  const changePassword = async (oldPassword, newPassword) => {
    setError(null);
    const data = await api.put('/auth/change-password', { oldPassword, newPassword });
    if (!data.success) throw new Error(data.message || 'Password change failed.');
    return data.message;
  };

  const hasRole = useCallback(
    (roles) => {
      if (!user) return false;
      if (typeof roles === 'string') return user.role === roles;
      return roles.includes(user.role);
    },
    [user]
  );

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        setError,
        isAuthenticated,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
