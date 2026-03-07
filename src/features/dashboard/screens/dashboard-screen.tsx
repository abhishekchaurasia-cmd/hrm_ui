'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import {
  AttendanceClock,
  HoursStats,
  LeaveSummary,
  PageHeader,
  WorkTimeline,
} from '@/components/employee-dashboard';
import service, { HttpMethod } from '@/services/http';
import { getEmployeeBalances } from '@/services/leave-balances';

import type { HoursStat } from '@/components/employee-dashboard/hours-stats';
import type {
  TimelineBar,
  TimelineStat,
} from '@/components/employee-dashboard/work-timeline';
import type { LeaveBalance } from '@/types/leave';

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

const EXPECTED_DAILY_HOURS = 9;

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

function buildLeaveStats(
  balances: LeaveBalance[]
): { label: string; value: number | string }[] {
  const totalAllocated = balances.reduce((s, b) => s + b.allocated, 0);
  const totalUsed = balances.reduce((s, b) => s + b.used, 0);
  const totalBalance = balances.reduce((s, b) => s + b.balance, 0);
  const totalCarried = balances.reduce((s, b) => s + b.carriedForward, 0);

  return [
    { label: 'Total Leaves', value: totalAllocated },
    { label: 'Used', value: totalUsed },
    { label: 'Balance', value: totalBalance },
    { label: 'Carried Forward', value: totalCarried },
  ];
}

function buildHoursStats(attendance: TodayAttendance | null): HoursStat[] {
  const todayMinutes = attendance?.totalMinutes ?? 0;
  const todayHours = (todayMinutes / 60).toFixed(1);
  const expectedMinutes = EXPECTED_DAILY_HOURS * 60;
  const pct =
    expectedMinutes > 0
      ? Math.round((todayMinutes / expectedMinutes) * 100)
      : 0;

  return [
    {
      value: todayHours,
      total: String(EXPECTED_DAILY_HOURS),
      label: 'Total Hours Today',
      changePercent: `${pct}% of expected`,
      changeLabel: '',
      changeDirection: todayMinutes >= expectedMinutes ? 'up' : 'down',
    },
  ];
}

function buildTimelineData(attendance: TodayAttendance | null): {
  stats: TimelineStat[];
  bars: TimelineBar[];
} {
  const totalMinutes = attendance?.totalMinutes ?? 0;
  const overtime = Math.max(0, totalMinutes - EXPECTED_DAILY_HOURS * 60);
  const expectedTotal = EXPECTED_DAILY_HOURS * 60;
  const workPercent =
    expectedTotal > 0
      ? Math.min(100, Math.round((totalMinutes / expectedTotal) * 100))
      : 0;
  const overtimePercent =
    expectedTotal > 0
      ? Math.min(100, Math.round((overtime / expectedTotal) * 100))
      : 0;

  const stats: TimelineStat[] = [
    {
      label: 'Working Hours',
      value: formatDuration(totalMinutes),
      color: '#22c55e',
    },
    {
      label: 'Expected',
      value: formatDuration(expectedTotal),
      color: '#3b82f6',
    },
    { label: 'Overtime', value: formatDuration(overtime), color: '#ef4444' },
  ];

  const bars: TimelineBar[] = [];
  if (workPercent > 0) {
    const segments: TimelineBar['segments'] = [
      { color: '#22c55e', widthPercent: Math.min(workPercent, 100) },
    ];
    if (overtimePercent > 0) {
      segments.push({ color: '#ef4444', widthPercent: overtimePercent });
    }
    bars.push({ segments });
  }

  return { stats, bars };
}

export function DashboardScreen() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [attendance, setAttendance] = useState<TodayAttendance | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === 'hr') {
      router.replace('/dashboard/hr');
    }
  }, [router, session]);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsDataLoading(true);
    try {
      const [balanceRes, attendanceRes] = await Promise.all([
        getEmployeeBalances(session.user.id).catch(() => null),
        service({
          method: HttpMethod.GET,
          url: '/api/v1/attendance/me/today',
        }).catch(() => null),
      ]);

      if (balanceRes?.data) {
        setBalances(balanceRes.data);
      }
      if (attendanceRes?.data) {
        const payload = attendanceRes.data as ApiResponse<TodayAttendance>;
        setAttendance(payload.data);
      }
    } finally {
      setIsDataLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (status === 'loading' || isDataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const leaveStats = buildLeaveStats(balances);
  const hoursStats = buildHoursStats(attendance);
  const { stats: timelineStats, bars: timelineBars } =
    buildTimelineData(attendance);
  const currentYear = new Date().getFullYear().toString();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Dashboard" breadcrumbs={[{ label: 'Overview' }]} />

      <div className="grid gap-5 lg:grid-cols-2">
        <AttendanceClock />
        <LeaveSummary
          title="Leave Details"
          year={currentYear}
          stats={leaveStats}
        />
      </div>

      <HoursStats stats={hoursStats} />
      <WorkTimeline stats={timelineStats} bars={timelineBars} />
    </div>
  );
}
