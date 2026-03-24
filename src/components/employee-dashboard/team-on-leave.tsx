'use client';

import { UserX } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getTeamOnLeave, type TeamOnLeaveMember } from '@/services/leaves';

function formatRange(start: string, end: string): string {
  const fmt = (s: string) =>
    new Date(s + 'T00:00:00').toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  return start === end ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
}

export function TeamOnLeave() {
  const [members, setMembers] = useState<TeamOnLeaveMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getTeamOnLeave();
      setMembers(res.data ?? []);
    } catch {
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Team On Leave Today</h3>
          <UserX className="text-muted-foreground size-4" />
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center py-4">
              <p className="text-muted-foreground text-sm">
                No one is on leave today
              </p>
              <p className="text-muted-foreground text-xs">
                Full team available
              </p>
            </div>
          ) : (
            members.map(m => {
              const label = m.leaveTypeName ?? m.leaveType ?? 'Leave';
              return (
                <div key={m.userId} className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <UserX className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatRange(m.startDate, m.endDate)}
                      {m.isHalfDay ? ' (Half day)' : ''}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {label}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
