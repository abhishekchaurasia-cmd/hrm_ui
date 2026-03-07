import service, { HttpMethod } from './http';

import type {
  CreateShiftDto,
  SetWeeklyOffsDto,
  Shift,
  ShiftWeeklyOff,
} from '@/types/shift';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getShifts(): Promise<ApiResponse<Shift[]>> {
  const res = await service({ method: HttpMethod.GET, url: '/api/v1/shifts' });
  return res.data as ApiResponse<Shift[]>;
}

export async function getShift(id: string): Promise<ApiResponse<Shift>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `/api/v1/shifts/${id}`,
  });
  return res.data as ApiResponse<Shift>;
}

export async function createShift(
  data: CreateShiftDto
): Promise<ApiResponse<Shift>> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/shifts',
    data,
  });
  return res.data as ApiResponse<Shift>;
}

export async function updateShift(
  id: string,
  data: Partial<CreateShiftDto>
): Promise<ApiResponse<Shift>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/shifts/${id}`,
    data,
  });
  return res.data as ApiResponse<Shift>;
}

export async function deactivateShift(id: string): Promise<ApiResponse<null>> {
  const res = await service({
    method: HttpMethod.DELETE,
    url: `/api/v1/shifts/${id}`,
  });
  return res.data as ApiResponse<null>;
}

export async function setWeeklyOffs(
  shiftId: string,
  data: SetWeeklyOffsDto
): Promise<ApiResponse<ShiftWeeklyOff[]>> {
  const res = await service({
    method: HttpMethod.PUT,
    url: `/api/v1/shifts/${shiftId}/weekly-offs`,
    data,
  });
  return res.data as ApiResponse<ShiftWeeklyOff[]>;
}
