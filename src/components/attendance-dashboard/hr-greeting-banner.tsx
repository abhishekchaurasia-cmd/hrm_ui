'use client';

import { Clock, LogIn, LogOut } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import service, { HttpMethod } from '@/services/http';

interface TodayAttendance {
  workDate: string;
  punchInAt: string | null;
  punchOutAt: string | null;
  totalMinutes: number | null;
  status: 'present' | 'late' | 'half_day' | 'absent' | null;
  shiftId: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatPunchTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function HrGreetingBanner() {
  const { data: session } = useSession();
  const [now, setNow] = useState(() => new Date());
  const [attendance, setAttendance] = useState<TodayAttendance | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await service({
        method: HttpMethod.GET,
        url: '/api/v1/attendance/me/today',
      });
      const payload = res.data as ApiResponse<TodayAttendance>;
      setAttendance(payload.data);
    } catch {
      setAttendance(null);
    }
  }, []);

  const handlePunchIn = async () => {
    setIsActionLoading(true);
    setError(null);
    try {
      await service({
        method: HttpMethod.POST,
        url: '/api/v1/attendance/punch-in',
      });
      await fetchAttendance();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to clock in';
      setError(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setIsActionLoading(true);
    setError(null);
    try {
      await service({
        method: HttpMethod.POST,
        url: '/api/v1/attendance/punch-out',
      });
      await fetchAttendance();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to clock out';
      setError(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    void fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hasPunchedIn = !!attendance?.punchInAt;
  const hasPunchedOut = !!attendance?.punchOutAt;
  const greeting = getGreeting(now.getHours());
  const userName = session?.user?.name ?? 'there';

  let statusLabel: string;
  let statusVariant: 'secondary' | 'success' | 'warning' | 'destructive';
  if (!hasPunchedIn) {
    statusLabel = 'Not Clocked In';
    statusVariant = 'secondary';
  } else if (hasPunchedOut) {
    statusLabel = `Completed · ${formatPunchTime(attendance!.punchInAt!)} - ${formatPunchTime(attendance!.punchOutAt!)}`;
    statusVariant = 'success';
  } else {
    statusLabel = `Clocked In at ${formatPunchTime(attendance!.punchInAt!)}`;
    statusVariant = 'success';
  }

  return (
    <Card className="border-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold sm:text-2xl">
            {greeting}, {userName}!
          </h2>
          <p className="text-sm text-white/80">{formatDate(now)}</p>
          <div className="flex items-center gap-2 text-sm font-medium text-white/90 tabular-nums">
            <Clock className="size-4" />
            {formatClock(now)}
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <Badge
            variant={statusVariant}
            className={
              statusVariant === 'secondary'
                ? 'bg-white/20 text-white hover:bg-white/30'
                : statusVariant === 'success'
                  ? 'bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400/30'
                  : ''
            }
          >
            {statusLabel}
          </Badge>

          {error && (
            <p className="rounded bg-red-400/20 px-2 py-1 text-xs text-red-100">
              {error}
            </p>
          )}

          {!hasPunchedIn ? (
            <Button
              size="sm"
              className="gap-1.5 bg-white text-indigo-700 hover:bg-white/90"
              onClick={() => void handlePunchIn()}
              disabled={isActionLoading}
            >
              <LogIn className="size-4" />
              {isActionLoading ? 'Clocking In...' : 'Clock In'}
            </Button>
          ) : !hasPunchedOut ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-white/40 bg-white/10 text-white hover:bg-white/20"
              onClick={() => void handlePunchOut()}
              disabled={isActionLoading}
            >
              <LogOut className="size-4" />
              {isActionLoading ? 'Clocking Out...' : 'Clock Out'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
