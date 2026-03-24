import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getLegalEntities,
  createLegalEntity,
  updateLegalEntity,
  deleteLegalEntity,
  getBusinessUnits,
  createBusinessUnit,
  updateBusinessUnit,
  deleteBusinessUnit,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '@/features/admin/organization/api/organization';

const KEYS = {
  legalEntities: ['org', 'legal-entities'] as const,
  businessUnits: ['org', 'business-units'] as const,
  departments: ['org', 'departments'] as const,
  locations: ['org', 'locations'] as const,
};

// --- Legal Entities ---

export function useLegalEntities() {
  return useQuery({ queryKey: KEYS.legalEntities, queryFn: getLegalEntities });
}

export function useCreateLegalEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLegalEntity,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.legalEntities }),
  });
}

export function useUpdateLegalEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      description?: string;
    }) => updateLegalEntity(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.legalEntities }),
  });
}

export function useDeleteLegalEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLegalEntity,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.legalEntities }),
  });
}

// --- Business Units ---

export function useBusinessUnits() {
  return useQuery({ queryKey: KEYS.businessUnits, queryFn: getBusinessUnits });
}

export function useCreateBusinessUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBusinessUnit,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.businessUnits }),
  });
}

export function useUpdateBusinessUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      legalEntityId?: string;
      description?: string;
    }) => updateBusinessUnit(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.businessUnits }),
  });
}

export function useDeleteBusinessUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBusinessUnit,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.businessUnits }),
  });
}

// --- Departments ---

export function useDepartments() {
  return useQuery({ queryKey: KEYS.departments, queryFn: getDepartments });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.departments }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      description?: string;
    }) => updateDepartment(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.departments }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.departments }),
  });
}

// --- Locations ---

export function useLocations() {
  return useQuery({ queryKey: KEYS.locations, queryFn: getLocations });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLocation,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.locations }),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    }) => updateLocation(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.locations }),
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.locations }),
  });
}
