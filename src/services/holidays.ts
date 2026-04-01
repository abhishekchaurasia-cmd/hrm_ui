import service, { HttpMethod } from './http';

import type {
  AddHolidayPayload,
  AssignedEmployee,
  AssignResult,
  BulkImportResult,
  CreateHolidayPlanPayload,
  Holiday,
  HolidayCalendarResponse,
  HolidayPlan,
  HolidayPlanDetail,
  ImportHolidaysPayload,
  MyHolidayPlan,
  PublicHoliday,
  PublicHolidayCountry,
  UnassignResult,
  UpdateHolidayPayload,
  UpdateHolidayPlanPayload,
} from '@/types/holiday';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getHolidayPlans(
  year?: number
): Promise<ApiResponse<HolidayPlan[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/holiday-lists',
    params: year ? ({ year } as Record<string, unknown>) : undefined,
  });
  return res.data as ApiResponse<HolidayPlan[]>;
}

export async function getHolidayPlanDetail(
  id: string
): Promise<ApiResponse<HolidayPlanDetail>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `/api/v1/holiday-lists/${id}`,
  });
  return res.data as ApiResponse<HolidayPlanDetail>;
}

export async function createHolidayPlan(
  payload: CreateHolidayPlanPayload
): Promise<ApiResponse<HolidayPlan>> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/holiday-lists',
    data: payload,
  });
  return res.data as ApiResponse<HolidayPlan>;
}

export async function updateHolidayPlan(
  id: string,
  payload: UpdateHolidayPlanPayload
): Promise<ApiResponse<HolidayPlan>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/holiday-lists/${id}`,
    data: payload,
  });
  return res.data as ApiResponse<HolidayPlan>;
}

export async function deleteHolidayPlan(
  id: string
): Promise<ApiResponse<null>> {
  const res = await service({
    method: HttpMethod.DELETE,
    url: `/api/v1/holiday-lists/${id}`,
  });
  return res.data as ApiResponse<null>;
}

export async function addHoliday(
  listId: string,
  payload: AddHolidayPayload
): Promise<ApiResponse<Holiday>> {
  const res = await service({
    method: HttpMethod.POST,
    url: `/api/v1/holiday-lists/${listId}/holidays`,
    data: payload,
  });
  return res.data as ApiResponse<Holiday>;
}

export async function updateHoliday(
  listId: string,
  holidayId: string,
  payload: UpdateHolidayPayload
): Promise<ApiResponse<Holiday>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/holiday-lists/${listId}/holidays/${holidayId}`,
    data: payload,
  });
  return res.data as ApiResponse<Holiday>;
}

export async function removeHoliday(
  listId: string,
  holidayId: string
): Promise<ApiResponse<null>> {
  const res = await service({
    method: HttpMethod.DELETE,
    url: `/api/v1/holiday-lists/${listId}/holidays/${holidayId}`,
  });
  return res.data as ApiResponse<null>;
}

export async function getAvailableCountries(): Promise<
  ApiResponse<PublicHolidayCountry[]>
> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/holiday-lists/public-holidays/countries',
  });
  return res.data as ApiResponse<PublicHolidayCountry[]>;
}

export async function getPublicHolidays(
  countryCode: string,
  year: number
): Promise<ApiResponse<PublicHoliday[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `/api/v1/holiday-lists/public-holidays/${countryCode}/${year}`,
  });
  return res.data as ApiResponse<PublicHoliday[]>;
}

export async function importHolidays(
  listId: string,
  payload: ImportHolidaysPayload
): Promise<ApiResponse<BulkImportResult>> {
  const res = await service({
    method: HttpMethod.POST,
    url: `/api/v1/holiday-lists/${listId}/holidays/import`,
    data: payload,
  });
  return res.data as ApiResponse<BulkImportResult>;
}

export async function getAssignedEmployees(listId: string): Promise<
  ApiResponse<{
    items: AssignedEmployee[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>
> {
  const res = await service({
    method: HttpMethod.GET,
    url: `/api/v1/holiday-lists/${listId}/employees`,
  });
  return res.data as ApiResponse<{
    items: AssignedEmployee[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export async function getUnassignedEmployees(
  listId: string,
  search?: string
): Promise<
  ApiResponse<{
    items: AssignedEmployee[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>
> {
  const params: Record<string, unknown> = {};
  if (search) params.search = search;
  const res = await service({
    method: HttpMethod.GET,
    url: `/api/v1/holiday-lists/${listId}/employees/unassigned`,
    params: Object.keys(params).length > 0 ? params : undefined,
  });
  return res.data as ApiResponse<{
    items: AssignedEmployee[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export async function assignEmployees(
  listId: string,
  employeeIds: string[]
): Promise<ApiResponse<AssignResult>> {
  const res = await service({
    method: HttpMethod.POST,
    url: `/api/v1/holiday-lists/${listId}/employees/assign`,
    data: { employeeIds },
  });
  return res.data as ApiResponse<AssignResult>;
}

export async function unassignEmployees(
  listId: string,
  employeeIds: string[]
): Promise<ApiResponse<UnassignResult>> {
  const res = await service({
    method: HttpMethod.POST,
    url: `/api/v1/holiday-lists/${listId}/employees/unassign`,
    data: { employeeIds },
  });
  return res.data as ApiResponse<UnassignResult>;
}

export async function bulkAddHolidays(
  listId: string,
  holidays: AddHolidayPayload[]
): Promise<ApiResponse<BulkImportResult>> {
  const res = await service({
    method: HttpMethod.POST,
    url: `/api/v1/holiday-lists/${listId}/holidays/bulk`,
    data: { holidays },
  });
  return res.data as ApiResponse<BulkImportResult>;
}

export async function getMyHolidays(
  year?: number
): Promise<ApiResponse<Holiday[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/holidays',
    params: year ? ({ year } as Record<string, unknown>) : undefined,
  });
  return res.data as ApiResponse<Holiday[]>;
}

export async function getMyHolidayPlan(): Promise<
  ApiResponse<MyHolidayPlan | null>
> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/holidays/plan',
  });
  return res.data as ApiResponse<MyHolidayPlan | null>;
}

export async function getUpcomingHolidays(
  limit = 5
): Promise<ApiResponse<Holiday[]>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/holidays/upcoming',
    params: { limit } as Record<string, unknown>,
  });
  return res.data as ApiResponse<Holiday[]>;
}

export async function getHolidayCalendar(
  year?: number
): Promise<ApiResponse<HolidayCalendarResponse>> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/holidays/calendar',
    params: year ? ({ year } as Record<string, unknown>) : undefined,
  });
  return res.data as ApiResponse<HolidayCalendarResponse>;
}
