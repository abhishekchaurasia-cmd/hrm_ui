import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getMyEmployeeProfile,
  getEmployeeProfile,
  updateMyEmployeeProfile,
  updateEmployeeProfile,
} from '@/features/admin/employee-profile/api/employee-profile';

import type { EmployeeProfileUpdatePayload } from '@/features/admin/employee-profile/schema/employee-profile.schema';
import type {
  ApiResponse,
  EmployeeProfile,
} from '@/features/admin/employee-profile/types/employee-profile';

const employeeProfileKey = (userId: string) => ['employee-profile', userId];
const myEmployeeProfileKey = ['employee-profile', 'me'] as const;

export function useEmployeeProfile(
  userId: string
): UseQueryResult<ApiResponse<EmployeeProfile | null>> {
  return useQuery({
    queryKey: employeeProfileKey(userId),
    queryFn: () =>
      userId === 'me' ? getMyEmployeeProfile() : getEmployeeProfile(userId),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function useUpdateEmployeeProfile(
  userId: string
): UseMutationResult<
  ApiResponse<EmployeeProfile>,
  unknown,
  EmployeeProfileUpdatePayload
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payload =>
      userId === 'me'
        ? updateMyEmployeeProfile(payload)
        : updateEmployeeProfile(userId, payload),
    onSuccess: data => {
      if (userId === 'me') {
        void queryClient.invalidateQueries({ queryKey: myEmployeeProfileKey });
        toast.success(data.message || 'Profile updated successfully');
        return;
      }

      queryClient.setQueryData(employeeProfileKey(userId), {
        success: true,
        message: data.message,
        data: data.data,
      });
    },
  });
}

export function useMyEmployeeProfile(): UseQueryResult<
  ApiResponse<EmployeeProfile | null>
> {
  return useQuery({
    queryKey: myEmployeeProfileKey,
    queryFn: getMyEmployeeProfile,
    staleTime: 30_000,
  });
}

export function useUpdateMyEmployeeProfile(): UseMutationResult<
  ApiResponse<EmployeeProfile>,
  unknown,
  EmployeeProfileUpdatePayload
> {
  return useUpdateEmployeeProfile('me');
}
