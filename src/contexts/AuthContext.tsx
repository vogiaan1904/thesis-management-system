import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Student, Instructor, Admin } from '../types';
import { mockStudents, mockInstructors, mockAdmins } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Mock login - in production, this would call an API
    const allUsers = [
      ...mockStudents,
      ...mockInstructors,
      ...mockAdmins,
    ] as User[];
    const foundUser = allUsers.find((u) => u.email === email);

    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const switchUser = (userId: string) => {
    const allUsers = [
      ...mockStudents,
      ...mockInstructors,
      ...mockAdmins,
    ] as User[];
    const foundUser = allUsers.find((u) => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchUser }}>
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
