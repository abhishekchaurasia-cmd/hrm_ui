'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import {
  AttendanceClock,
  HoursStats,
  LeaveChart,
  LeaveSummary,
  PageHeader,
  TeamOnLeave,
  UpcomingBirthdays,
  UpcomingHolidays,
  WorkTimeline,
} from '@/components/employee-dashboard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

const LEAVE_COLORS = [
  '#22c55e',
  '#3b82f6',
  '#eab308',
  '#ef4444',
  '#14b8a6',
  '#a855f7',
  '#f97316',
  '#ec4899',
];

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

function buildLeaveChartData(
  balances: LeaveBalance[]
): { label: string; value: number; color: string }[] {
  return balances.map((b, i) => ({
    label: b.leaveTypeConfig?.name ?? 'Unknown',
    value: Number(b.used),
    color: LEAVE_COLORS[i % LEAVE_COLORS.length],
  }));
}

function buildLeaveStats(
  balances: LeaveBalance[]
): { label: string; value: number | string }[] {
  const paid = balances.filter(
    b => !(b.leaveTypeConfig?.isUnlimited && !b.leaveTypeConfig?.isPaid)
  );
  const totalAllocated = paid.reduce((s, b) => s + Number(b.allocated), 0);
  const totalUsed = paid.reduce((s, b) => s + Number(b.used), 0);
  const totalBalance = paid.reduce((s, b) => s + Number(b.balance), 0);
  const totalCarried = paid.reduce((s, b) => s + Number(b.carriedForward), 0);

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
): { stats: TimelineStat[]; bars: TimelineBar[] } {
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

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-52 rounded-xl lg:col-span-2" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
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
    return <DashboardSkeleton />;
  }

  if (isHrUser) {
    return <HrDashboardScreen />;
  }

  if (isDataLoading) {
    return <DashboardSkeleton />;
  }

  const leaveStats = buildLeaveStats(balances);
  const leaveChartData = buildLeaveChartData(balances);
  const hoursStats = buildHoursStats(attendance, summary);
  const { stats: timelineStats, bars: timelineBars } = buildTimelineData(
    attendance,
    summary
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Dashboard" breadcrumbs={[{ label: 'Overview' }]} />

      {/* Row 1: Attendance + Leave Summary */}
      <div className="grid gap-5 lg:grid-cols-2">
        <AttendanceClock />
        <LeaveSummary
          title="Leave Overview"
          year={String(currentYear)}
          stats={leaveStats}
          hideApplyButton
          actionSlot={
            <Button variant="outline" className="mt-3 w-full" asChild>
              <Link href="/dashboard/leave">Apply / View Leaves</Link>
            </Button>
          }
        />
      </div>

      {/* Row 2: Leave Chart + Team On Leave */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeaveChart
            title="Leave Breakdown"
            year={String(currentYear)}
            items={leaveChartData}
          />
        </div>
        <TeamOnLeave />
      </div>

      {/* Row 3: Hours Stats + Work Timeline */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <HoursStats stats={hoursStats} />
          <WorkTimeline stats={timelineStats} bars={timelineBars} />
        </div>
        <UpcomingBirthdays />
      </div>

      {/* Row 4: Upcoming Holidays */}
      <div className="grid gap-5 lg:grid-cols-2">
        <UpcomingHolidays />
      </div>
    </div>
  );
}
