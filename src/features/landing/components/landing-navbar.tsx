'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ThemeToggle } from '@/components/header/theme-toggle';
import { CopanLogo } from '@/components/icons/copan-logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { LoginMode } from './login-dialog';

interface LandingNavbarProps {
  onLoginClick: (mode: LoginMode) => void;
}

export function LandingNavbar({ onLoginClick }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
        scrolled || mobileOpen
          ? 'border-border/50 bg-background/80 border-b backdrop-blur-lg'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <CopanLogo className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 sm:flex">
          <ThemeToggle />
          <Button variant="ghost" onClick={() => onLoginClick('hr')}>
            HR Login
          </Button>
          <Button
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => onLoginClick('employee')}
          >
            Employee Login
          </Button>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="bg-background/95 border-border/50 border-t backdrop-blur-lg sm:hidden">
          <div className="flex flex-col gap-2 px-4 py-4">
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => {
                setMobileOpen(false);
                onLoginClick('hr');
              }}
            >
              HR Login
            </Button>
            <Button
              className="w-full justify-center bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => {
                setMobileOpen(false);
                onLoginClick('employee');
              }}
            >
              Employee Login
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
