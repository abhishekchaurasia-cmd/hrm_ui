import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { getRelationOptions } from '@/features/admin/employee-profile/api/employee-profile';

import type { OptionItem } from '@/features/admin/employee-profile/types/employee-profile';

function useOptions(
  queryKey: string,
  endpoint: string
): UseQueryResult<OptionItem[]> {
  return useQuery({
    queryKey: ['employee-profile-options', queryKey],
    queryFn: () => getRelationOptions(endpoint),
  });
}

export function useUsersOptions(): UseQueryResult<OptionItem[]> {
  return useOptions('users', '/api/v1/users/options');
}

export function useDepartmentsOptions(): UseQueryResult<OptionItem[]> {
  return useOptions('departments', '/api/v1/departments/options');
}

export function useLegalEntitiesOptions(): UseQueryResult<OptionItem[]> {
  return useOptions('legal-entities', '/api/v1/legal-entities/options');
}

export function useBusinessUnitsOptions(): UseQueryResult<OptionItem[]> {
  return useOptions('business-units', '/api/v1/business-units/options');
}

export function useLocationsOptions(): UseQueryResult<OptionItem[]> {
  return useOptions('locations', '/api/v1/locations/options');
}

export function useHolidayListsOptions(): UseQueryResult<OptionItem[]> {
  return useOptions('holiday-lists', '/api/v1/holiday-lists/options');
}
