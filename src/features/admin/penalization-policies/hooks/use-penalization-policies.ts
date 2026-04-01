import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  assignEmployees,
  createPenalizationPolicy,
  deletePenalizationPolicy,
  getPenalizationPolicies,
  getPenalizationPolicy,
  getPenalizationRecords,
  getPolicyAssignments,
  getPolicyVersions,
  unassignEmployee,
  updatePenalizationPolicy,
  waivePenalty,
} from '@/services/penalization-policies';

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

const POLICIES_KEY = ['penalization-policies'] as const;
const policyKey = (id: string) => ['penalization-policies', id];
const versionsKey = (id: string) => ['penalization-policies', id, 'versions'];
const assignmentsKey = (id: string, page?: number, limit?: number) => [
  'penalization-policies',
  id,
  'assignments',
  page,
  limit,
];
const recordsKey = (params?: Record<string, unknown>) => [
  'penalization-records',
  params,
];

export function usePenalizationPolicies(): UseQueryResult<
  ApiResponse<PenalizationPolicy[]>
> {
  return useQuery({
    queryKey: POLICIES_KEY,
    queryFn: getPenalizationPolicies,
    staleTime: 30_000,
  });
}

export function usePenalizationPolicy(
  id: string | null
): UseQueryResult<ApiResponse<PenalizationPolicy>> {
  return useQuery({
    queryKey: policyKey(id ?? ''),
    queryFn: () => getPenalizationPolicy(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function usePolicyVersions(
  policyId: string | null
): UseQueryResult<ApiResponse<PenalizationPolicyVersion[]>> {
  return useQuery({
    queryKey: versionsKey(policyId ?? ''),
    queryFn: () => getPolicyVersions(policyId!),
    enabled: Boolean(policyId),
    staleTime: 30_000,
  });
}

export function usePolicyAssignments(
  policyId: string | null,
  params?: { page?: number; limit?: number }
): UseQueryResult<
  ApiResponse<{
    items: PenalizationPolicyAssignment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>
> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  return useQuery({
    queryKey: assignmentsKey(policyId ?? '', page, limit),
    queryFn: () => getPolicyAssignments(policyId!, { page, limit }),
    enabled: Boolean(policyId),
    staleTime: 30_000,
  });
}

export function usePenalizationRecords(
  params?: Record<string, unknown>
): UseQueryResult<ApiResponse<PenalizationRecordsResponse>> {
  return useQuery({
    queryKey: recordsKey(params),
    queryFn: () => getPenalizationRecords(params),
    staleTime: 30_000,
  });
}

export function useCreatePenalizationPolicy(): UseMutationResult<
  ApiResponse<PenalizationPolicy>,
  unknown,
  CreatePenalizationPolicyDto
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPenalizationPolicy,
    onSuccess: data => {
      void queryClient.invalidateQueries({ queryKey: POLICIES_KEY });
      toast.success(data.message || 'Policy created successfully');
    },
    onError: () => {
      toast.error('Failed to create policy');
    },
  });
}

export function useUpdatePenalizationPolicy(
  id: string
): UseMutationResult<
  ApiResponse<PenalizationPolicy>,
  unknown,
  UpdatePenalizationPolicyDto
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dto => updatePenalizationPolicy(id, dto),
    onSuccess: data => {
      void queryClient.invalidateQueries({ queryKey: POLICIES_KEY });
      void queryClient.invalidateQueries({ queryKey: policyKey(id) });
      void queryClient.invalidateQueries({ queryKey: versionsKey(id) });
      toast.success(data.message || 'Policy updated successfully');
    },
    onError: () => {
      toast.error('Failed to update policy');
    },
  });
}

export function useDeletePenalizationPolicy(): UseMutationResult<
  ApiResponse<null>,
  unknown,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePenalizationPolicy,
    onSuccess: data => {
      void queryClient.invalidateQueries({ queryKey: POLICIES_KEY });
      toast.success(data.message || 'Policy deactivated');
    },
    onError: () => {
      toast.error('Failed to deactivate policy');
    },
  });
}

export function useAssignEmployees(
  policyId: string
): UseMutationResult<
  ApiResponse<PenalizationPolicyAssignment[]>,
  unknown,
  AssignPenalizationPolicyDto
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dto => assignEmployees(policyId, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['penalization-policies', policyId, 'assignments'],
      });
      toast.success('Employees assigned');
    },
    onError: () => {
      toast.error('Failed to assign employees');
    },
  });
}

export function useUnassignEmployee(
  policyId: string
): UseMutationResult<ApiResponse<null>, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignmentId => unassignEmployee(policyId, assignmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['penalization-policies', policyId, 'assignments'],
      });
      toast.success('Employee unassigned');
    },
    onError: () => {
      toast.error('Failed to unassign employee');
    },
  });
}

export function useWaivePenalty(): UseMutationResult<
  ApiResponse<PenalizationRecord>,
  unknown,
  { recordId: string; remarks?: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, remarks }) => waivePenalty(recordId, remarks),
    onSuccess: data => {
      void queryClient.invalidateQueries({
        queryKey: ['penalization-records'],
      });
      toast.success(data.message || 'Penalty waived');
    },
    onError: () => {
      toast.error('Failed to waive penalty');
    },
  });
}
