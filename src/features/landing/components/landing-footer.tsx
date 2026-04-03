'use client';

import { CopanLogo } from '@/components/icons/copan-logo';

import type { LoginMode } from './login-dialog';

interface LandingFooterProps {
  onLoginClick: (mode: LoginMode) => void;
}

export function LandingFooter({ onLoginClick }: LandingFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border/50 bg-muted/30 border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <CopanLogo className="h-5 w-auto" />
            <span className="text-muted-foreground hidden text-xs sm:inline">
              A CopanDigital Product
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm">
            <button
              type="button"
              onClick={() => onLoginClick('employee')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => onLoginClick('hr')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              HR Login
            </button>
          </nav>

          {/* Copyright */}
          <p className="text-muted-foreground text-xs">
            &copy; {year} CopanDigital. Internal use only.
          </p>
        </div>
      </div>
    </footer>
  );
}
