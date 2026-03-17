'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, AuthTokens, LoginData, RegisterData } from '@/lib/api';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  phone?: string;
  city?: string;
  address?: string;
  birth_date?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  date_joined?: string;
  orders_count?: number;
  active_badges?: any[];
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  loading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (data: LoginData | string, userData?: User) => Promise<void> | void;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateAvatar: (avatarUrl: string | null) => void;
  fetchProfile: () => Promise<void>;
  refreshToken: () => Promise<string | null>; // ✅ новое
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && !!tokens?.access;
  const token = tokens?.access || null;

  // ✅ Обновление access токена через refresh
  const refreshToken = async (): Promise<string | null> => {
    try {
      const storedTokens = localStorage.getItem('auth_tokens');
      if (!storedTokens) return null;

      const parsed: AuthTokens = JSON.parse(storedTokens);
      if (!parsed.refresh) return null;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: parsed.refresh }),
      });

      if (!res.ok) {
        logout();
        return null;
      }

      const data = await res.json();
      const newTokens: AuthTokens = {
        access: data.access,
        refresh: parsed.refresh, // refresh остаётся прежним
      };

      setTokens(newTokens);
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
      return data.access;
    } catch {
      logout();
      return null;
    }
  };

  const fetchProfile = async () => {
    try {
      if (!tokens?.access) return;
      const freshUser = await api.getProfile(tokens.access);
      setUser(freshUser);
      localStorage.setItem('auth_user', JSON.stringify(freshUser));
    } catch (error: any) {
      // ✅ Если 401 — пробуем рефреш
      if (error?.status === 401 || error?.message?.includes('401')) {
        const newAccess = await refreshToken();
        if (newAccess) {
          const freshUser = await api.getProfile(newAccess);
          setUser(freshUser);
          localStorage.setItem('auth_user', JSON.stringify(freshUser));
        }
      } else {
        throw error;
      }
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        const storedUser = localStorage.getItem('auth_user');

        if (
          storedTokens && storedUser &&
          storedTokens !== 'undefined' && storedTokens !== 'null' &&
          storedUser !== 'undefined' && storedUser !== 'null'
        ) {
          try {
            const parsedTokens: AuthTokens = JSON.parse(storedTokens);
            const parsedUser: User = JSON.parse(storedUser);

            setTokens(parsedTokens);
            setUser(parsedUser);

            // Пробуем загрузить свежий профиль
            try {
              const freshUser = await api.getProfile(parsedTokens.access);
              setUser(freshUser);
              localStorage.setItem('auth_user', JSON.stringify(freshUser));
            } catch {
              // ✅ access истёк — пробуем refresh
              console.log('Access токен истёк, обновляем...');
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: parsedTokens.refresh }),
              });

              if (res.ok) {
                const data = await res.json();
                const newTokens: AuthTokens = { access: data.access, refresh: parsedTokens.refresh };
                setTokens(newTokens);
                localStorage.setItem('auth_tokens', JSON.stringify(newTokens));

                // Загружаем профиль с новым токеном
                const freshUser = await api.getProfile(data.access);
                setUser(freshUser);
                localStorage.setItem('auth_user', JSON.stringify(freshUser));
                console.log('✅ Токен обновлён');
              } else {
                // refresh тоже истёк — выходим
                console.log('Refresh токен истёк, выход');
                logout();
              }
            }
          } catch (parseError) {
            localStorage.removeItem('auth_tokens');
            localStorage.removeItem('auth_user');
          }
        } else {
          if (storedTokens === 'undefined' || storedTokens === 'null') localStorage.removeItem('auth_tokens');
          if (storedUser === 'undefined' || storedUser === 'null') localStorage.removeItem('auth_user');
        }
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ✅ Авто-рефреш каждые 4 минуты (access живёт 5 минут обычно)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = async (data: LoginData | string, userData?: User) => {
    try {
      if (typeof data === 'string') {
        const newTokens: AuthTokens = { access: data, refresh: data };
        setUser(userData || null);
        setTokens(newTokens);
        localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
        if (userData) localStorage.setItem('auth_user', JSON.stringify(userData));
        return;
      }

      const response = await api.login(data);
      setUser(response.user);
      setTokens(response.tokens);
      localStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      router.push('/profile');
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.register(data);
      setUser(response.user);
      setTokens(response.tokens);
      localStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      router.push('/profile');
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
    router.push('/');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const updateAvatar = (avatarUrl: string | null) => {
    if (user) {
      const updatedUser = { ...user, avatar: avatarUrl || undefined };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user, tokens, isAuthenticated, token, loading,
      login, register, logout,
      updateUser, updateAvatar, fetchProfile,
      refreshToken, // ✅
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export { AuthContext };
