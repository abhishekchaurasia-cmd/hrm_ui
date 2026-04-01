import service, { HttpMethod } from './http';

import type {
  CreateRegularizationPayload,
  RegularizationRequest,
  RemainingEntriesInfo,
} from '@/types/regularization';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedRegularizationResponse {
  requests: RegularizationRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

export interface HrPaginatedRegularizationResponse {
  requests: RegularizationRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pendingCount: number;
}

export async function createRegularization(
  payload: CreateRegularizationPayload
): Promise<ApiResponse<RegularizationRequest>> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/regularizations',
    data: payload,
  });
  return res.data as ApiResponse<RegularizationRequest>;
}

export async function getMyRegularizations(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ApiResponse<PaginatedRegularizationResponse>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/regularizations/me',
    params: params as Record<string, unknown>,
  });
  return res.data as ApiResponse<PaginatedRegularizationResponse>;
}

export async function getMyRemainingEntries(): Promise<
  ApiResponse<RemainingEntriesInfo>
> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/regularizations/me/remaining',
  });
  return res.data as ApiResponse<RemainingEntriesInfo>;
}

export async function getHrRegularizations(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<HrPaginatedRegularizationResponse>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/hr/regularizations',
    params: params as Record<string, unknown> | undefined,
  });
  return res.data as ApiResponse<HrPaginatedRegularizationResponse>;
}

export async function approveRegularization(
  id: string,
  reviewNote?: string
): Promise<ApiResponse<RegularizationRequest>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/regularizations/${id}/approve`,
    data: reviewNote ? { reviewNote } : undefined,
  });
  return res.data as ApiResponse<RegularizationRequest>;
}

export async function rejectRegularization(
  id: string,
  reviewNote?: string
): Promise<ApiResponse<RegularizationRequest>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/regularizations/${id}/reject`,
    data: reviewNote ? { reviewNote } : undefined,
  });
  return res.data as ApiResponse<RegularizationRequest>;
}

export async function cancelRegularization(
  id: string
): Promise<ApiResponse<RegularizationRequest>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/regularizations/${id}/cancel`,
  });
  return res.data as ApiResponse<RegularizationRequest>;
}
