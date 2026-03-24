'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    accessToken: session?.accessToken ?? null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',

    loginWithCredentials: (email: string, password: string) =>
      signIn('credentials', { email, password, redirect: false }),

    loginWithGoogle: () => signIn('google', { callbackUrl: '/' }),

    logout: () => signOut({ callbackUrl: '/' }),

    hasRole: (role: string) => session?.user?.role === role,
    hasAnyRole: (...roles: string[]) =>
      roles.includes(session?.user?.role ?? ''),
  };
}
