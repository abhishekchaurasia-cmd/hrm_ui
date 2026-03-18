import service, { HttpMethod } from './http';

import type {
  AssignTimeTrackingPolicyDto,
  CreateTimeTrackingPolicyDto,
  TimeTrackingPolicy,
  TimeTrackingPolicyAssignment,
  UpdateTimeTrackingPolicyDto,
} from '@/types/time-tracking-policy';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE_URL = '/api/v1/time-tracking-policies';

export async function getTimeTrackingPolicies(): Promise<
  ApiResponse<TimeTrackingPolicy[]>
> {
  const res = await service({ method: HttpMethod.GET, url: BASE_URL });
  return res.data as ApiResponse<TimeTrackingPolicy[]>;
}

export async function getTimeTrackingPolicy(
  id: string
): Promise<ApiResponse<TimeTrackingPolicy>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `${BASE_URL}/${id}`,
  });
  return res.data as ApiResponse<TimeTrackingPolicy>;
}

export async function createTimeTrackingPolicy(
  data: CreateTimeTrackingPolicyDto
): Promise<ApiResponse<TimeTrackingPolicy>> {
  const res = await service({
    method: HttpMethod.POST,
    url: BASE_URL,
    data,
  });
  return res.data as ApiResponse<TimeTrackingPolicy>;
}

export async function updateTimeTrackingPolicy(
  id: string,
  data: UpdateTimeTrackingPolicyDto
): Promise<ApiResponse<TimeTrackingPolicy>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `${BASE_URL}/${id}`,
    data,
  });
  return res.data as ApiResponse<TimeTrackingPolicy>;
}

export async function deleteTimeTrackingPolicy(
  id: string
): Promise<ApiResponse<null>> {
  const res = await service({
    method: HttpMethod.DELETE,
    url: `${BASE_URL}/${id}`,
  });
  return res.data as ApiResponse<null>;
}

export async function getTimeTrackingPolicyAssignments(
  policyId: string
): Promise<ApiResponse<TimeTrackingPolicyAssignment[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `${BASE_URL}/${policyId}/assignments`,
  });
  return res.data as ApiResponse<TimeTrackingPolicyAssignment[]>;
}

export async function assignEmployeesToTimeTrackingPolicy(
  policyId: string,
  data: AssignTimeTrackingPolicyDto
): Promise<ApiResponse<TimeTrackingPolicyAssignment[]>> {
  const res = await service({
    method: HttpMethod.POST,
    url: `${BASE_URL}/${policyId}/assignments`,
    data,
  });
  return res.data as ApiResponse<TimeTrackingPolicyAssignment[]>;
}

export async function unassignEmployeeFromTimeTrackingPolicy(
  policyId: string,
  assignmentId: string
): Promise<ApiResponse<null>> {
  const res = await service({
    method: HttpMethod.DELETE,
    url: `${BASE_URL}/${policyId}/assignments/${assignmentId}`,
  });
  return res.data as ApiResponse<null>;
}
