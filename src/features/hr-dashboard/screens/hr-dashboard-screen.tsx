'use client';

import {
  AlertTriangle,
  ArrowRight,
  CircleCheck,
  Clock3,
  FileWarning,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  AttendanceFollowupSection,
  AttendanceStatus,
  LateArrivalsAlerts,
  OverviewStats,
} from '@/components/attendance-dashboard';
import { LeaveSummary, PageHeader } from '@/components/employee-dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import service, { HttpMethod } from '@/services/http';

import type { AttendanceStatusItem } from '@/components/attendance-dashboard/attendance-status';
import type { SummaryItem } from '@/components/attendance-dashboard/attendance-summary';
import type { LateArrivalItem } from '@/components/attendance-dashboard/late-arrival-row';
import type { OverviewStatItem } from '@/components/attendance-dashboard/overview-stats';

interface HrTodayEmployeeAttendance {
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
    employees: HrTodayEmployeeAttendance[];
  };
}

interface LeaveRequest {
  id: string;
  status: string;
}

interface LeavesResponse {
  success: boolean;
  message: string;
  data: LeaveRequest[];
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

function formatTotalHours(totalMinutes: number | null): string {
  if (totalMinutes === null) return '--';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function getStatusBadgeVariant(
  status: HrTodayEmployeeAttendance['status']
): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (status === 'present') return 'success';
  if (status === 'late' || status === 'half_day') return 'warning';
  if (status === 'absent') return 'destructive';
  return 'secondary';
}

function getStatusLabel(status: HrTodayEmployeeAttendance['status']): string {
  if (status === 'half_day') return 'Half Day';
  if (status === null) return 'Not Marked';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function computeOverviewStats(
  employees: HrTodayEmployeeAttendance[]
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
  employees: HrTodayEmployeeAttendance[]
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

function computeLeaveStats(
  leaves: LeaveRequest[]
): { label: string; value: number | string }[] {
  const pending = leaves.filter(l => l.status === 'pending').length;
  const approved = leaves.filter(l => l.status === 'approved').length;
  const rejected = leaves.filter(l => l.status === 'rejected').length;
  const total = leaves.length;

  return [
    { label: 'Total Requests', value: total },
    { label: 'Pending Approvals', value: pending },
    { label: 'Approved', value: approved },
    { label: 'Rejected', value: rejected },
  ];
}

function computeLateArrivals(
  employees: HrTodayEmployeeAttendance[]
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

function computeSummaryItems(
  employees: HrTodayEmployeeAttendance[]
): SummaryItem[] {
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

function computeAvgWorkingPercent(
  employees: HrTodayEmployeeAttendance[]
): number {
  const withMinutes = employees.filter(e => e.totalMinutes !== null);
  if (withMinutes.length === 0) return 0;
  const avgMinutes =
    withMinutes.reduce((s, e) => s + (e.totalMinutes ?? 0), 0) /
    withMinutes.length;
  return (avgMinutes / EXPECTED_DAILY_MINUTES) * 100;
}

export function HrDashboardScreen() {
  const [employees, setEmployees] = useState<HrTodayEmployeeAttendance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [workDate, setWorkDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [attendanceRes, leavesRes] = await Promise.all([
          service({
            method: HttpMethod.GET,
            url: '/api/v1/hr/attendance/today',
          }),
          service({
            method: HttpMethod.GET,
            url: '/api/v1/leaves',
          }).catch(() => null),
        ]);

        const attendancePayload = attendanceRes.data as HrTodayResponse;
        setEmployees(attendancePayload.data.employees);
        setWorkDate(attendancePayload.data.workDate);

        if (leavesRes?.data) {
          const leavesPayload = leavesRes.data as LeavesResponse;
          setLeaves(leavesPayload.data);
        }
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to load HR dashboard data';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  const overviewStats = computeOverviewStats(employees);
  const statusData = computeStatusData(employees);
  const leaveStats = computeLeaveStats(leaves);
  const lateArrivals = computeLateArrivals(employees);
  const summaryItems = computeSummaryItems(employees);
  const avgWorkingPercent = computeAvgWorkingPercent(employees);
  const missingPunchCount = employees.filter(
    e => e.punchInAt !== null && e.punchOutAt === null
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="HR Dashboard"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'HR' },
        ]}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      ) : error ? (
        <div className="border-destructive/40 bg-destructive/10 rounded-md border p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      ) : (
        <>
          <OverviewStats items={overviewStats} />

          <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
            <LateArrivalsAlerts items={lateArrivals} />
            <AttendanceStatus
              statusData={statusData}
              totalWorkingDays={employees.length}
            />
          </div>

          <LeaveSummary
            title="Leave Overview"
            year={new Date().getFullYear().toString()}
            stats={leaveStats}
            hideApplyButton
            actionSlot={
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/dashboard/admin/leave-requests">
                  View All Requests
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          />

          <AttendanceFollowupSection
            lateArrivalCount={lateArrivals.length}
            missingPunchCount={missingPunchCount}
            summaryItems={summaryItems}
            avgWorkingHoursPercent={avgWorkingPercent}
          />

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                Today&apos;s Attendance {workDate ? `(${workDate})` : ''}
              </CardTitle>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/dashboard/attendance">
                  View Details
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {employees.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  No attendance records for today.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Punch In</TableHead>
                      <TableHead>Punch Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee, idx) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span
                              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                              style={{
                                backgroundColor:
                                  AVATAR_COLORS[idx % AVATAR_COLORS.length],
                              }}
                            >
                              {getInitials(
                                employee.firstName,
                                employee.lastName
                              )}
                            </span>
                            <div>
                              <p className="text-sm font-medium">
                                {employee.firstName} {employee.lastName}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {employee.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatTime(employee.punchInAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatTime(employee.punchOutAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatTotalHours(employee.totalMinutes)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(employee.status)}
                          >
                            {getStatusLabel(employee.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
