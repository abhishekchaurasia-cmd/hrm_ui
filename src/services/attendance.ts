import service, { HttpMethod } from './http';

import type {
  AttendanceHistoryResponse,
  AttendanceSummary,
  TodayAttendance,
} from '@/types/attendance';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getTodayAttendance(): Promise<
  ApiResponse<TodayAttendance>
> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/attendance/me/today',
  });
  return res.data as ApiResponse<TodayAttendance>;
}

export async function punchIn(): Promise<ApiResponse<TodayAttendance>> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/attendance/punch-in',
  });
  return res.data as ApiResponse<TodayAttendance>;
}

export async function punchOut(): Promise<ApiResponse<TodayAttendance>> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/attendance/punch-out',
  });
  return res.data as ApiResponse<TodayAttendance>;
}

export async function getAttendanceHistory(
  month: number,
  year: number,
  page = 1,
  limit = 31
): Promise<ApiResponse<AttendanceHistoryResponse>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/attendance/me/history',
    params: { month, year, page, limit } as Record<string, unknown>,
  });
  return res.data as ApiResponse<AttendanceHistoryResponse>;
}

export async function getAttendanceSummary(
  month: number,
  year: number
): Promise<ApiResponse<AttendanceSummary>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/attendance/me/summary',
    params: { month, year } as Record<string, unknown>,
  });
  return res.data as ApiResponse<AttendanceSummary>;
}

export async function getDetailedAttendanceReport(
  month: number,
  year: number
): Promise<ApiResponse<unknown>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/attendance/me/detailed-report',
    params: { month, year } as Record<string, unknown>,
  });
  return res.data as ApiResponse<unknown>;
}

export async function getHrEmployeeDetailedReport(
  userId: string,
  month: number,
  year: number
): Promise<ApiResponse<unknown>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `/api/v1/hr/attendance/employee/${userId}/detailed-report`,
    params: { month, year } as Record<string, unknown>,
  });
  return res.data as ApiResponse<unknown>;
}

export async function getHrMonthlySummary(
  month: number,
  year: number
): Promise<ApiResponse<unknown>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/hr/attendance/monthly-summary',
    params: { month, year } as Record<string, unknown>,
  });
  return res.data as ApiResponse<unknown>;
}
