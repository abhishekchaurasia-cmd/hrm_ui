'use client';

import { LayoutDashboard, LogIn, Rocket } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

interface Step {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: LogIn,
    title: 'Log In',
    description:
      'Sign in with your CopanDigital credentials to access the portal.',
  },
  {
    number: 2,
    icon: LayoutDashboard,
    title: 'Explore Your Dashboard',
    description:
      'View your attendance, leave balance, shifts, and upcoming holidays at a glance.',
  },
  {
    number: 3,
    icon: Rocket,
    title: 'Stay on Track',
    description:
      'Request leaves, mark attendance, and manage your schedule — all in one place.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Three simple steps to access and manage your work life at
            CopanDigital.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Connector line (desktop) */}
          <div className="absolute top-14 right-[16.67%] left-[16.67%] hidden h-0.5 border-t-2 border-dashed border-orange-500/30 lg:block" />

          <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <div
                key={number}
                className="flex flex-col items-center text-center"
              >
                {/* Numbered badge */}
                <div className="relative mb-6">
                  <div className="flex size-28 items-center justify-center rounded-full bg-orange-500/10">
                    <div className="flex size-20 items-center justify-center rounded-full bg-orange-500/20">
                      <Icon className="size-8 text-orange-500" />
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 flex size-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shadow-lg">
                    {number}
                  </div>
                </div>

                <h3 className="text-foreground text-xl font-semibold">
                  {title}
                </h3>
                <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
