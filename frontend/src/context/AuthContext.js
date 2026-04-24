'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Decode JWT payload (client-side only, not for security)
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  };

  // Load user from cookie on mount
  useEffect(() => {
    const token = Cookies.get('auth_token');
    console.log('[AuthContext] Initial check, token found:', !!token);

    if (token) {
      const payload = decodeToken(token);
      console.log('[AuthContext] Token payload:', payload);

      if (payload && payload.exp * 1000 > Date.now()) {
        console.log('[AuthContext] Token is valid, fetching profile...');
        // Token is valid, fetch fresh profile
        api
          .get('/auth/me')
          .then((res) => {
            console.log('[AuthContext] Profile fetched successfully:', res.data.username);
            setUser(res.data);
          })
          .catch((err) => {
            console.error('[AuthContext] Failed to fetch profile:', err.response?.data || err.message);
            // Only remove cookie if it's an auth error (401/403)
            if (err.response?.status === 401 || err.response?.status === 403) {
              Cookies.remove('auth_token', { path: '/' });
              setUser(null);
            }
          })
          .finally(() => {
            setIsLoading(false);
            console.log('[AuthContext] Loading finished');
          });
      } else {
        console.log('[AuthContext] Token expired or invalid');
        Cookies.remove('auth_token', { path: '/' });
        setIsLoading(false);
      }
    } else {
      console.log('[AuthContext] No token found in cookies');
      setIsLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    console.log('[AuthContext] Setting cookie and user state');
    Cookies.set('auth_token', token, { expires: 7, sameSite: 'strict', path: '/' });
    setUser(userData);
    router.push('/home');
  };

  const logout = () => {
    console.log('[AuthContext] Logging out');
    Cookies.remove('auth_token', { path: '/' });
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
