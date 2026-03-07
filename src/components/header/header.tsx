'use client';

import { LogOut, Menu, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useSidebar } from '@/hooks/use-sidebar';

import { ThemeToggle } from './theme-toggle';

export function Header() {
  const { user, logout } = useAuth();
  const { toggleMobileSidebar } = useSidebar();

  return (
    <header className="bg-background border-b">
      <div className="flex h-14 items-center justify-between px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          aria-label="Toggle sidebar"
          className="lg:hidden"
        >
          <Menu className="size-5" />
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5 sm:gap-2">
          {user && (
            <span className="text-muted-foreground hidden items-center gap-2 text-sm sm:flex">
              <User className="size-4" />
              {user.name}
            </span>
          )}

          <ThemeToggle />

          <Button variant="ghost" size="sm" onClick={() => void logout()}>
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
