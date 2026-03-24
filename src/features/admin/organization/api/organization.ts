import service, { HttpMethod } from '@/services/http';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface OrgEntity {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationEntity extends OrgEntity {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface BusinessUnitEntity extends OrgEntity {
  legalEntityId?: string | null;
  legalEntity?: { id: string; name: string } | null;
}

// --- Legal Entities ---

export async function getLegalEntities(): Promise<OrgEntity[]> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/legal-entities',
  });
  const payload = res.data as ApiResponse<OrgEntity[]>;
  return payload.data;
}

export async function createLegalEntity(data: {
  name: string;
  description?: string;
}): Promise<OrgEntity> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/legal-entities',
    data,
  });
  const payload = res.data as ApiResponse<OrgEntity>;
  return payload.data;
}

export async function updateLegalEntity(
  id: string,
  data: { name?: string; description?: string }
): Promise<OrgEntity> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/legal-entities/${id}`,
    data,
  });
  const payload = res.data as ApiResponse<OrgEntity>;
  return payload.data;
}

export async function deleteLegalEntity(id: string): Promise<void> {
  await service({
    method: HttpMethod.DELETE,
    url: `/api/v1/legal-entities/${id}`,
  });
}

// --- Business Units ---

export async function getBusinessUnits(): Promise<BusinessUnitEntity[]> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/business-units',
  });
  const payload = res.data as ApiResponse<BusinessUnitEntity[]>;
  return payload.data;
}

export async function createBusinessUnit(data: {
  name: string;
  legalEntityId?: string;
  description?: string;
}): Promise<BusinessUnitEntity> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/business-units',
    data,
  });
  const payload = res.data as ApiResponse<BusinessUnitEntity>;
  return payload.data;
}

export async function updateBusinessUnit(
  id: string,
  data: { name?: string; legalEntityId?: string; description?: string }
): Promise<BusinessUnitEntity> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/business-units/${id}`,
    data,
  });
  const payload = res.data as ApiResponse<BusinessUnitEntity>;
  return payload.data;
}

export async function deleteBusinessUnit(id: string): Promise<void> {
  await service({
    method: HttpMethod.DELETE,
    url: `/api/v1/business-units/${id}`,
  });
}

// --- Departments ---

export async function getDepartments(): Promise<OrgEntity[]> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/departments',
  });
  const payload = res.data as ApiResponse<OrgEntity[]>;
  return payload.data;
}

export async function createDepartment(data: {
  name: string;
  description?: string;
}): Promise<OrgEntity> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/departments',
    data,
  });
  const payload = res.data as ApiResponse<OrgEntity>;
  return payload.data;
}

export async function updateDepartment(
  id: string,
  data: { name?: string; description?: string }
): Promise<OrgEntity> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/departments/${id}`,
    data,
  });
  const payload = res.data as ApiResponse<OrgEntity>;
  return payload.data;
}

export async function deleteDepartment(id: string): Promise<void> {
  await service({
    method: HttpMethod.DELETE,
    url: `/api/v1/departments/${id}`,
  });
}

// --- Locations ---

export async function getLocations(): Promise<LocationEntity[]> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/locations',
  });
  const payload = res.data as ApiResponse<LocationEntity[]>;
  return payload.data;
}

export async function createLocation(data: {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}): Promise<LocationEntity> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/locations',
    data,
  });
  const payload = res.data as ApiResponse<LocationEntity>;
  return payload.data;
}

export async function updateLocation(
  id: string,
  data: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  }
): Promise<LocationEntity> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/locations/${id}`,
    data,
  });
  const payload = res.data as ApiResponse<LocationEntity>;
  return payload.data;
}

export async function deleteLocation(id: string): Promise<void> {
  await service({ method: HttpMethod.DELETE, url: `/api/v1/locations/${id}` });
}
