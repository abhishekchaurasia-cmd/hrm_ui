'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import {
  AttendanceClock,
  HoursStats,
  LeaveChart,
  LeaveSummary,
  PageHeader,
  ProfileCard,
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

const EXPECTED_DAILY_HOURS = 9;

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

function formatCurrentDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function buildLeaveChartData(
  balances: LeaveBalance[]
): { label: string; value: number; color: string }[] {
  return balances.map((b, i) => ({
    label: b.leaveTypeConfig?.name ?? 'Unknown',
    value: b.used,
    color: LEAVE_COLORS[i % LEAVE_COLORS.length],
  }));
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
  const expectedDailyMinutes = EXPECTED_DAILY_HOURS * 60;
  const dailyPercent =
    expectedDailyMinutes > 0
      ? Math.round((todayMinutes / expectedDailyMinutes) * 100)
      : 0;

  return [
    {
      value: todayHours,
      total: String(EXPECTED_DAILY_HOURS),
      label: 'Total Hours Today',
      changePercent: `${dailyPercent}% of expected`,
      changeLabel: '',
      changeDirection: todayMinutes >= expectedDailyMinutes ? 'up' : 'down',
    },
  ];
}

function buildTimelineData(attendance: TodayAttendance | null): {
  stats: TimelineStat[];
  bars: TimelineBar[];
} {
  const totalMinutes = attendance?.totalMinutes ?? 0;
  const workingHrs = formatDuration(totalMinutes);
  const expectedHrs = formatDuration(EXPECTED_DAILY_HOURS * 60);
  const overtime = Math.max(0, totalMinutes - EXPECTED_DAILY_HOURS * 60);

  const stats: TimelineStat[] = [
    { label: 'Working Hours', value: workingHrs, color: '#22c55e' },
    { label: 'Expected Hours', value: expectedHrs, color: '#3b82f6' },
    { label: 'Overtime', value: formatDuration(overtime), color: '#ef4444' },
  ];

  const expectedTotal = EXPECTED_DAILY_HOURS * 60;
  const workPercent =
    expectedTotal > 0
      ? Math.min(100, Math.round((totalMinutes / expectedTotal) * 100))
      : 0;
  const overtimePercent =
    expectedTotal > 0
      ? Math.min(100, Math.round((overtime / expectedTotal) * 100))
      : 0;

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

export function EmployeeDashboardScreen() {
  const { data: session } = useSession();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [attendance, setAttendance] = useState<TodayAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const userName = session?.user?.name ?? 'Employee';
  const userEmail = session?.user?.email ?? '';
  const userRole = session?.user?.role ?? 'employee';

  const profileDetails = [
    { label: 'Email Address', value: userEmail },
    {
      label: 'Role',
      value: userRole.charAt(0).toUpperCase() + userRole.slice(1),
    },
  ];

  const leaveChartData = buildLeaveChartData(balances);
  const leaveStats = buildLeaveStats(balances);
  const hoursStats = buildHoursStats(attendance);
  const { stats: timelineStats, bars: timelineBars } =
    buildTimelineData(attendance);

  const currentYear = new Date().getFullYear().toString();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Employee Dashboard"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Employee Dashboard' },
        ]}
        date={formatCurrentDate()}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <ProfileCard name={userName} role={userRole} details={profileDetails} />
        <LeaveChart
          title="Leave Details"
          year={currentYear}
          items={leaveChartData}
        />
        <LeaveSummary
          title="Leave Details"
          year={currentYear}
          stats={leaveStats}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <AttendanceClock />

        <div className="flex flex-col gap-5 lg:col-span-2">
          <HoursStats stats={hoursStats} />
          <WorkTimeline stats={timelineStats} bars={timelineBars} />
        </div>
      </div>
    </div>
  );
}
