import service, { HttpMethod } from './http';

import type {
  AssignPenalizationPolicyDto,
  CreatePenalizationPolicyDto,
  PenalizationPolicy,
  PenalizationPolicyAssignment,
  PenalizationPolicyVersion,
  PenalizationRecord,
  PenalizationRecordsResponse,
  UpdatePenalizationPolicyDto,
} from '@/types/penalization';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE_URL = '/api/v1/penalization-policies';
const RECORDS_URL = '/api/v1/penalization-records';

export async function getPenalizationPolicies(): Promise<
  ApiResponse<PenalizationPolicy[]>
> {
  const res = await service({ method: HttpMethod.GET, url: BASE_URL });
  return res.data as ApiResponse<PenalizationPolicy[]>;
}

export async function getPenalizationPolicy(
  id: string
): Promise<ApiResponse<PenalizationPolicy>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `${BASE_URL}/${id}`,
  });
  return res.data as ApiResponse<PenalizationPolicy>;
}

export async function createPenalizationPolicy(
  data: CreatePenalizationPolicyDto
): Promise<ApiResponse<PenalizationPolicy>> {
  const res = await service({
    method: HttpMethod.POST,
    url: BASE_URL,
    data,
  });
  return res.data as ApiResponse<PenalizationPolicy>;
}

export async function updatePenalizationPolicy(
  id: string,
  data: UpdatePenalizationPolicyDto
): Promise<ApiResponse<PenalizationPolicy>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `${BASE_URL}/${id}`,
    data,
  });
  return res.data as ApiResponse<PenalizationPolicy>;
}

export async function deletePenalizationPolicy(
  id: string
): Promise<ApiResponse<null>> {
  const res = await service({
    method: HttpMethod.DELETE,
    url: `${BASE_URL}/${id}`,
  });
  return res.data as ApiResponse<null>;
}

export async function getPolicyVersions(
  policyId: string
): Promise<ApiResponse<PenalizationPolicyVersion[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `${BASE_URL}/${policyId}/versions`,
  });
  return res.data as ApiResponse<PenalizationPolicyVersion[]>;
}

export async function getPolicyAssignments(
  policyId: string
): Promise<ApiResponse<PenalizationPolicyAssignment[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `${BASE_URL}/${policyId}/assignments`,
  });
  return res.data as ApiResponse<PenalizationPolicyAssignment[]>;
}

export async function assignEmployees(
  policyId: string,
  data: AssignPenalizationPolicyDto
): Promise<ApiResponse<PenalizationPolicyAssignment[]>> {
  const res = await service({
    method: HttpMethod.POST,
    url: `${BASE_URL}/${policyId}/assignments`,
    data,
  });
  return res.data as ApiResponse<PenalizationPolicyAssignment[]>;
}

export async function unassignEmployee(
  policyId: string,
  assignmentId: string
): Promise<ApiResponse<null>> {
  const res = await service({
    method: HttpMethod.DELETE,
    url: `${BASE_URL}/${policyId}/assignments/${assignmentId}`,
  });
  return res.data as ApiResponse<null>;
}

export async function getPenalizationRecords(
  params?: Record<string, unknown>
): Promise<ApiResponse<PenalizationRecordsResponse>> {
  const res = await service({
    method: HttpMethod.GET,
    url: RECORDS_URL,
    params,
  });
  return res.data as ApiResponse<PenalizationRecordsResponse>;
}

export async function waivePenalty(
  recordId: string,
  remarks?: string
): Promise<ApiResponse<PenalizationRecord>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `${RECORDS_URL}/${recordId}/waive`,
    data: { remarks },
  });
  return res.data as ApiResponse<PenalizationRecord>;
}
