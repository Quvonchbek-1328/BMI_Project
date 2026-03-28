import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../api/authApi';
import type { AuthResponse, UserProfile } from '../types/auth';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [roles, setRoles] = useState<string[]>(() => {
    const stored = localStorage.getItem('roles');
    return stored ? JSON.parse(stored) : [];
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (authResponse: AuthResponse) => {
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('roles', JSON.stringify(authResponse.roles));
    setToken(authResponse.token);
    setRoles(authResponse.roles);
    setUser({
      id: authResponse.userId,
      fullName: authResponse.fullName,
      email: authResponse.email,
      roles: authResponse.roles,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    setToken(null);
    setUser(null);
    setRoles([]);
  };

  const refreshProfile = async () => {
    try {
      const response = await authApi.getProfile();
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        setRoles(response.data.data.roles);
      }
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        roles,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
