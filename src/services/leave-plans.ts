import service, { HttpMethod } from './http';

import type {
  CreateLeavePlanDto,
  CreateLeaveTypeConfigDto,
  LeavePlan,
  LeaveTypeConfig,
  YearEndProcessingDto,
} from '@/types/leave';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getLeavePlans(): Promise<ApiResponse<LeavePlan[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/leave-plans',
  });
  return res.data as ApiResponse<LeavePlan[]>;
}

export async function getLeavePlan(
  id: string
): Promise<ApiResponse<LeavePlan>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `/api/v1/leave-plans/${id}`,
  });
  return res.data as ApiResponse<LeavePlan>;
}

export async function createLeavePlan(
  data: CreateLeavePlanDto
): Promise<ApiResponse<LeavePlan>> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/leave-plans',
    data,
  });
  return res.data as ApiResponse<LeavePlan>;
}

export async function updateLeavePlan(
  id: string,
  data: Partial<CreateLeavePlanDto>
): Promise<ApiResponse<LeavePlan>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/leave-plans/${id}`,
    data,
  });
  return res.data as ApiResponse<LeavePlan>;
}

export async function deactivateLeavePlan(
  id: string
): Promise<ApiResponse<null>> {
  const res = await service({
    method: HttpMethod.DELETE,
    url: `/api/v1/leave-plans/${id}`,
  });
  return res.data as ApiResponse<null>;
}

export async function addLeaveType(
  planId: string,
  data: CreateLeaveTypeConfigDto
): Promise<ApiResponse<LeaveTypeConfig>> {
  const res = await service({
    method: HttpMethod.POST,
    url: `/api/v1/leave-plans/${planId}/leave-types`,
    data,
  });
  return res.data as ApiResponse<LeaveTypeConfig>;
}

export async function updateLeaveType(
  planId: string,
  typeId: string,
  data: Partial<CreateLeaveTypeConfigDto>
): Promise<ApiResponse<LeaveTypeConfig>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/leave-plans/${planId}/leave-types/${typeId}`,
    data,
  });
  return res.data as ApiResponse<LeaveTypeConfig>;
}

export async function removeLeaveType(
  planId: string,
  typeId: string
): Promise<ApiResponse<null>> {
  const res = await service({
    method: HttpMethod.DELETE,
    url: `/api/v1/leave-plans/${planId}/leave-types/${typeId}`,
  });
  return res.data as ApiResponse<null>;
}

export async function yearEndProcessing(
  planId: string,
  data: YearEndProcessingDto
): Promise<ApiResponse<{ processed: number; newBalancesCreated: number }>> {
  const res = await service({
    method: HttpMethod.POST,
    url: `/api/v1/leave-plans/${planId}/year-end-processing`,
    data,
  });
  return res.data as ApiResponse<{
    processed: number;
    newBalancesCreated: number;
  }>;
}
