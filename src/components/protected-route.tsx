'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  roles,
  fallback,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return fallback ?? <div>Loading...</div>;
  }

  if (!session) return null;

  if (roles && !roles.includes(session.user.role)) {
    return <div>You do not have permission to view this page.</div>;
  }

  return <>{children}</>;
}
