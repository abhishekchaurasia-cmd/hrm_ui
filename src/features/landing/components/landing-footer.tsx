'use client';

import Link from 'next/link';

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border/50 bg-muted/30 border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-orange-500">
                <span className="text-xs font-bold text-white">CD</span>
              </div>
              <span className="text-foreground text-sm font-semibold">
                Copan<span className="text-orange-500">Digital</span>
              </span>
            </div>
            <span className="text-muted-foreground hidden text-xs sm:inline">
              A CopanDigital Product
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              href="/hr-login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              HR Login
            </Link>
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
