import React, { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

function base64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return base64url(hash);
}

function generateVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return base64url(array);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchMe = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const register = async ({ name, email, password }) => {
    const u = await api.register({ name, email, password });
    setUser(u);
  };

  const login = async ({ email, password }) => {
    const u = await api.login({ email, password });
    setUser(u);
  };

  const loginWithGoogle = async () => {
    const codeVerifier = generateVerifier();
    sessionStorage.setItem('code_verifier', codeVerifier);
    const codeChallenge = await sha256(codeVerifier);
    const redirectUri = `${window.location.origin}/login/callback`;
    const url = `${api.API_URL}/auth/oauth/google/start?code_challenge=${codeChallenge}&code_verifier=${codeVerifier}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = url;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      api.refresh().catch(() => setUser(null));
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <AuthContext.Provider value={{ user, register, login, loginWithGoogle, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
