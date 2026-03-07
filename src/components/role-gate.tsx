'use client';

import { useAuth } from '@/hooks/use-auth';

interface RoleGateProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { hasAnyRole, isLoading } = useAuth();

  if (isLoading) return null;

  if (!hasAnyRole(...roles)) return <>{fallback}</>;

  return <>{children}</>;
}
