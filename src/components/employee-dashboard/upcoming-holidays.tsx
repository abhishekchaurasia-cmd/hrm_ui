'use client';

import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getUpcomingHolidays } from '@/services/holidays';

import type { Holiday } from '@/types/holiday';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Upcoming Holidays</h3>
          <CalendarDays className="text-muted-foreground size-4" />
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {isLoading ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Loading...
            </p>
          ) : holidays.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              No upcoming holidays
            </p>
          ) : (
            holidays.map(h => (
              <div
                key={h.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{h.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(h.date)}
                  </p>
                </div>
                {h.isOptional && (
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    Optional
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>

        <Button variant="outline" className="mt-4 w-full" asChild>
          <Link href="/my/holidays">View All Holidays</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
