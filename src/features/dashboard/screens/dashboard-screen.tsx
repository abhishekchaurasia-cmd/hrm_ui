'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import {
  AttendanceClock,
  HoursStats,
  LeaveSummary,
  PageHeader,
  UpcomingHolidays,
  WorkTimeline,
} from '@/components/employee-dashboard';
import { HrDashboardScreen } from '@/features/hr-dashboard';
import {
  getAttendanceSummary,
  getTodayAttendance,
} from '@/services/attendance';
import { getMyLeaveBalances } from '@/services/leaves';

import type { HoursStat } from '@/components/employee-dashboard/hours-stats';
import type {
  TimelineBar,
  TimelineStat,
} from '@/components/employee-dashboard/work-timeline';
import type { AttendanceSummary, TodayAttendance } from '@/types/attendance';
import type { LeaveBalance } from '@/types/leave';

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

function buildHoursStats(
  attendance: TodayAttendance | null,
  summary: AttendanceSummary | null
): HoursStat[] {
  const todayMinutes = attendance?.totalMinutes ?? 0;
  const expectedPerDay = summary?.expectedMinutesPerDay ?? 540;
  const todayHours = (todayMinutes / 60).toFixed(1);
  const expectedDailyHours = (expectedPerDay / 60).toFixed(0);
  const pct =
    expectedPerDay > 0 ? Math.round((todayMinutes / expectedPerDay) * 100) : 0;

  const stats: HoursStat[] = [
    {
      value: todayHours,
      total: expectedDailyHours,
      label: 'Total Hours Today',
      changePercent: `${pct}% of expected`,
      changeLabel: '',
      changeDirection: todayMinutes >= expectedPerDay ? 'up' : 'down',
    },
  ];

  if (summary) {
    const totalWorkedHours = (summary.totalWorkedMinutes / 60).toFixed(1);
    const expectedTotal = summary.expectedMinutesPerDay * summary.totalDays;
    const expectedHours = (expectedTotal / 60).toFixed(0);
    const overtime = Math.max(0, summary.totalWorkedMinutes - expectedTotal);
    const monthPct =
      expectedTotal > 0
        ? Math.round((summary.totalWorkedMinutes / expectedTotal) * 100)
        : 0;

    stats.push(
      {
        value: totalWorkedHours,
        total: expectedHours,
        label: 'Monthly Working Hours',
        changePercent: `${monthPct}% of expected`,
        changeLabel: '',
        changeDirection:
          summary.totalWorkedMinutes >= expectedTotal ? 'up' : 'down',
      },
      {
        value: (overtime / 60).toFixed(1),
        total: '0',
        label: 'Overtime (Month)',
        changePercent: overtime > 0 ? formatDuration(overtime) : 'None',
        changeLabel: '',
        changeDirection: overtime > 0 ? 'up' : 'down',
      }
    );
  }

  return stats;
}

function buildTimelineData(
  attendance: TodayAttendance | null,
  summary: AttendanceSummary | null
): {
  stats: TimelineStat[];
  bars: TimelineBar[];
} {
  const totalWorked =
    summary?.totalWorkedMinutes ?? attendance?.totalMinutes ?? 0;
  const expectedPerDay = summary?.expectedMinutesPerDay ?? 540;
  const totalDays = summary?.totalDays ?? 1;
  const expectedTotal = expectedPerDay * totalDays;
  const overtime = Math.max(0, totalWorked - expectedTotal);
  const workPercent =
    expectedTotal > 0
      ? Math.min(100, Math.round((totalWorked / expectedTotal) * 100))
      : 0;
  const overtimePercent =
    expectedTotal > 0
      ? Math.min(100, Math.round((overtime / expectedTotal) * 100))
      : 0;

  const stats: TimelineStat[] = [
    {
      label: 'Working Hours',
      value: formatDuration(totalWorked),
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
  const { data: session, status } = useSession();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [attendance, setAttendance] = useState<TodayAttendance | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const isHrUser = session?.user?.role === 'hr';

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const fetchData = useCallback(async () => {
    if (!session?.user?.id || isHrUser) {
      setIsDataLoading(false);
      return;
    }
    setIsDataLoading(true);
    try {
      const [balanceRes, attendanceRes, summaryRes] = await Promise.all([
        getMyLeaveBalances(currentYear).catch(() => null),
        getTodayAttendance().catch(() => null),
        getAttendanceSummary(currentMonth, currentYear).catch(() => null),
      ]);

      if (balanceRes?.data) {
        setBalances(Array.isArray(balanceRes.data) ? balanceRes.data : []);
      }
      if (attendanceRes?.data) {
        setAttendance(attendanceRes.data);
      }
      if (summaryRes?.data) {
        setSummary(summaryRes.data);
      }
    } finally {
      setIsDataLoading(false);
    }
  }, [isHrUser, session?.user?.id, currentYear, currentMonth]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isHrUser) {
    return <HrDashboardScreen />;
  }

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const leaveStats = buildLeaveStats(balances);
  const hoursStats = buildHoursStats(attendance, summary);
  const { stats: timelineStats, bars: timelineBars } = buildTimelineData(
    attendance,
    summary
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Dashboard" breadcrumbs={[{ label: 'Overview' }]} />

      <div className="grid gap-5 lg:grid-cols-2">
        <AttendanceClock />
        <LeaveSummary
          title="Leave Details"
          year={String(currentYear)}
          stats={leaveStats}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HoursStats stats={hoursStats} />
        </div>
        <UpcomingHolidays />
      </div>
      <WorkTimeline stats={timelineStats} bars={timelineBars} />
    </div>
  );
}
