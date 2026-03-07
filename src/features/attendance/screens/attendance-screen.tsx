'use client';

import {
  AlertTriangle,
  CircleCheck,
  Clock3,
  FileWarning,
  UserCheck,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  AttendanceFollowupSection,
  AttendanceHeader,
  AttendanceStatus,
  LateArrivalsAlerts,
  OverviewStats,
} from '@/components/attendance-dashboard';
import service, { HttpMethod } from '@/services/http';

import type { AttendanceStatusItem } from '@/components/attendance-dashboard/attendance-status';
import type { SummaryItem } from '@/components/attendance-dashboard/attendance-summary';
import type { LateArrivalItem } from '@/components/attendance-dashboard/late-arrival-row';
import type { OverviewStatItem } from '@/components/attendance-dashboard/overview-stats';

interface EmployeeAttendance {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'hr';
  punchInAt: string | null;
  punchOutAt: string | null;
  totalMinutes: number | null;
  status: 'present' | 'late' | 'half_day' | 'absent' | null;
  shiftId: string | null;
}

interface HrTodayResponse {
  success: boolean;
  message: string;
  data: {
    workDate: string;
    employees: EmployeeAttendance[];
  };
}

const AVATAR_COLORS = [
  '#b45309',
  '#dc2626',
  '#64748b',
  '#0891b2',
  '#7c3aed',
  '#059669',
  '#d97706',
];

const EXPECTED_DAILY_MINUTES = 9 * 60;

function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function formatTime(dateString: string | null): string {
  if (!dateString) return '--';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function computeOverviewStats(
  employees: EmployeeAttendance[]
): OverviewStatItem[] {
  const total = employees.length;
  const present = employees.filter(
    e =>
      e.status === 'present' || e.status === 'late' || e.status === 'half_day'
  ).length;
  const absent = employees.filter(e => e.status === 'absent').length;
  const late = employees.filter(e => e.status === 'late').length;
  const notMarked = employees.filter(e => e.status === null).length;
  const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

  return [
    {
      title: 'Total Employees',
      value: total.toLocaleString(),
      delta: '',
      direction: 'up',
      icon: Users,
      iconBg: '#f97316',
    },
    {
      title: 'Present Today',
      value: present.toLocaleString(),
      delta: '',
      direction: 'up',
      icon: UserCheck,
      iconBg: '#0ea5e9',
    },
    {
      title: 'Absent Today',
      value: absent.toLocaleString(),
      delta: '',
      direction: 'down',
      icon: AlertTriangle,
      iconBg: '#eab308',
    },
    {
      title: 'Late Arrivals',
      value: late.toLocaleString(),
      delta: '',
      direction: 'up',
      icon: Clock3,
      iconBg: '#3b82f6',
    },
    {
      title: 'Attendance Rate',
      value: `${rate}%`,
      delta: '',
      direction: 'up',
      icon: CircleCheck,
      iconBg: '#a855f7',
    },
    {
      title: 'Not Marked',
      value: notMarked.toLocaleString(),
      delta: '',
      direction: 'down',
      icon: FileWarning,
      iconBg: '#ef4444',
    },
  ];
}

function computeStatusData(
  employees: EmployeeAttendance[]
): AttendanceStatusItem[] {
  const present = employees.filter(e => e.status === 'present').length;
  const late = employees.filter(e => e.status === 'late').length;
  const halfDay = employees.filter(e => e.status === 'half_day').length;
  const absent = employees.filter(e => e.status === 'absent').length;
  const notMarked = employees.filter(e => e.status === null).length;

  return [
    { label: 'Present', value: present, color: '#22c55e' },
    { label: 'Late', value: late, color: '#eab308' },
    { label: 'Half Day', value: halfDay, color: '#f97316' },
    { label: 'Absent', value: absent, color: '#ef4444' },
    { label: 'Not Marked', value: notMarked, color: '#94a3b8' },
  ];
}

function computeLateArrivals(
  employees: EmployeeAttendance[]
): LateArrivalItem[] {
  return employees
    .filter(e => e.status === 'late')
    .map((e, idx) => ({
      name: `${e.firstName} ${e.lastName}`,
      role: e.role === 'hr' ? 'HR' : 'Employee',
      checkIn: formatTime(e.punchInAt),
      avatarBg: AVATAR_COLORS[idx % AVATAR_COLORS.length],
      initials: getInitials(e.firstName, e.lastName),
      level: Math.min(7, Math.max(1, idx + 3)),
    }));
}

function computeSummaryItems(employees: EmployeeAttendance[]): SummaryItem[] {
  const checkedIn = employees.filter(e => e.punchInAt !== null).length;
  const checkedOut = employees.filter(e => e.punchOutAt !== null).length;

  const punchInTimes = employees
    .filter(e => e.punchInAt !== null)
    .map(e => new Date(e.punchInAt!).getTime());

  let avgCheckIn = '--';
  if (punchInTimes.length > 0) {
    const avg = punchInTimes.reduce((a, b) => a + b, 0) / punchInTimes.length;
    avgCheckIn = new Date(avg).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  return [
    { value: checkedIn.toLocaleString(), label: 'Check-in Count' },
    { value: checkedOut.toLocaleString(), label: 'Check-out Count' },
    { value: avgCheckIn, label: 'Avg Check-in Time' },
  ];
}

function computeAvgWorkingPercent(employees: EmployeeAttendance[]): number {
  const withMinutes = employees.filter(e => e.totalMinutes !== null);
  if (withMinutes.length === 0) return 0;
  const avgMinutes =
    withMinutes.reduce((s, e) => s + (e.totalMinutes ?? 0), 0) /
    withMinutes.length;
  return (avgMinutes / EXPECTED_DAILY_MINUTES) * 100;
}

export function AttendanceScreen() {
  const [employees, setEmployees] = useState<EmployeeAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await service({
          method: HttpMethod.GET,
          url: '/api/v1/hr/attendance/today',
        });
        const payload = response.data as HrTodayResponse;
        setEmployees(payload.data.employees);
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to load attendance data';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAttendance();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <AttendanceHeader />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5">
        <AttendanceHeader />
        <div className="border-destructive/40 bg-destructive/10 rounded-md border p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const overviewStats = computeOverviewStats(employees);
  const statusData = computeStatusData(employees);
  const lateArrivals = computeLateArrivals(employees);
  const summaryItems = computeSummaryItems(employees);
  const avgWorkingPercent = computeAvgWorkingPercent(employees);
  const missingPunchCount = employees.filter(
    e => e.punchInAt !== null && e.punchOutAt === null
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <AttendanceHeader />

      <OverviewStats items={overviewStats} />

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <LateArrivalsAlerts items={lateArrivals} />
        <AttendanceStatus
          statusData={statusData}
          totalWorkingDays={employees.length}
        />
      </div>

      <AttendanceFollowupSection
        lateArrivalCount={lateArrivals.length}
        missingPunchCount={missingPunchCount}
        summaryItems={summaryItems}
        avgWorkingHoursPercent={avgWorkingPercent}
      />
    </div>
  );
}
