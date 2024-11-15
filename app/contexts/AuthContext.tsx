'use client'

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User } from 'next-auth';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth' });
  };

  return (
    <AuthContext.Provider value={{ 
      user: session?.user ?? null,
      loading: !session,
      isAuthenticated: !!session,
      logout
    }}>
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