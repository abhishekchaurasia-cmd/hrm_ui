'use client';

import axios from 'axios';
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  ClipboardCheck,
  FileText,
  FileWarning,
  ListChecks,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import {
  AttendanceFollowupSection,
  AttendanceHeader,
  AttendanceStatus,
  LateArrivalsAlerts,
  OverviewStats,
} from '@/components/attendance-dashboard';
import { AttendanceClock } from '@/components/employee-dashboard/attendance-clock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getAttendanceHistory,
  getAttendanceSummary,
} from '@/services/attendance';
import service, { HttpMethod } from '@/services/http';

import type { AttendanceStatusItem } from '@/components/attendance-dashboard/attendance-status';
import type { SummaryItem } from '@/components/attendance-dashboard/attendance-summary';
import type { LateArrivalItem } from '@/components/attendance-dashboard/late-arrival-row';
import type { OverviewStatItem } from '@/components/attendance-dashboard/overview-stats';
import type { AttendanceRecord, AttendanceSummary } from '@/types/attendance';

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

interface EmployeeTodayResponse {
  success: boolean;
  message: string;
  data: {
    workDate: string;
    punchInAt: string | null;
    punchOutAt: string | null;
    totalMinutes: number | null;
    status: 'present' | 'late' | 'half_day' | 'absent' | null;
    shiftId: string | null;
  } | null;
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

function toEmployeeRole(role: string | undefined): 'employee' | 'hr' {
  return role === 'hr' ? 'hr' : 'employee';
}

function splitName(fullName: string | undefined): {
  firstName: string;
  lastName: string;
} {
  if (!fullName) return { firstName: 'Employee', lastName: '' };
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return {
    firstName: firstName || 'Employee',
    lastName: rest.join(' '),
  };
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string' && message.length > 0) return message;
    return fallback;
  }

  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message);
  }

  return fallback;
}

function formatDurationFromMinutes(minutes: number | null): string {
  if (minutes === null) return '--';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${String(remainingMinutes).padStart(2, '0')}m`;
}

function getStatusBadgeVariant(
  status: EmployeeAttendance['status']
): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (status === 'present') return 'success';
  if (status === 'late' || status === 'half_day') return 'warning';
  if (status === 'absent') return 'destructive';
  return 'secondary';
}

function getStatusLabel(status: EmployeeAttendance['status']): string {
  if (status === 'half_day') return 'Half Day';
  if (status === null) return 'Not Marked';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getAttendanceGuidance(status: EmployeeAttendance['status']): string[] {
  switch (status) {
    case 'present':
      return [
        'Great start. Keep your check-out updated at end of day.',
        'Review pending tasks and mark progress before sign-off.',
      ];
    case 'late':
      return [
        'You are marked late today. Add reason if your policy requires it.',
        'Try to complete full expected hours before check-out.',
      ];
    case 'half_day':
      return [
        'Your status is half-day. Confirm this with HR if unexpected.',
        'Check leave balance if you plan to regularize attendance.',
      ];
    case 'absent':
      return [
        'You are marked absent. Contact HR if this looks incorrect.',
        'Apply leave to regularize the day if applicable.',
      ];
    default:
      return [
        'No attendance status yet. Punch in to begin tracking your day.',
        'Keep your attendance updated to avoid payroll issues.',
      ];
  }
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatHistoryTime(dateString: string | null): string {
  if (!dateString) return '--';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function getSummaryStatusVariant(
  status: string | null
): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (status === 'present') return 'success';
  if (status === 'late' || status === 'half_day') return 'warning';
  if (status === 'absent') return 'destructive';
  return 'secondary';
}

function getSummaryStatusLabel(status: string | null): string {
  if (status === 'half_day') return 'Half Day';
  if (!status) return 'N/A';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function AttendanceScreen() {
  const { data: session, status } = useSession();
  const [employees, setEmployees] = useState<EmployeeAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    const fetchAttendance = async () => {
      if (!session?.user?.id) {
        setError('Unable to resolve user session');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        if (session.user.role === 'hr') {
          const response = await service({
            method: HttpMethod.GET,
            url: '/api/v1/hr/attendance/today',
          });
          const payload = response.data as HrTodayResponse;
          setEmployees(payload.data.employees);
        } else {
          const response = await service({
            method: HttpMethod.GET,
            url: '/api/v1/attendance/me/today',
          });
          const payload = response.data as EmployeeTodayResponse;
          const { firstName, lastName } = splitName(session.user.name);

          if (!payload.data) {
            setEmployees([]);
          } else {
            setEmployees([
              {
                id: session.user.id,
                email: session.user.email,
                firstName,
                lastName,
                role: toEmployeeRole(session.user.role),
                punchInAt: payload.data.punchInAt,
                punchOutAt: payload.data.punchOutAt,
                totalMinutes: payload.data.totalMinutes,
                status: payload.data.status,
                shiftId: payload.data.shiftId,
              },
            ]);
          }
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load attendance data'));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAttendance();
  }, [session, status]);

  if (status === 'loading' || isLoading) {
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

  if (session?.user?.role !== 'hr') {
    return <EmployeeAttendanceView employees={employees} />;
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
      <AttendanceHeader showApplyLeave={false} />

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

function EmployeeAttendanceView({
  employees,
}: {
  employees: EmployeeAttendance[];
}) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const attendance = employees[0] ?? null;
  const totalMinutes = attendance?.totalMinutes ?? null;
  const progressPercent =
    totalMinutes === null
      ? 0
      : Math.min(
          100,
          Math.round((totalMinutes / EXPECTED_DAILY_MINUTES) * 100)
        );
  const expectedHours = formatDurationFromMinutes(EXPECTED_DAILY_MINUTES);
  const guidanceItems = getAttendanceGuidance(attendance?.status ?? null);

  const fetchHistoryAndSummary = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const [historyRes, summaryRes] = await Promise.all([
        getAttendanceHistory(selectedMonth, selectedYear, historyPage).catch(
          () => null
        ),
        getAttendanceSummary(selectedMonth, selectedYear).catch(() => null),
      ]);
      if (historyRes?.data) {
        setHistory(historyRes.data.records);
        setTotalPages(historyRes.data.totalPages);
      }
      if (summaryRes?.data) {
        setSummary(summaryRes.data);
      }
    } finally {
      setIsHistoryLoading(false);
    }
  }, [selectedMonth, selectedYear, historyPage]);

  useEffect(() => {
    void fetchHistoryAndSummary();
  }, [fetchHistoryAndSummary]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
    setHistoryPage(1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
    setHistoryPage(1);
  };

  const yearOptions = Array.from(
    { length: 3 },
    (_, i) => now.getFullYear() - 1 + i
  );

  return (
    <div className="flex flex-col gap-5">
      <AttendanceHeader />

      {/* Today: Clock + Snapshot */}
      <div className="grid gap-5 lg:grid-cols-2">
        <AttendanceClock />
        <Card className="h-full">
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Today&apos;s Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Attendance Status</p>
              <Badge
                variant={getStatusBadgeVariant(attendance?.status ?? null)}
              >
                {getStatusLabel(attendance?.status ?? null)}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-2.5">
                <p className="text-muted-foreground text-xs">Check-In</p>
                <p className="text-sm font-medium">
                  {formatTime(attendance?.punchInAt ?? null)}
                </p>
              </div>
              <div className="rounded-md border p-2.5">
                <p className="text-muted-foreground text-xs">Check-Out</p>
                <p className="text-sm font-medium">
                  {formatTime(attendance?.punchOutAt ?? null)}
                </p>
              </div>
              <div className="rounded-md border p-2.5">
                <p className="text-muted-foreground text-xs">Total Hours</p>
                <p className="text-sm font-medium">
                  {formatDurationFromMinutes(totalMinutes)}
                </p>
              </div>
              <div className="rounded-md border p-2.5">
                <p className="text-muted-foreground text-xs">Expected Hours</p>
                <p className="text-sm font-medium">{expectedHours}</p>
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <p className="text-muted-foreground">Daily Completion</p>
                <p className="font-medium">{progressPercent}%</p>
              </div>
              <div className="bg-muted h-2 rounded-full">
                <div
                  className="h-2 rounded-full bg-orange-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Month/Year Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="size-4" />
        </Button>
        <Select
          value={String(selectedMonth)}
          onValueChange={v => {
            setSelectedMonth(Number(v));
            setHistoryPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTH_NAMES.map((name, idx) => (
              <SelectItem key={idx + 1} value={String(idx + 1)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(selectedYear)}
          onValueChange={v => {
            setSelectedYear(Number(v));
            setHistoryPage(1);
          }}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map(y => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs">Present</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.present}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs">Late</p>
              <p className="text-2xl font-bold text-orange-600">
                {summary.late}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs">Half Day</p>
              <p className="text-2xl font-bold text-yellow-600">
                {summary.halfDay}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs">Absent</p>
              <p className="text-2xl font-bold text-red-600">
                {summary.absent}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs">Total Hours</p>
              <p className="text-2xl font-bold">
                {formatMinutes(summary.totalWorkedMinutes)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Working Hours Summary */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs">Working Hours</p>
              <p className="text-xl font-bold">
                {formatMinutes(summary.totalWorkedMinutes)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs">Expected Hours</p>
              <p className="text-xl font-bold">
                {formatMinutes(
                  summary.expectedMinutesPerDay * summary.totalDays
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs">Overtime</p>
              <p className="text-xl font-bold">
                {formatMinutes(
                  Math.max(
                    0,
                    summary.totalWorkedMinutes -
                      summary.expectedMinutesPerDay * summary.totalDays
                  )
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-5" />
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isHistoryLoading ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Loading history...
            </p>
          ) : history.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              No attendance records for this period.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Punch In</TableHead>
                    <TableHead>Punch Out</TableHead>
                    <TableHead>Working Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map(record => {
                    const date = new Date(record.workDate);
                    const canRegularize =
                      record.status === 'absent' ||
                      record.status === 'late' ||
                      record.status === 'half_day' ||
                      !record.punchInAt ||
                      !record.punchOutAt;
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="whitespace-nowrap">
                          {date.toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>{DAY_NAMES[date.getDay()]}</TableCell>
                        <TableCell>
                          {formatHistoryTime(record.punchInAt)}
                        </TableCell>
                        <TableCell>
                          {formatHistoryTime(record.punchOutAt)}
                        </TableCell>
                        <TableCell>
                          {record.totalMinutes !== null &&
                          record.totalMinutes !== undefined
                            ? formatMinutes(record.totalMinutes)
                            : '--'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getSummaryStatusVariant(record.status)}
                          >
                            {getSummaryStatusLabel(record.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {canRegularize && (
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 px-2 text-xs text-orange-500 hover:text-orange-400"
                            >
                              <Link
                                href={`/dashboard/regularization?date=${record.workDate}`}
                              >
                                <ClipboardCheck className="size-3.5" />
                                Regularize
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={historyPage <= 1}
                    onClick={() => setHistoryPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-muted-foreground text-sm">
                    Page {historyPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={historyPage >= totalPages}
                    onClick={() => setHistoryPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Guidance + Quick Actions */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="size-4" />
              Attendance Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {guidanceItems.map(item => (
              <div key={item} className="rounded-md border p-2.5 text-sm">
                {item}
              </div>
            ))}
            <div className="bg-muted/40 rounded-md border p-2.5 text-xs">
              Keep punch-in and punch-out records accurate. Attendance impacts
              payroll and compliance.
            </div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <Link href="/dashboard/regularization">
                <ClipboardCheck className="size-4" />
                Request Regularization
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <Link href="/dashboard/leave">
                <FileText className="size-4" />
                Apply or Review Leave
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <Link href="/dashboard/profile">
                <UserCheck className="size-4" />
                Update My Profile
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <Link href="/dashboard">
                <CircleCheck className="size-4" />
                Go to Main Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
