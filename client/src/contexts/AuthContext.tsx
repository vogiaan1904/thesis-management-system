import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
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
          // Verify token is still valid by fetching profile
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (userId: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext.login called');
      const data = await authService.login(userId, password);
      console.log('authService.login returned data:', data);
      console.log('Setting user:', data.user);
      setUser(data.user);
      console.log('User set successfully');
      return true;
    } catch (error) {
      console.error('Login failed with error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
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
