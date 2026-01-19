'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useSession, signOut as authSignOut } from '@/lib/auth-client';
import { api, type RewardsStatus } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEnrolled: boolean;
  isFacilitatorOwner: boolean;
  signOut: () => Promise<void>;
  refetchRewardsStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isEnrolled: false,
  isFacilitatorOwner: false,
  signOut: async () => {},
  refetchRewardsStatus: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [rewardsStatus, setRewardsStatus] = useState<RewardsStatus | null>(null);
  const [rewardsLoading, setRewardsLoading] = useState(false);

  const fetchRewardsStatus = useCallback(async () => {
    if (!session?.user) return;

    setRewardsLoading(true);
    try {
      const status = await api.getRewardsStatus();
      setRewardsStatus(status);
    } catch (error) {
      // Log error but don't crash - rewards status is supplementary
      console.error('Failed to fetch rewards status:', error);
      setRewardsStatus(null);
    } finally {
      setRewardsLoading(false);
    }
  }, [session?.user]);

  // Fetch rewards status when authenticated
  useEffect(() => {
    if (session?.user && !isSigningOut) {
      fetchRewardsStatus();
    } else {
      // Clear rewards status when signed out
      setRewardsStatus(null);
    }
  }, [session?.user, isSigningOut, fetchRewardsStatus]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await authSignOut();
      window.location.href = '/';
    } finally {
      setIsSigningOut(false);
    }
  };

  const isAuthenticated = !!session?.user;

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        isLoading: isPending || isSigningOut || (isAuthenticated && rewardsLoading),
        isAuthenticated,
        isAdmin: rewardsStatus?.isAdmin ?? false,
        isEnrolled: rewardsStatus?.isEnrolled ?? false,
        isFacilitatorOwner: rewardsStatus?.isFacilitatorOwner ?? false,
        signOut: handleSignOut,
        refetchRewardsStatus: fetchRewardsStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
