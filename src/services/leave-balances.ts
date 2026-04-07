import service, { HttpMethod } from './http';

import type {
  AdjustLeaveBalanceDto,
  LeaveBalance,
  LeaveBalanceOverviewData,
  LeaveTransaction,
} from '@/types/leave';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function initializeBalances(
  planId: string
): Promise<ApiResponse<{ created: number; skipped: number }>> {
  const res = await service({
    method: HttpMethod.POST,
    url: `/api/v1/leave-balances/initialize`,
    params: { planId },
  });
  return res.data as ApiResponse<{ created: number; skipped: number }>;
}

export async function getLeaveBalances(params?: {
  userId?: string;
  planId?: string;
  year?: number;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<LeaveBalance[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/leave-balances',
    params: params as Record<string, unknown>,
  });
  return res.data as ApiResponse<LeaveBalance[]>;
}

export async function getLeaveBalanceOverview(params?: {
  year?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<LeaveBalanceOverviewData>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/leave-balances/overview',
    params: params as Record<string, unknown>,
  });
  return res.data as ApiResponse<LeaveBalanceOverviewData>;
}

export async function getEmployeeBalances(
  userId: string,
  year?: number
): Promise<ApiResponse<LeaveBalance[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `/api/v1/leave-balances/employee/${userId}`,
    params: year ? ({ year } as Record<string, unknown>) : undefined,
  });
  return res.data as ApiResponse<LeaveBalance[]>;
}

export async function adjustBalance(
  data: AdjustLeaveBalanceDto
): Promise<ApiResponse<LeaveBalance>> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/leave-balances/adjust',
    data,
  });
  return res.data as ApiResponse<LeaveBalance>;
}

export async function getTransactions(params?: {
  userId?: string;
  year?: number;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<LeaveTransaction[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/leave-balances/transactions',
    params: params as Record<string, unknown>,
  });
  return res.data as ApiResponse<LeaveTransaction[]>;
}
