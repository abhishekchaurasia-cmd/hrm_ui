'use client';

import {
  ArrowRight,
  BarChart3,
  Calendar,
  Clock,
  Shield,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { LoginMode } from './login-dialog';

function DashboardIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      {/* Glow backdrop */}
      <div className="absolute -inset-4 rounded-3xl bg-blue-500/20 blur-3xl" />

      <div className="border-border/50 bg-card relative overflow-hidden rounded-2xl border shadow-2xl">
        {/* Title bar */}
        <div className="border-border/50 flex items-center gap-2 border-b px-4 py-3">
          <div className="size-3 rounded-full bg-red-400" />
          <div className="size-3 rounded-full bg-yellow-400" />
          <div className="size-3 rounded-full bg-green-400" />
          <div className="bg-muted ml-2 h-4 flex-1 rounded-md" />
        </div>

        <div className="p-5">
          {/* Top stat cards */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              {
                icon: Users,
                label: 'Employees',
                value: '248',
                color: 'text-blue-500',
              },
              {
                icon: Clock,
                label: 'Present',
                value: '196',
                color: 'text-emerald-500',
              },
              {
                icon: Calendar,
                label: 'On Leave',
                value: '12',
                color: 'text-blue-500',
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="bg-muted/50 flex flex-col items-center rounded-lg p-3"
              >
                <Icon className={`mb-1 size-5 ${color}`} />
                <span className="text-foreground text-lg font-bold">
                  {value}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="bg-muted/30 mb-4 rounded-lg p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-foreground text-xs font-medium">
                Weekly Attendance
              </span>
              <BarChart3 className="text-muted-foreground size-4" />
            </div>
            <div className="flex items-end gap-1.5">
              {[65, 80, 55, 90, 75, 85, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-500 to-blue-400"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          </div>

          {/* Mini table */}
          <div className="space-y-2">
            {[
              {
                name: 'Rahul S.',
                status: 'Present',
                statusColor: 'bg-emerald-500',
              },
              {
                name: 'Priya K.',
                status: 'On Leave',
                statusColor: 'bg-blue-500',
              },
              {
                name: 'Amit V.',
                status: 'Present',
                statusColor: 'bg-emerald-500',
              },
            ].map(({ name, status, statusColor }) => (
              <div
                key={name}
                className="bg-muted/30 flex items-center justify-between rounded-md px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-muted size-6 rounded-full" />
                  <span className="text-foreground text-xs">{name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`size-1.5 rounded-full ${statusColor}`} />
                  <span className="text-muted-foreground text-[10px]">
                    {status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -right-3 -bottom-3 flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500 px-4 py-2 shadow-lg">
        <Shield className="size-4 text-white" />
        <span className="text-xs font-semibold text-white">Secure & Fast</span>
      </div>
    </div>
  );
}

interface HeroSectionProps {
  onLoginClick: (mode: LoginMode) => void;
}

export function HeroSection({ onLoginClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
              </span>
              CopanDigital Internal Platform
            </div>

            <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Modern HR Management,{' '}
              <span className="bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>

            <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
              CopanDigital&apos;s own HR platform — manage attendance, leave,
              shifts, and employee onboarding from one powerful dashboard. Built
              exclusively for our team.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => onLoginClick('employee')}
              >
                Employee Login
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onLoginClick('hr')}
              >
                HR Login
              </Button>
            </div>

            <p className="text-muted-foreground mt-4 text-sm">
              For authorized CopanDigital employees only.
            </p>
          </div>

          {/* Illustration */}
          <div className="hidden lg:block">
            <DashboardIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
