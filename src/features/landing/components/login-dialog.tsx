'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

export type LoginMode = 'employee' | 'hr' | null;

interface LoginDialogProps {
  mode: LoginMode;
  onModeChange: (mode: LoginMode) => void;
}

export function LoginDialog({ mode, onModeChange }: LoginDialogProps) {
  const router = useRouter();
  const { loginWithCredentials, loginWithGoogle, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isHr = mode === 'hr';
  const open = mode !== null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
      onModeChange(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginWithCredentials(email, password);

    if (result?.error) {
      setError('Invalid username or password');
      setLoading(false);
      return;
    }

    if (isHr) {
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (session?.user?.role !== 'hr') {
        void logout();
        setError('Only HR users can sign in from this portal.');
        setLoading(false);
        return;
      }

      router.push('/dashboard/hr');
    } else {
      router.push('/');
    }

    setLoading(false);
  };

  const switchMode = () => {
    resetForm();
    onModeChange(isHr ? 'employee' : 'hr');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isHr ? 'HR Sign in' : 'Sign in'}
          </DialogTitle>
          <DialogDescription>
            {isHr
              ? 'Enter HR credentials to access the HR dashboard'
              : 'Enter your credentials to access your account'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={e => void handleSubmit(e)}
          className="flex flex-col gap-4"
        >
          {error && (
            <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${mode}-email`}>Email</Label>
            <Input
              id={`${mode}-email`}
              type="email"
              placeholder={isHr ? 'hr@company.com' : 'you@example.com'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${mode}-password`}>Password</Label>
            <Input
              id={`${mode}-password`}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : isHr ? 'Sign in as HR' : 'Sign in'}
          </Button>

          {!isHr && (
            <>
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background text-muted-foreground px-2">
                    or
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => void loginWithGoogle()}
              >
                Sign in with Google
              </Button>
            </>
          )}

          <p className="text-muted-foreground text-center text-sm">
            {isHr ? 'Employee login? ' : 'HR login? '}
            <button
              type="button"
              className="text-primary underline-offset-4 hover:underline"
              onClick={switchMode}
            >
              {isHr ? 'Go to employee sign in' : 'Sign in as HR'}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
