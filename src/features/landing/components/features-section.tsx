'use client';

import {
  CalendarClock,
  CalendarDays,
  Clock,
  LayoutDashboard,
  PartyPopper,
  Users,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Clock,
    title: 'Attendance Tracking',
    description:
      'Real-time clock-in/out with GPS verification. Automated timesheets and overtime calculations at your fingertips.',
  },
  {
    icon: CalendarDays,
    title: 'Leave Management',
    description:
      'Customizable leave policies, one-click requests, and instant approvals. Keep your team balanced and informed.',
  },
  {
    icon: CalendarClock,
    title: 'Shift Scheduling',
    description:
      'Drag-and-drop shift planner with conflict detection. Automate rotations and notify employees instantly.',
  },
  {
    icon: Users,
    title: 'Employee Profiles',
    description:
      'Centralized employee directory with documents, roles, and history. Onboard new hires in minutes, not days.',
  },
  {
    icon: PartyPopper,
    title: 'Holiday Calendar',
    description:
      'Pre-configured public holidays with custom company events. Sync across departments and locations.',
  },
  {
    icon: LayoutDashboard,
    title: 'HR Dashboard',
    description:
      "Bird's-eye view of your organization. Analytics, reports, and actionable insights all in one place.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-muted/40 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Manage Your Team
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Powerful tools designed to simplify every aspect of human resource
            management, from onboarding to offboarding.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="bg-card border-border/50 group border transition-shadow hover:shadow-lg"
            >
              <CardHeader className="pb-3">
                <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-orange-500/10">
                  <Icon className="size-5 text-orange-500" />
                </div>
                <CardTitle className="text-foreground text-lg">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
