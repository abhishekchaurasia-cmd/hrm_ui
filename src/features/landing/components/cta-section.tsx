'use client';

import { ArrowRight, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { LoginMode } from './login-dialog';

interface CtaSectionProps {
  onLoginClick: (mode: LoginMode) => void;
}

export function CtaSection({ onLoginClick }: CtaSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 py-20 lg:py-24">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 size-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-20 -bottom-20 size-80 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
          <Sparkles className="size-4" />
          CopanDigital HRM Portal
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Welcome to Your HR Portal
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-orange-100">
          Access attendance, leave management, shift schedules, and more — built
          exclusively for the CopanDigital team.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="bg-white text-orange-600 shadow-lg hover:bg-orange-50"
            onClick={() => onLoginClick('employee')}
          >
            Login Now
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={() => onLoginClick('hr')}
          >
            HR Admin Access
          </Button>
        </div>
      </div>
    </section>
  );
}
