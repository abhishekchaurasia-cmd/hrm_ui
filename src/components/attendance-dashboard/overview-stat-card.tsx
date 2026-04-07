'use client';

import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { OverviewStatEmployee } from './overview-stats';
import type { LucideIcon } from 'lucide-react';

const AVATAR_COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
];

interface OverviewStatCardProps {
  title: string;
  value: string;
  delta: string;
  direction: 'up' | 'down';
  icon: LucideIcon;
  iconBg: string;
  employees?: OverviewStatEmployee[];
}

export function OverviewStatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  employees,
}: OverviewStatCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasEmployees = employees && employees.length > 0;

  return (
    <>
      <Card
        className={`py-0 transition-shadow hover:shadow-md ${hasEmployees ? 'cursor-pointer' : ''}`}
        onClick={hasEmployees ? () => setIsOpen(true) : undefined}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${iconBg}18` }}
          >
            <Icon className="size-5" style={{ color: iconBg }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground truncate text-xs font-medium">
              {title}
            </p>
            <p className="mt-0.5 text-2xl leading-none font-bold tracking-tight">
              {value}
            </p>
          </div>
          {hasEmployees && (
            <span className="text-muted-foreground text-xs">View</span>
          )}
        </CardContent>
      </Card>

      {hasEmployees && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-h-[70vh] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${iconBg}18` }}
                >
                  <Icon className="size-4" style={{ color: iconBg }} />
                </div>
                {title} ({employees.length})
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[50vh] space-y-1 overflow-y-auto pr-1">
              {employees.map((emp, idx) => (
                <div
                  key={`${emp.name}-${idx}`}
                  className="hover:bg-muted/50 flex items-center gap-3 rounded-lg px-2 py-2"
                >
                  <span
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                    style={{
                      backgroundColor:
                        AVATAR_COLORS[idx % AVATAR_COLORS.length],
                    }}
                  >
                    {emp.initials}
                  </span>
                  <span className="truncate text-sm font-medium">
                    {emp.name}
                  </span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
