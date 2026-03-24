import service, { HttpMethod } from './http';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PayrollReport {
  id: string;
  month: number;
  year: number;
  generatedAt: string;
  generatedBy: string | null;
  status: 'draft' | 'finalized';
  totalEmployees: number;
  totalWorkingDays: number;
  details?: PayrollReportDetail[];
}

export interface PayrollReportDetail {
  id: string;
  reportId: string;
  userId: string;
  employeeName: string | null;
  employeeNumber: string | null;
  department: string | null;
  totalWorkingDays: number;
  totalPresentDays: number;
  totalLateDays: number;
  totalAbsentDays: number;
  totalHalfDays: number;
  totalPaidLeaveDays: number;
  totalUnpaidLeaveDays: number;
  totalWeeklyOffDays: number;
  totalHolidayDays: number;
  totalWorkedMinutes: number;
  totalEffectiveMinutes: number;
  totalOvertimeMinutes: number;
  totalPenaltyDeductionDays: number;
  lopDays: number;
  netPayableDays: number;
  grossMonthlySalary: number;
  deductions: number;
  netPayable: number;
  dailyDetails?: PayrollDailyDetail[];
  user?: { firstName: string; lastName: string; email: string };
}

export interface PayrollDailyDetail {
  id: string;
  workDate: string;
  dayType: 'working' | 'weekly_off' | 'holiday' | 'leave';
  punchInAt: string | null;
  punchOutAt: string | null;
  totalMinutes: number | null;
  effectiveMinutes: number | null;
  lateByMinutes: number | null;
  earlyLeaveMinutes: number | null;
  overtimeMinutes: number | null;
  status: string | null;
  shiftName: string | null;
  isAutoLogout: boolean;
  penaltyApplied: boolean;
  leaveType: string | null;
  remarks: string | null;
}

export async function generatePayrollReport(
  month: number,
  year: number
): Promise<ApiResponse<PayrollReport>> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/payroll-reports/generate',
    data: { month, year },
  });
  return res.data as ApiResponse<PayrollReport>;
}

export async function getPayrollReports(): Promise<
  ApiResponse<PayrollReport[]>
> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/payroll-reports',
  });
  return res.data as ApiResponse<PayrollReport[]>;
}

export async function getPayrollReport(
  id: string
): Promise<ApiResponse<PayrollReport>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `/api/v1/payroll-reports/${id}`,
  });
  return res.data as ApiResponse<PayrollReport>;
}

export async function getPayrollEmployeeDetail(
  reportId: string,
  userId: string
): Promise<ApiResponse<PayrollReportDetail>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `/api/v1/payroll-reports/${reportId}/employees/${userId}`,
  });
  return res.data as ApiResponse<PayrollReportDetail>;
}

export async function finalizePayrollReport(
  id: string
): Promise<ApiResponse<PayrollReport>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/payroll-reports/${id}/finalize`,
  });
  return res.data as ApiResponse<PayrollReport>;
}

export function getPayrollExportCsvUrl(id: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  return `${base}/api/v1/payroll-reports/${id}/export/csv`;
}
