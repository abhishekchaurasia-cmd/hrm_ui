'use client';

import { Cake, CalendarHeart, PartyPopper, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getUpcomingAnniversaries,
  getUpcomingBirthdays,
  type UpcomingAnniversary,
  type UpcomingBirthday,
} from '@/services/users';

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

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bd = new Date(dateStr + 'T00:00:00');
  const thisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
  if (thisYear < today) {
    thisYear.setFullYear(thisYear.getFullYear() + 1);
  }
  return Math.ceil(
    (thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function DayBadge({ daysUntil }: { daysUntil: number }) {
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

function ListSkeleton() {
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

export function CelebrationsEvents() {
  const [birthdays, setBirthdays] = useState<UpcomingBirthday[]>([]);
  const [anniversaries, setAnniversaries] = useState<UpcomingAnniversary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bdRes, annRes] = await Promise.all([
        getUpcomingBirthdays().catch(() => null),
        getUpcomingAnniversaries().catch(() => null),
      ]);
      setBirthdays(bdRes?.data ?? []);
      setAnniversaries(annRes?.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-violet-100">
            <CalendarHeart className="size-4 text-violet-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Celebrations & Events</h3>
            <p className="text-muted-foreground text-xs">
              Birthdays & work anniversaries
            </p>
          </div>
        </div>

        <Tabs defaultValue="birthdays" className="flex flex-1 flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="birthdays" className="flex-1 gap-1.5">
              <Cake className="size-3.5" />
              Birthdays ({birthdays.length})
            </TabsTrigger>
            <TabsTrigger value="anniversaries" className="flex-1 gap-1.5">
              <Trophy className="size-3.5" />
              Anniversaries ({anniversaries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="birthdays" className="flex flex-1 flex-col gap-2">
            {isLoading ? (
              <ListSkeleton />
            ) : birthdays.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6">
                <Cake className="text-muted-foreground size-10" />
                <p className="text-muted-foreground text-sm">
                  No upcoming birthdays
                </p>
              </div>
            ) : (
              birthdays.map((b, idx) => {
                const daysUntil = getDaysUntil(b.dateOfBirth);
                const initials = getInitials(b.firstName, b.lastName);
                const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const isToday = daysUntil === 0;

                return (
                  <div
                    key={b.userId}
                    className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors ${
                      isToday
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
                        {formatShortDate(b.dateOfBirth)}
                        {b.department ? ` · ${b.department}` : ''}
                      </p>
                    </div>
                    <DayBadge daysUntil={daysUntil} />
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent
            value="anniversaries"
            className="flex flex-1 flex-col gap-2"
          >
            {isLoading ? (
              <ListSkeleton />
            ) : anniversaries.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6">
                <Trophy className="text-muted-foreground size-10" />
                <p className="text-muted-foreground text-sm">
                  No upcoming work anniversaries
                </p>
              </div>
            ) : (
              anniversaries.map((a, idx) => {
                const daysUntil = getDaysUntil(a.joiningDate);
                const initials = getInitials(a.firstName, a.lastName);
                const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const isToday = daysUntil === 0;

                return (
                  <div
                    key={a.userId}
                    className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors ${
                      isToday
                        ? 'bg-emerald-50 ring-1 ring-emerald-200'
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
                        {a.firstName} {a.lastName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {a.yearsOfService}{' '}
                        {a.yearsOfService === 1 ? 'year' : 'years'}
                        {a.department ? ` · ${a.department}` : ''}
                      </p>
                    </div>
                    <DayBadge daysUntil={daysUntil} />
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
