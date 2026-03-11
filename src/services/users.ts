import service, { HttpMethod } from './http';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreateEmployeeUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function createEmployeeUser(
  payload: CreateEmployeeUserPayload
): Promise<ApiResponse<unknown>> {
  const res = await service({
    method: HttpMethod.POST,
    url: '/api/v1/auth/register',
    data: payload,
  });

  return res.data as ApiResponse<unknown>;
}
