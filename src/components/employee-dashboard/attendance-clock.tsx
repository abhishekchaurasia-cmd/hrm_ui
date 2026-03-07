'use client';

import { Flame } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDurationFromMinutes(totalMinutes: number | null): string {
  if (totalMinutes === null) {
    return '--';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function CircularProgress({
  progress,
  totalHours,
}: {
  progress: number;
  totalHours: string;
}) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const filled = (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 180 180" className="size-44">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
          transform="rotate(-90 90 90)"
        />
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-muted-foreground text-xs">Total Hours</p>
        <p className="text-xl font-bold tabular-nums">{totalHours}</p>
      </div>
    </div>
  );
}

export function AttendanceClock() {
  const [now, setNow] = useState(() => new Date());
  const [todayAttendance, setTodayAttendance] =
    useState<TodayAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const WORK_DAY_SECONDS = 9 * 3600;

  const getElapsed = useCallback((attendance: TodayAttendance | null) => {
    if (!attendance?.punchInAt) {
      return 0;
    }

    const punchInDate = new Date(attendance.punchInAt);
    const endDate = attendance.punchOutAt
      ? new Date(attendance.punchOutAt)
      : new Date();

    if (
      Number.isNaN(punchInDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return 0;
    }

    const current = new Date();
    const effectiveEnd = attendance.punchOutAt ? endDate : current;
    const diff = Math.max(
      0,
      Math.floor((effectiveEnd.getTime() - punchInDate.getTime()) / 1000)
    );
    return diff;
  }, []);

  const [elapsed, setElapsed] = useState(0);

  const fetchTodayAttendance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await service({
        method: HttpMethod.GET,
        url: '/api/v1/attendance/me/today',
      });

      const data = response.data as ApiResponse<TodayAttendance>;
      setTodayAttendance(data.data);
      setElapsed(getElapsed(data.data));
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to load attendance';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [getElapsed]);

  const handlePunchIn = async () => {
    setIsActionLoading(true);
    setError(null);
    try {
      await service({
        method: HttpMethod.POST,
        url: '/api/v1/attendance/punch-in',
      });
      await fetchTodayAttendance();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to punch in';
      setError(message);
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
      await fetchTodayAttendance();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to punch out';
      setError(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    void fetchTodayAttendance();
  }, [fetchTodayAttendance]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
      setElapsed(getElapsed(todayAttendance));
    }, 1000);

    return () => clearInterval(timer);
  }, [getElapsed, todayAttendance]);

  const progress = Math.min(100, (elapsed / WORK_DAY_SECONDS) * 100);
  const hasPunchedIn = !!todayAttendance?.punchInAt;
  const hasPunchedOut = !!todayAttendance?.punchOutAt;
  const actionLabel = !hasPunchedIn
    ? 'Punch In'
    : hasPunchedOut
      ? 'Completed'
      : 'Punch Out';
  const actionHandler = hasPunchedIn ? handlePunchOut : handlePunchIn;
  const isActionDisabled = isLoading || isActionLoading || hasPunchedOut;

  const punchInTime = todayAttendance?.punchInAt
    ? formatTime(new Date(todayAttendance.punchInAt))
    : '--';
  const productionHours = formatDurationFromMinutes(
    todayAttendance?.totalMinutes ?? null
  );

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col items-center p-5">
        <h3 className="mb-1 font-semibold">Attendance</h3>
        <p className="text-muted-foreground mb-4 text-sm tabular-nums">
          {formatTime(now)}, {formatDate(now)}
        </p>

        <CircularProgress
          progress={progress}
          totalHours={formatElapsed(elapsed)}
        />

        <div className="bg-muted mt-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
          <span>Production : {productionHours}</span>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-sm">
          <Flame className="size-3.5 text-orange-400" />
          Punch In at {punchInTime}
        </p>

        {error && (
          <p className="border-destructive/40 bg-destructive/10 text-destructive mt-2 rounded-md border px-2 py-1 text-xs">
            {error}
          </p>
        )}

        <Button
          className="mt-4 w-full bg-orange-500 text-white hover:bg-orange-600"
          onClick={() => void actionHandler()}
          disabled={isActionDisabled}
        >
          {isActionLoading ? 'Saving...' : actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
