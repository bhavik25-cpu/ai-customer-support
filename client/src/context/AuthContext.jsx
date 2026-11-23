import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { getError } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Remove the legacy browser-stored JWT after migrating to HttpOnly cookies.
    localStorage.removeItem('support_token');

    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(path, payload) {
    try {
      const { data } = await api.post(path, payload);
      setUser(data.user);
    } catch (error) {
      throw new Error(getError(error));
    }
  }

  const login = payload => authenticate('/auth/login', payload);
  const signup = payload => authenticate('/auth/signup', payload);

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
