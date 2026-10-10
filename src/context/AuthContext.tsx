import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeCulture: string; // 'yoruba' | 'igbo' | 'hausa'
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string, preferredCulture: string) => Promise<User>;
  logout: () => void;
  switchCulture: (cultureSlug: string) => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cultureverse_token'));
  const [activeCulture, setActiveCulture] = useState<string>(
    localStorage.getItem('cultureverse_active_culture') || 'yoruba'
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and check current user session
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('cultureverse_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          if (userData.preferred_culture_slug) {
            setActiveCulture(userData.preferred_culture_slug);
            localStorage.setItem('cultureverse_active_culture', userData.preferred_culture_slug);
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem('cultureverse_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to log in');
    }

    localStorage.setItem('cultureverse_token', data.token);
    setToken(data.token);
    setUser(data.user);

    if (data.user.preferred_culture_slug) {
      setActiveCulture(data.user.preferred_culture_slug);
      localStorage.setItem('cultureverse_active_culture', data.user.preferred_culture_slug);
    }

    return data.user;
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    preferredCulture: string
  ): Promise<User> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        email,
        password,
        preferredCulture,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create account');
    }

    localStorage.setItem('cultureverse_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setActiveCulture(preferredCulture);
    localStorage.setItem('cultureverse_active_culture', preferredCulture);

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('cultureverse_token');
    setToken(null);
    setUser(null);
  };

  const switchCulture = (cultureSlug: string) => {
    setActiveCulture(cultureSlug);
    localStorage.setItem('cultureverse_active_culture', cultureSlug);
    if (user) {
      // Sync preference to server silently
      fetch('/api/auth/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cultureSlug }),
      }).catch(console.error);
    }
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedFields });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        activeCulture,
        login,
        register,
        logout,
        switchCulture,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
