import service, { HttpMethod } from './http';

import type {
  CreateLeavePlanAssignmentDto,
  LeavePlanAssignment,
} from '@/types/leave';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getLeavePlanAssignments(params?: {
  userId?: string;
  planId?: string;
}): Promise<ApiResponse<LeavePlanAssignment[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/leave-plan-assignments',
    params: params as Record<string, unknown>,
  });
  return res.data as ApiResponse<LeavePlanAssignment[]>;
}

export async function assignLeavePlan(
  data: CreateLeavePlanAssignmentDto
): Promise<ApiResponse<LeavePlanAssignment>> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/leave-plan-assignments',
    data,
  });
  return res.data as ApiResponse<LeavePlanAssignment>;
}

export async function removeLeavePlanAssignment(
  id: string
): Promise<ApiResponse<null>> {
  const res = await service({
    method: HttpMethod.DELETE,
    url: `/api/v1/leave-plan-assignments/${id}`,
  });
  return res.data as ApiResponse<null>;
}
