'use client';

import { ArrowLeft, Download, Eye, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

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
import {
  getPayrollReport,
  getPayrollEmployeeDetail,
  finalizePayrollReport,
  getPayrollExportCsvUrl,
  type PayrollReport,
  type PayrollReportDetail,
} from '@/services/payroll-reports';

interface Props {
  reportId: string;
}

export default function PayrollReportDetailScreen({ reportId }: Props) {
  const router = useRouter();
  const [report, setReport] = useState<PayrollReport | null>(null);
  const [selectedDetail, setSelectedDetail] =
    useState<PayrollReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPayrollReport(reportId);
      setReport(res.data);
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const handleViewEmployee = async (userId: string) => {
    try {
      setDetailLoading(true);
      const res = await getPayrollEmployeeDetail(reportId, userId);
      setSelectedDetail(res.data);
    } catch {
      toast.error('Failed to load employee detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleFinalize = async () => {
    try {
      await finalizePayrollReport(reportId);
      toast.success('Report finalized');
      await fetchReport();
    } catch {
      toast.error('Failed to finalize report');
    }
  };

  const monthNames = [
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

  const formatMinutesToHours = (minutes: number | null) => {
    if (minutes === null) return '-';
    return `${(minutes / 60).toFixed(1)}h`;
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <p className="text-muted-foreground py-12 text-center">
        Loading report...
      </p>
    );
  }

  if (!report) {
    return (
      <p className="text-muted-foreground py-12 text-center">
        Report not found
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {monthNames[report.month - 1]} {report.year} Payroll Report
            </h1>
            <p className="text-muted-foreground mt-1">
              {report.totalEmployees} employees &middot;{' '}
              {report.totalWorkingDays} working days
            </p>
          </div>
          <Badge
            variant={report.status === 'finalized' ? 'default' : 'secondary'}
          >
            {report.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href={getPayrollExportCsvUrl(report.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="mr-1 h-4 w-4" />
              Export CSV
            </a>
          </Button>
          {report.status === 'draft' && (
            <Button size="sm" onClick={handleFinalize}>
              <Lock className="mr-1 h-4 w-4" />
              Finalize
            </Button>
          )}
        </div>
      </div>

      {selectedDetail ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedDetail.employeeName} ({selectedDetail.employeeNumber})
                &mdash; Daily Breakdown
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDetail(null)}
              >
                Back to List
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                label="Present"
                value={selectedDetail.totalPresentDays}
              />
              <StatCard label="Late" value={selectedDetail.totalLateDays} />
              <StatCard label="Absent" value={selectedDetail.totalAbsentDays} />
              <StatCard label="Half Day" value={selectedDetail.totalHalfDays} />
              <StatCard
                label="Paid Leave"
                value={selectedDetail.totalPaidLeaveDays}
              />
              <StatCard
                label="Unpaid Leave"
                value={selectedDetail.totalUnpaidLeaveDays}
              />
              <StatCard label="LOP Days" value={selectedDetail.lopDays} />
              <StatCard
                label="Net Payable Days"
                value={selectedDetail.netPayableDays}
              />
              <StatCard
                label="Net Payable"
                value={`₹${Number(selectedDetail.netPayable).toLocaleString()}`}
              />
              <StatCard
                label="Deductions"
                value={`₹${Number(selectedDetail.deductions).toLocaleString()}`}
              />
            </div>

            {detailLoading ? (
              <p className="text-muted-foreground py-4 text-center">
                Loading daily details...
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Day Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Punch In</TableHead>
                      <TableHead>Punch Out</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Effective</TableHead>
                      <TableHead>Late By</TableHead>
                      <TableHead>OT</TableHead>
                      <TableHead>Penalty</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedDetail.dailyDetails ?? []).map(day => (
                      <TableRow
                        key={day.workDate}
                        className={
                          day.dayType !== 'working'
                            ? 'bg-muted/30'
                            : day.status === 'absent'
                              ? 'bg-red-50 dark:bg-red-950/20'
                              : ''
                        }
                      >
                        <TableCell className="font-mono text-sm">
                          {day.workDate}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {day.dayType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {day.status ? (
                            <Badge
                              variant={
                                day.status === 'present'
                                  ? 'default'
                                  : day.status === 'late'
                                    ? 'secondary'
                                    : day.status === 'absent'
                                      ? 'destructive'
                                      : 'outline'
                              }
                              className="text-xs"
                            >
                              {day.status}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{formatTime(day.punchInAt)}</TableCell>
                        <TableCell>
                          {formatTime(day.punchOutAt)}
                          {day.isAutoLogout && (
                            <span className="ml-1 text-xs text-blue-500">
                              (auto)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatMinutesToHours(day.totalMinutes)}
                        </TableCell>
                        <TableCell>
                          {formatMinutesToHours(day.effectiveMinutes)}
                        </TableCell>
                        <TableCell>
                          {day.lateByMinutes !== null && day.lateByMinutes > 0
                            ? `${day.lateByMinutes}m`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {day.overtimeMinutes !== null &&
                          day.overtimeMinutes > 0
                            ? `${day.overtimeMinutes}m`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {day.penaltyApplied ? (
                            <Badge variant="destructive" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {day.remarks ?? '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Employee Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Half Day</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>LOP</TableHead>
                    <TableHead>Net Days</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(report.details ?? []).map(detail => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        <div className="font-medium">{detail.employeeName}</div>
                        <div className="text-muted-foreground text-xs">
                          {detail.employeeNumber}
                        </div>
                      </TableCell>
                      <TableCell>{detail.department ?? '-'}</TableCell>
                      <TableCell>{detail.totalPresentDays}</TableCell>
                      <TableCell>{detail.totalLateDays}</TableCell>
                      <TableCell>{detail.totalAbsentDays}</TableCell>
                      <TableCell>{detail.totalHalfDays}</TableCell>
                      <TableCell>
                        {(detail.totalWorkedMinutes / 60).toFixed(1)}h
                      </TableCell>
                      <TableCell>{detail.lopDays}</TableCell>
                      <TableCell>{detail.netPayableDays}</TableCell>
                      <TableCell className="font-medium">
                        ₹{Number(detail.netPayable).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEmployee(detail.userId)}
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          Daily
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
