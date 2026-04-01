import service, { HttpMethod } from './http';

import type { CreateShiftAssignmentDto, ShiftAssignment } from '@/types/shift';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getShiftAssignments(params?: {
  userId?: string;
  shiftId?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<ShiftAssignment[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/shift-assignments',
    params: params as Record<string, unknown>,
  });
  return res.data as ApiResponse<ShiftAssignment[]>;
}

export async function getEmployeeShift(
  userId: string
): Promise<ApiResponse<ShiftAssignment>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `/api/v1/shift-assignments/employee/${userId}`,
  });
  return res.data as ApiResponse<ShiftAssignment>;
}

export async function assignShift(
  data: CreateShiftAssignmentDto
): Promise<ApiResponse<ShiftAssignment>> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/shift-assignments',
    data,
  });
  return res.data as ApiResponse<ShiftAssignment>;
}

export async function updateShiftAssignment(
  id: string,
  data: Partial<CreateShiftAssignmentDto>
): Promise<ApiResponse<ShiftAssignment>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/shift-assignments/${id}`,
    data,
  });
  return res.data as ApiResponse<ShiftAssignment>;
}

export async function removeShiftAssignment(
  id: string
): Promise<ApiResponse<null>> {
  const res = await service({
    method: HttpMethod.DELETE,
    url: `/api/v1/shift-assignments/${id}`,
  });
  return res.data as ApiResponse<null>;
}
