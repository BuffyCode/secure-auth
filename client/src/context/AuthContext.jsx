import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: "https://secure-auth-xgt4.onrender.com/api",
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  const login = async (email, password, mfaToken = null) => {
    const response = await api.post('/auth/login', { email, password, mfaToken });
    const { token: authToken, user: authUser } = response.data;
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(authUser);
    return response.data;
  };

  const setupMfa = async () => {
    return api.post('/auth/mfa/setup');
  };

  const verifyMfa = async (token) => {
    return api.post('/auth/mfa/verify', { token });
  };

  const register = async (name, email, password, role = 'user') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { token: authToken, user: authUser } = response.data;
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(authUser);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const getProfile = async () => {
    const response = await api.get('/auth/profile');
    setUser(response.data.user);
    return response.data;
  };

  const getAdminDashboard = async () => {
    const response = await api.get('/admin/dashboard');
    setUser(response.data.user);
    return response.data;
  };

  const value = useMemo(() => ({ user, token, login, register, logout, getProfile, getAdminDashboard, setupMfa, verifyMfa }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
