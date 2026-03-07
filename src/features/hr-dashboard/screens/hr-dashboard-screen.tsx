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
  AttendanceStatus,
  OverviewStats,
} from '@/components/attendance-dashboard';
import {
  LeaveSummary,
  PageHeader,
  ProfileCard,
} from '@/components/employee-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import service, { HttpMethod } from '@/services/http';

import type { AttendanceStatusItem } from '@/components/attendance-dashboard/attendance-status';
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
  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  const totalEmployees = employees.length;
  const presentCount = employees.filter(
    e =>
      e.status === 'present' || e.status === 'late' || e.status === 'half_day'
  ).length;
  const attendanceRate =
    totalEmployees > 0
      ? ((presentCount / totalEmployees) * 100).toFixed(1)
      : '0';

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

          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <LeaveSummary
              title="Leave Actions"
              year={new Date().getFullYear().toString()}
              stats={leaveStats}
            />
            <ProfileCard
              name="HR Operations"
              role="Team Snapshot"
              avatar="H"
              details={[
                {
                  label: 'Total Employees',
                  value: totalEmployees.toLocaleString(),
                },
                {
                  label: 'Present Today',
                  value: presentCount.toLocaleString(),
                },
                { label: 'Pending Approvals', value: String(pendingCount) },
                { label: 'Attendance Rate', value: `${attendanceRate}%` },
              ]}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <AttendanceStatus
              statusData={statusData}
              totalWorkingDays={totalEmployees}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Today&apos;s Attendance {workDate ? `(${workDate})` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b text-left">
                      <th className="px-2 py-2">Employee</th>
                      <th className="px-2 py-2">Punch In</th>
                      <th className="px-2 py-2">Punch Out</th>
                      <th className="px-2 py-2">Total Hours</th>
                      <th className="px-2 py-2">Status</th>
                      <th className="px-2 py-2">Shift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(employee => (
                      <tr key={employee.id} className="border-b">
                        <td className="px-2 py-2">
                          <div className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {employee.email}
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          {formatTime(employee.punchInAt)}
                        </td>
                        <td className="px-2 py-2">
                          {formatTime(employee.punchOutAt)}
                        </td>
                        <td className="px-2 py-2">
                          {formatTotalHours(employee.totalMinutes)}
                        </td>
                        <td className="px-2 py-2 capitalize">
                          {employee.status ?? 'not marked'}
                        </td>
                        <td className="text-muted-foreground px-2 py-2 text-xs">
                          {employee.shiftId
                            ? employee.shiftId.slice(0, 8) + '...'
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
