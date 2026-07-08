import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ref flag: prevents the useEffect from re-fetching (and possibly calling
  // logout) immediately after an explicit login() call sets the token.
  const justLoggedIn = useRef(false);

  // Bind token to Axios default headers on every render so requests are always
  // sent with the latest token value.
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const fetchUser = async () => {
      // login() already set the user — skip the redundant round-trip.
      if (justLoggedIn.current) {
        justLoggedIn.current = false;
        setLoading(false);
        return;
      }

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          // Restore the role field that the DB document carries
          const userData = { ...res.data.user, role: res.data.role ?? res.data.user.role };
          setUser(userData);
        } else {
          logout();
        }
      } catch (err) {
        // Only logout on auth errors (401/403), not transient network issues
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = (newToken, userData) => {
    justLoggedIn.current = true;        // signal: skip the next useEffect fetch
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
