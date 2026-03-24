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
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getMyEmployeeProfile } from '@/features/admin/employee-profile/api/employee-profile';
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
import type { EmployeeProfile } from '@/features/admin/employee-profile/types/employee-profile';
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
      label: 'Expected Hours',
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

function buildProfileDetails(
  profile: EmployeeProfile | null,
  session: { name?: string | null; email?: string | null; role?: string }
): { label: string; value: string }[] {
  if (!profile) {
    return [
      { label: 'Email', value: session.email ?? '' },
      {
        label: 'Role',
        value:
          (session.role ?? 'employee').charAt(0).toUpperCase() +
          (session.role ?? 'employee').slice(1),
      },
    ];
  }

  const details: { label: string; value: string }[] = [];

  if (profile.employeeNumber) {
    details.push({ label: 'Employee ID', value: profile.employeeNumber });
  }
  if (profile.jobTitle) {
    details.push({ label: 'Job Title', value: profile.jobTitle });
  }
  if (profile.user?.department?.name) {
    details.push({ label: 'Department', value: profile.user.department.name });
  }
  details.push({ label: 'Email', value: profile.email });
  if (profile.joiningDate) {
    details.push({
      label: 'Joining Date',
      value: new Date(profile.joiningDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    });
  }

  return details;
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

export function EmployeeDashboardScreen() {
  const { data: session } = useSession();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [attendance, setAttendance] = useState<TodayAttendance | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const [balanceRes, attendanceRes, summaryRes, profileRes] =
        await Promise.all([
          getMyLeaveBalances(currentYear).catch(() => null),
          getTodayAttendance().catch(() => null),
          getAttendanceSummary(currentMonth, currentYear).catch(() => null),
          getMyEmployeeProfile().catch(() => null),
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
      if (profileRes?.data) {
        setProfile(profileRes.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, currentYear, currentMonth]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const userName = profile
    ? (profile.displayName ?? `${profile.firstName} ${profile.lastName}`)
    : (session?.user?.name ?? 'Employee');
  const leaveChartData = buildLeaveChartData(balances);
  const leaveStats = buildLeaveStats(balances);
  const hoursStats = buildHoursStats(attendance, summary);
  const { stats: timelineStats, bars: timelineBars } = buildTimelineData(
    attendance,
    summary
  );
  const profileDetails = buildProfileDetails(profile, {
    name: session?.user?.name,
    email: session?.user?.email,
    role: session?.user?.role,
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={`Welcome back, ${userName.split(' ')[0]}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Employee Dashboard' },
        ]}
        date={formatCurrentDate()}
      />

      {/* Row 1: Attendance + Leave Summary */}
      <div className="grid gap-5 lg:grid-cols-2">
        <AttendanceClock />
        <LeaveSummary
          title="Leave Overview"
          year={String(currentYear)}
          stats={leaveStats}
          actionSlot={
            <Button variant="outline" className="mt-3 w-full" asChild>
              <Link href="/dashboard/leave">View Leave Details</Link>
            </Button>
          }
          hideApplyButton
        />
      </div>

      {/* Row 2: Leave Chart + Quick Profile */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeaveChart
            title="Leave Breakdown"
            year={String(currentYear)}
            items={leaveChartData}
          />
        </div>
        <Card className="h-full">
          <CardContent className="flex h-full flex-col p-5">
            <h3 className="mb-4 font-semibold">Quick Info</h3>
            <div className="flex flex-1 flex-col gap-2.5">
              {profileDetails.map(d => (
                <div key={d.label} className="flex justify-between gap-2">
                  <span className="text-muted-foreground text-xs">
                    {d.label}
                  </span>
                  <span className="truncate text-right text-xs font-medium">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-3 w-full" asChild>
              <Link href="/dashboard/profile">View Full Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Hours Stats + Team On Leave */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <HoursStats stats={hoursStats} />
          <WorkTimeline stats={timelineStats} bars={timelineBars} />
        </div>
        <TeamOnLeave />
      </div>

      {/* Row 4: Birthdays + Holidays */}
      <div className="grid gap-5 lg:grid-cols-2">
        <UpcomingBirthdays />
        <UpcomingHolidays />
      </div>
    </div>
  );
}
