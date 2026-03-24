import service, { HttpMethod } from './http';

import type {
  ApplyLeavePayload,
  AvailableLeaveTypesResponse,
  LeaveBalance,
  LeaveRequest,
} from '@/types/leave';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getMyLeaveBalances(
  year?: number
): Promise<ApiResponse<LeaveBalance[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/leave-balances/me',
    params: year ? ({ year } as Record<string, unknown>) : undefined,
  });
  return res.data as ApiResponse<LeaveBalance[]>;
}

export async function getAvailableLeaveTypes(): Promise<
  ApiResponse<AvailableLeaveTypesResponse>
> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/leaves/me/available-types',
  });
  return res.data as ApiResponse<AvailableLeaveTypesResponse>;
}

export async function applyLeave(
  payload: ApplyLeavePayload
): Promise<ApiResponse<LeaveRequest>> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/leaves',
    data: payload,
  });
  return res.data as ApiResponse<LeaveRequest>;
}

export interface PaginatedLeaveResponse {
  leaves: LeaveRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

export async function getMyLeaveRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ApiResponse<PaginatedLeaveResponse>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/leaves/me',
    params: params as Record<string, unknown>,
  });
  return res.data as ApiResponse<PaginatedLeaveResponse>;
}

export async function cancelLeaveRequest(
  id: string
): Promise<ApiResponse<{ id: string; status: string }>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/leaves/${id}/cancel`,
  });
  return res.data as ApiResponse<{ id: string; status: string }>;
}

// ── HR Leave Management ──

export async function getHrLeaves(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ leaves: LeaveRequest[]; total: number }>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/hr/leaves',
    params: params as Record<string, unknown> | undefined,
  });
  return res.data as ApiResponse<{ leaves: LeaveRequest[]; total: number }>;
}

export async function approveLeaveRequest(
  id: string,
  reviewNote?: string
): Promise<ApiResponse<LeaveRequest>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/leaves/${id}/approve`,
    data: reviewNote ? { reviewNote } : undefined,
  });
  return res.data as ApiResponse<LeaveRequest>;
}

export async function rejectLeaveRequest(
  id: string,
  reviewNote?: string
): Promise<ApiResponse<LeaveRequest>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/leaves/${id}/reject`,
    data: reviewNote ? { reviewNote } : undefined,
  });
  return res.data as ApiResponse<LeaveRequest>;
}
