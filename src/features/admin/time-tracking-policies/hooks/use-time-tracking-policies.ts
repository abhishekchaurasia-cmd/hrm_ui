import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  assignEmployeesToTimeTrackingPolicy,
  createTimeTrackingPolicy,
  deleteTimeTrackingPolicy,
  getTimeTrackingPolicies,
  getTimeTrackingPolicy,
  getTimeTrackingPolicyAssignments,
  unassignEmployeeFromTimeTrackingPolicy,
  updateTimeTrackingPolicy,
} from '@/services/time-tracking-policies';

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

const POLICIES_KEY = ['time-tracking-policies'] as const;
const policyKey = (id: string) => ['time-tracking-policies', id];
const assignmentsKey = (id: string, page?: number, limit?: number) => [
  'time-tracking-policies',
  id,
  'assignments',
  page,
  limit,
];

export function useTimeTrackingPolicies(): UseQueryResult<
  ApiResponse<TimeTrackingPolicy[]>
> {
  return useQuery({
    queryKey: POLICIES_KEY,
    queryFn: getTimeTrackingPolicies,
    staleTime: 30_000,
  });
}

export function useTimeTrackingPolicy(
  id: string | null
): UseQueryResult<ApiResponse<TimeTrackingPolicy>> {
  return useQuery({
    queryKey: policyKey(id ?? ''),
    queryFn: () => getTimeTrackingPolicy(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useTimeTrackingPolicyAssignments(
  policyId: string | null,
  params?: { page?: number; limit?: number }
): UseQueryResult<
  ApiResponse<{
    items: TimeTrackingPolicyAssignment[];
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
    queryFn: () => getTimeTrackingPolicyAssignments(policyId!, { page, limit }),
    enabled: Boolean(policyId),
    staleTime: 30_000,
  });
}

export function useCreateTimeTrackingPolicy(): UseMutationResult<
  ApiResponse<TimeTrackingPolicy>,
  unknown,
  CreateTimeTrackingPolicyDto
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTimeTrackingPolicy,
    onSuccess: data => {
      void queryClient.invalidateQueries({ queryKey: POLICIES_KEY });
      toast.success(data.message || 'Policy created successfully');
    },
    onError: () => {
      toast.error('Failed to create policy');
    },
  });
}

export function useUpdateTimeTrackingPolicy(
  id: string
): UseMutationResult<
  ApiResponse<TimeTrackingPolicy>,
  unknown,
  UpdateTimeTrackingPolicyDto
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dto => updateTimeTrackingPolicy(id, dto),
    onSuccess: data => {
      void queryClient.invalidateQueries({ queryKey: POLICIES_KEY });
      void queryClient.invalidateQueries({ queryKey: policyKey(id) });
      toast.success(data.message || 'Policy updated successfully');
    },
    onError: () => {
      toast.error('Failed to update policy');
    },
  });
}

export function useDeleteTimeTrackingPolicy(): UseMutationResult<
  ApiResponse<null>,
  unknown,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTimeTrackingPolicy,
    onSuccess: data => {
      void queryClient.invalidateQueries({ queryKey: POLICIES_KEY });
      toast.success(data.message || 'Policy deactivated');
    },
    onError: () => {
      toast.error('Failed to deactivate policy');
    },
  });
}

export function useAssignEmployeesToPolicy(
  policyId: string
): UseMutationResult<
  ApiResponse<TimeTrackingPolicyAssignment[]>,
  unknown,
  AssignTimeTrackingPolicyDto
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dto => assignEmployeesToTimeTrackingPolicy(policyId, dto),
    onSuccess: data => {
      void queryClient.invalidateQueries({
        queryKey: assignmentsKey(policyId),
      });
      void queryClient.invalidateQueries({ queryKey: POLICIES_KEY });
      toast.success(data.message || 'Employees assigned');
    },
    onError: () => {
      toast.error('Failed to assign employees');
    },
  });
}

export function useUnassignEmployeeFromPolicy(
  policyId: string
): UseMutationResult<ApiResponse<null>, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignmentId =>
      unassignEmployeeFromTimeTrackingPolicy(policyId, assignmentId),
    onSuccess: data => {
      void queryClient.invalidateQueries({
        queryKey: assignmentsKey(policyId),
      });
      void queryClient.invalidateQueries({ queryKey: POLICIES_KEY });
      toast.success(data.message || 'Employee unassigned');
    },
    onError: () => {
      toast.error('Failed to unassign employee');
    },
  });
}
