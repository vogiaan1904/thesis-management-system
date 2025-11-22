import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('auth_token');

      if (storedUser && token) {
        try {
          // First, try to parse and use stored user
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Then verify token is still valid by fetching profile
          const profile = await authService.getProfile();
          // Normalize role to lowercase
          const normalizedProfile: User = {
            ...profile,
            role: profile.role.toLowerCase() as UserRole,
          };
          setUser(normalizedProfile);
        } catch (error: any) {
          // Only clear storage if it's an authentication error (401)
          // Don't clear on network errors or server errors
          if (error?.response?.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
            setUser(null);
          }
          // For other errors (network, 500, etc), keep the stored user
          // The API interceptor will handle clearing if needed
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Listen for storage changes (e.g., when API interceptor clears the token)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');

      // If token or user was removed, clear the user state
      if (!token || !storedUser) {
        setUser(null);
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Also set up a custom event for same-window changes
    window.addEventListener('auth-logout', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-logout', handleStorageChange as EventListener);
    };
  }, []);

  const login = async (userId: string, password: string): Promise<boolean> => {
    try {
      const data = await authService.login(userId, password);
      // Normalize role to lowercase for consistent client-side checks
      const normalizedUser: User = {
        ...data.user,
        role: data.user.role.toLowerCase() as UserRole,
      };
      setUser(normalizedUser);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const switchUser = async (userId: string) => {
    // This function is mainly for development/demo purposes
    // In production, you would need to implement proper user switching logic
    // For now, we'll just re-fetch the profile if the userId matches
    try {
      const profile = await authService.getProfile();
      if (profile.id === userId) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Failed to switch user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
