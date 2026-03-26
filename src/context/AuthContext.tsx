'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, AuthTokens, LoginData, RegisterData } from '@/lib/api';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  // ✅ avatar — write-only поле (для отправки файла на бэк)
  // ✅ avatar_url — read поле (прямая ссылка на Яндекс бакет)
  avatar?: string | null;
  avatar_url?: string | null;
  phone?: string;
  city?: string;
  address?: string;
  birth_date?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  date_joined?: string;
  orders_count?: number;
  active_badges?: any[];
  // Геймификация / теги
  tags?: any[];
  active_tags?: any[];
  level_data?: any;
  referral_data?: any;
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
  // ✅ updateAvatar теперь принимает avatar_url (URL из бакета)
  updateAvatar: (avatarUrl: string | null) => void;
  fetchProfile: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && !!tokens?.access;
  const token = tokens?.access || null;

  // ==================== TOKEN REFRESH ====================

  const refreshToken = async (): Promise<string | null> => {
    try {
      const storedTokens = localStorage.getItem('auth_tokens');
      if (!storedTokens) return null;

      const parsed: AuthTokens = JSON.parse(storedTokens);
      if (!parsed.refresh) return null;

      const res = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: parsed.refresh }),
      });

      if (!res.ok) { logout(); return null; }

      const data = await res.json();
      const newTokens: AuthTokens = { access: data.access, refresh: parsed.refresh };
      setTokens(newTokens);
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
      return data.access;
    } catch {
      logout();
      return null;
    }
  };

  // ==================== FETCH PROFILE ====================

  const fetchProfile = async () => {
    try {
      if (!tokens?.access) return;
      const freshUser = await api.getProfile(tokens.access);
      // ✅ freshUser содержит avatar_url — прямую ссылку из бакета
      setUser(freshUser);
      localStorage.setItem('auth_user', JSON.stringify(freshUser));
    } catch (error: any) {
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

  // ==================== INIT ====================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        const storedUser   = localStorage.getItem('auth_user');

        const validTokens = storedTokens && storedTokens !== 'undefined' && storedTokens !== 'null';
        const validUser   = storedUser   && storedUser   !== 'undefined' && storedUser   !== 'null';

        if (validTokens && validUser) {
          const parsedTokens: AuthTokens = JSON.parse(storedTokens!);
          const parsedUser: User         = JSON.parse(storedUser!);

          // Сразу показываем кешированного пользователя
          setTokens(parsedTokens);
          setUser(parsedUser);

          // Фоново обновляем профиль
          try {
            const freshUser = await api.getProfile(parsedTokens.access);
            setUser(freshUser);
            localStorage.setItem('auth_user', JSON.stringify(freshUser));
          } catch {
            // Access истёк — пробуем refresh
            const res = await fetch(`${API_URL}/auth/token/refresh/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: parsedTokens.refresh }),
            });

            if (res.ok) {
              const data = await res.json();
              const newTokens: AuthTokens = { access: data.access, refresh: parsedTokens.refresh };
              setTokens(newTokens);
              localStorage.setItem('auth_tokens', JSON.stringify(newTokens));

              const freshUser = await api.getProfile(data.access);
              setUser(freshUser);
              localStorage.setItem('auth_user', JSON.stringify(freshUser));
            } else {
              logout();
            }
          }
        } else {
          // Чистим мусор из localStorage
          if (!validTokens) localStorage.removeItem('auth_tokens');
          if (!validUser)   localStorage.removeItem('auth_user');
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Авто-рефреш токена каждые 4 минуты
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(refreshToken, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // ==================== AUTH ACTIONS ====================

  const login = async (data: LoginData | string, userData?: User) => {
    try {
      // Поддержка прямой передачи токена (для SSO / тестов)
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

  // ==================== USER UPDATE ====================

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  };

  const updateAvatar = (avatarUrl: string | null) => {
    if (!user) return;
    // ✅ Обновляем avatar_url (URL из Яндекс бакета для отображения)
    // avatar (write-only) не трогаем
    const updatedUser: User = {
      ...user,
      avatar_url: avatarUrl,
    };
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user, tokens, isAuthenticated, token, loading,
      login, register, logout,
      updateUser, updateAvatar, fetchProfile,
      refreshToken,
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
