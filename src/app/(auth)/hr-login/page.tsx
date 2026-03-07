'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

export default function HrLoginPage() {
  const router = useRouter();
  const { loginWithCredentials, isAuthenticated, user, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'hr') {
        router.push('/dashboard/hr');
        return;
      }
      router.push('/dashboard');
    }
  }, [isAuthenticated, router, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginWithCredentials(email, password);

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    // After successful sign-in, NextAuth session will update.
    // The useEffect above will redirect HR users to /dashboard/hr.
    // If the user is not HR, the middleware will handle access control.
    // We also do a client-side check: fetch the session and verify role.
    const sessionRes = await fetch('/api/auth/session');
    const session = await sessionRes.json();

    if (session?.user?.role !== 'hr') {
      void logout();
      setError('Only HR users can sign in from this portal.');
      setLoading(false);
      return;
    }

    router.push('/dashboard/hr');
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">HR Sign in</CardTitle>
        <CardDescription>
          Enter HR credentials to access the HR dashboard
        </CardDescription>
      </CardHeader>
      <form onSubmit={e => void handleSubmit(e)}>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="hr@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in as HR'}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            Employee login?{' '}
            <Link
              href="/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              Go to employee sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
