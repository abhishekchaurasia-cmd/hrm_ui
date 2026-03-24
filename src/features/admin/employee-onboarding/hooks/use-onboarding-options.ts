import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { getSalaryComponents } from '@/features/admin/employee-onboarding/api/onboarding';
import { getRelationOptions } from '@/features/admin/employee-profile/api/employee-profile';

import type {
  OptionItem,
  SalaryComponent,
} from '@/features/admin/employee-onboarding/types/onboarding';

function useOptions(
  queryKey: string,
  endpoint: string
): UseQueryResult<OptionItem[]> {
  return useQuery({
    queryKey: ['onboarding-options', queryKey],
    queryFn: () => getRelationOptions(endpoint),
  });
}

export function useShiftsOptions(): UseQueryResult<OptionItem[]> {
  return useOptions('shifts', '/api/v1/shifts/options');
}

export function useLeavePlansOptions(): UseQueryResult<OptionItem[]> {
  return useOptions('leave-plans', '/api/v1/leave-plans/options');
}

export function useSalaryComponentsList(): UseQueryResult<SalaryComponent[]> {
  return useQuery({
    queryKey: ['onboarding-options', 'salary-components'],
    queryFn: getSalaryComponents,
  });
}
