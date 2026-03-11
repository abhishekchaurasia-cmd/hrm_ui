import service, { HttpMethod } from '@/services/http';

import type {
  OnboardEmployeeResponse,
  SalaryComponent,
} from '@/features/admin/employee-onboarding/types/onboarding';

export async function onboardEmployee(
  payload: Record<string, unknown>
): Promise<OnboardEmployeeResponse> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/employee-onboarding',
    data: payload,
  });

  return res.data as OnboardEmployeeResponse;
}

interface ListApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

export async function getSalaryComponents(): Promise<SalaryComponent[]> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/salary-components',
  });

  const payload = res.data as ListApiResponse<SalaryComponent>;
  return payload.data;
}
