'use client';

import axios from 'axios';
import {
  AlertTriangle,
  ArrowRight,
  CircleCheck,
  Clock3,
  FileWarning,
  Search,
  Trash2,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  AttendanceFollowupSection,
  AttendanceStatus,
  CelebrationsEvents,
  HrGreetingBanner,
  LateArrivalsAlerts,
  OverviewStats,
} from '@/components/attendance-dashboard';
import {
  LeaveSummary,
  PageHeader,
  UpcomingHolidays,
} from '@/components/employee-dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import service, { HttpMethod } from '@/services/http';
import { deleteUser } from '@/services/users';

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
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
];

const EXPECTED_DAILY_MINUTES = 9 * 60;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'absent', label: 'Absent' },
  { value: 'not_marked', label: 'Not Marked' },
] as const;

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

  const presentEmps = employees.filter(
    e =>
      e.status === 'present' || e.status === 'late' || e.status === 'half_day'
  );
  const absentEmps = employees.filter(e => e.status === 'absent');
  const lateEmps = employees.filter(e => e.status === 'late');
  const notMarkedEmps = employees.filter(e => e.status === null);

  const toNameList = (list: HrTodayEmployeeAttendance[]) =>
    list.map(e => ({
      name: `${e.firstName} ${e.lastName}`,
      initials: `${e.firstName.charAt(0)}${e.lastName.charAt(0)}`.toUpperCase(),
    }));

  return [
    {
      title: 'Present Today',
      value: present.toLocaleString(),
      delta: '',
      direction: 'up' as const,
      icon: UserCheck,
      iconBg: '#10b981',
      employees: toNameList(presentEmps),
    },
    {
      title: 'Absent Today',
      value: absent.toLocaleString(),
      delta: '',
      direction: 'down' as const,
      icon: AlertTriangle,
      iconBg: '#ef4444',
      employees: toNameList(absentEmps),
    },
    {
      title: 'Late Arrivals',
      value: late.toLocaleString(),
      delta: '',
      direction: 'up' as const,
      icon: Clock3,
      iconBg: '#f59e0b',
      employees: toNameList(lateEmps),
    },
    {
      title: 'Attendance Rate',
      value: `${rate}%`,
      delta: '',
      direction: 'up' as const,
      icon: CircleCheck,
      iconBg: '#8b5cf6',
      employees: toNameList(presentEmps),
    },
    {
      title: 'Not Marked',
      value: notMarked.toLocaleString(),
      delta: '',
      direction: 'down' as const,
      icon: FileWarning,
      iconBg: '#64748b',
      employees: toNameList(notMarkedEmps),
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
    { label: 'Late', value: late, color: '#f59e0b' },
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

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-24 rounded-xl" />

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] rounded-xl" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>

      <Skeleton className="h-48 rounded-xl" />

      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

export function HrDashboardScreen() {
  const [employees, setEmployees] = useState<HrTodayEmployeeAttendance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [workDate, setWorkDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [deleteTarget, setDeleteTarget] =
    useState<HrTodayEmployeeAttendance | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
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
      setError(getErrorMessage(err, 'Failed to load HR dashboard data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleDeleteEmployee = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success(
        `${deleteTarget.firstName} ${deleteTarget.lastName} has been permanently removed`
      );
      setDeleteTarget(null);
      void fetchData();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to delete employee'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      searchQuery.length === 0 ||
      `${emp.firstName} ${emp.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'not_marked' && emp.status === null) ||
      emp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const overviewStats = computeOverviewStats(employees);
  const statusData = computeStatusData(employees);
  const leaveStats = computeLeaveStats(leaves);
  const lateArrivals = computeLateArrivals(employees);
  const summaryItems = computeSummaryItems(employees);
  const avgWorkingPercent = computeAvgWorkingPercent(employees);
  const missingPunchCount = employees.filter(
    e => e.punchInAt !== null && e.punchOutAt === null
  ).length;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting Banner */}
      <HrGreetingBanner />

      <PageHeader
        title="HR Dashboard"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'HR' },
        ]}
      />

      {error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Stats */}
          <OverviewStats items={overviewStats} />

          {/* Late Arrivals + Attendance Status */}
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <LateArrivalsAlerts items={lateArrivals} />
            <AttendanceStatus
              statusData={statusData}
              totalWorkingDays={employees.length}
            />
          </div>

          {/* Celebrations & Events + Upcoming Holidays */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CelebrationsEvents />
            <UpcomingHolidays />
          </div>

          {/* Insights + Summary */}
          <AttendanceFollowupSection
            lateArrivalCount={lateArrivals.length}
            missingPunchCount={missingPunchCount}
            summaryItems={summaryItems}
            avgWorkingHoursPercent={avgWorkingPercent}
          />

          {/* Leave Overview */}
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

          {/* Today's Attendance Table */}
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg">
                  Today&apos;s Attendance
                  {workDate ? (
                    <span className="text-muted-foreground ml-2 text-sm font-normal">
                      {workDate}
                    </span>
                  ) : null}
                </CardTitle>
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link href="/dashboard/attendance">
                    View Details
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredEmployees.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground text-sm">
                    {employees.length === 0
                      ? 'No attendance records for today.'
                      : 'No employees match the current filters.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Punch In</TableHead>
                        <TableHead>Punch Out</TableHead>
                        <TableHead>Total Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-16 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee, idx) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <span
                                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
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
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {employee.firstName} {employee.lastName}
                                </p>
                                <p className="text-muted-foreground truncate text-xs">
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
                          <TableCell className="text-sm font-medium">
                            {formatTotalHours(employee.totalMinutes)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(employee.status)}
                            >
                              {getStatusLabel(employee.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive size-8"
                              onClick={() => setDeleteTarget(employee)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {employees.length > 0 && (
                <p className="text-muted-foreground mt-4 text-xs">
                  Showing {filteredEmployees.length} of {employees.length}{' '}
                  employees
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Employee</DialogTitle>
            <DialogDescription>
              This will permanently delete{' '}
              <span className="font-semibold">
                {deleteTarget?.firstName} {deleteTarget?.lastName}
              </span>{' '}
              and all associated records (attendance, leaves, profile). This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEmployee}
              disabled={isDeleting}
            >
              {isDeleting ? 'Removing...' : 'Remove Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
