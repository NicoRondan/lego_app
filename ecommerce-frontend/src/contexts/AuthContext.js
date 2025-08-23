import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

// Create a context to store authentication information
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // On initial load, if a token exists, attempt to fetch current user info
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const me = await api.getMe(token);
        setUser(me);
      } catch (err) {
        console.error('Error fetching current user:', err);
        // If token invalid, clear it
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    };
    fetchUser();
  }, [token]);

  // Log in with provider credentials; store token and user
  const login = async ({ provider, providerId, name, email }) => {
    const { token: newToken, user: newUser } = await api.login({ provider, providerId, name, email });
    setToken(newToken);
    localStorage.setItem('token', newToken);
    setUser(newUser);
  };

  // Log out by clearing state and local storage
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);