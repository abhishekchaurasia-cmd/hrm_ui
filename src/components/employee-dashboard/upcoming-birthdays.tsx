'use client';

import { Cake, PartyPopper } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getUpcomingBirthdays, type UpcomingBirthday } from '@/services/users';

const AVATAR_COLORS = [
  'bg-rose-100 text-rose-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-cyan-100 text-cyan-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
];

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName[0] ?? '').toUpperCase()}${(lastName[0] ?? '').toUpperCase()}`;
}

function formatBirthdayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function getDaysUntilBirthday(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bd = new Date(dateStr + 'T00:00:00');
  const thisYearBd = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
  if (thisYearBd < today) {
    thisYearBd.setFullYear(thisYearBd.getFullYear() + 1);
  }
  return Math.ceil(
    (thisYearBd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function BirthdayBadge({ daysUntil }: { daysUntil: number }) {
  if (daysUntil === 0) {
    return (
      <Badge className="shrink-0 gap-1 bg-blue-500 text-[10px] text-white hover:bg-blue-600">
        <PartyPopper className="size-3" />
        Today!
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
  return (
    <Badge variant="outline" className="shrink-0 text-[10px]">
      In {daysUntil}d
    </Badge>
  );
}

function BirthdaySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function UpcomingBirthdays() {
  const [birthdays, setBirthdays] = useState<UpcomingBirthday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBirthdays = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getUpcomingBirthdays();
      setBirthdays(res.data ?? []);
    } catch {
      setBirthdays([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBirthdays();
  }, [fetchBirthdays]);

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-rose-100">
            <Cake className="size-4 text-rose-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Upcoming Birthdays</h3>
            <p className="text-muted-foreground text-xs">This week</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {isLoading ? (
            <BirthdaySkeleton />
          ) : birthdays.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6">
              <Cake className="text-muted-foreground size-10" />
              <p className="text-muted-foreground text-sm">
                No birthdays this week
              </p>
            </div>
          ) : (
            birthdays.map((b, idx) => {
              const daysUntil = getDaysUntilBirthday(b.dateOfBirth);
              const initials = getInitials(b.firstName, b.lastName);
              const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const isCurrentDay = daysUntil === 0;

              return (
                <div
                  key={b.userId}
                  className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors ${
                    isCurrentDay
                      ? 'bg-blue-50 ring-1 ring-blue-200'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colorClass}`}
                  >
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {b.firstName} {b.lastName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatBirthdayDate(b.dateOfBirth)}
                      {b.department ? ` · ${b.department}` : ''}
                    </p>
                  </div>

                  <BirthdayBadge daysUntil={daysUntil} />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
