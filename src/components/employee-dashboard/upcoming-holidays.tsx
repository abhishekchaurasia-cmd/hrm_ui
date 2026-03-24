'use client';

import { CalendarDays, Gift } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getUpcomingHolidays } from '@/services/holidays';

import type { Holiday } from '@/types/holiday';

const ACCENT_COLORS = [
  'border-l-emerald-500',
  'border-l-blue-500',
  'border-l-amber-500',
  'border-l-rose-500',
  'border-l-violet-500',
  'border-l-cyan-500',
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long' });
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function CountdownBadge({ daysUntil }: { daysUntil: number }) {
  if (daysUntil === 0) {
    return (
      <Badge className="shrink-0 bg-emerald-100 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100">
        Today
      </Badge>
    );
  }
  if (daysUntil === 1) {
    return (
      <Badge className="shrink-0 bg-amber-100 text-[10px] font-semibold text-amber-700 hover:bg-amber-100">
        Tomorrow
      </Badge>
    );
  }
  if (daysUntil <= 7) {
    return (
      <Badge variant="secondary" className="shrink-0 text-[10px] font-medium">
        In {daysUntil} days
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="shrink-0 text-[10px] font-medium">
      In {daysUntil} days
    </Badge>
  );
}

function HolidaySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border-l-4 border-l-transparent p-3"
        >
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

interface UpcomingHolidaysProps {
  limit?: number;
}

export function UpcomingHolidays({ limit = 5 }: UpcomingHolidaysProps) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getUpcomingHolidays(limit);
      setHolidays(res.data ?? []);
    } catch {
      setHolidays([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void fetchHolidays();
  }, [fetchHolidays]);

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100">
            <Gift className="size-4 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Upcoming Holidays</h3>
            <p className="text-muted-foreground text-xs">
              {holidays.length > 0
                ? `Next ${holidays.length} holidays`
                : 'No upcoming holidays'}
            </p>
          </div>
          <CalendarDays className="text-muted-foreground size-4" />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {isLoading ? (
            <HolidaySkeleton />
          ) : holidays.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6">
              <CalendarDays className="text-muted-foreground size-10" />
              <p className="text-muted-foreground text-sm">
                No upcoming holidays
              </p>
            </div>
          ) : (
            holidays.map((h, idx) => {
              const daysUntil = getDaysUntil(h.date);
              const dayOfWeek = getDayOfWeek(h.date);
              const accentClass = ACCENT_COLORS[idx % ACCENT_COLORS.length];

              return (
                <div
                  key={h.id}
                  className={`bg-muted/30 hover:bg-muted/60 flex items-center gap-3 rounded-lg border-l-4 p-3 transition-colors ${accentClass}`}
                >
                  <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-white shadow-sm">
                    <span className="text-xs leading-none font-bold">
                      {new Date(h.date + 'T00:00:00').getDate()}
                    </span>
                    <span className="text-muted-foreground text-[10px] leading-tight uppercase">
                      {new Date(h.date + 'T00:00:00').toLocaleDateString(
                        'en-IN',
                        { month: 'short' }
                      )}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{h.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {dayOfWeek} &middot; {formatDate(h.date)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <CountdownBadge daysUntil={daysUntil} />
                    {h.isOptional && (
                      <Badge variant="outline" className="text-[10px]">
                        Optional
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Button variant="outline" className="mt-4 w-full" asChild>
          <Link href="/my/holidays">View All Holidays</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
