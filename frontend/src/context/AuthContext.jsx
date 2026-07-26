import React, { createContext, useState, useEffect } from 'react';
import { loginAdminApi, logoutAdminApi, getAdminProfileApi } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const savedUser = localStorage.getItem('adminUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await getAdminProfileApi();
          if (res.success && res.admin) {
            setAdmin(res.admin);
            localStorage.setItem('adminUser', JSON.stringify(res.admin));
          } else {
            logout();
          }
        } catch (err) {
          console.error('[AuthContext] Verification error:', err.message);
          logout();
        }
      } else {
        setAdmin(null);
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await loginAdminApi(email, password);
    if (res.success && res.token) {
      setToken(res.token);
      setAdmin(res.admin);
      localStorage.setItem('adminToken', res.token);
      localStorage.setItem('adminUser', JSON.stringify(res.admin));
    }
    return res;
  };

  const logout = async () => {
    try {
      if (token) await logoutAdminApi();
    } catch (err) {
      console.warn('[AuthContext] Logout API error:', err.message);
    } finally {
      setToken('');
      setAdmin(null);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: Boolean(token && admin),
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
