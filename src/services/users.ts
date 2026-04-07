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

export async function deleteUser(userId: string): Promise<ApiResponse<null>> {
  const res = await service({
    method: HttpMethod.DELETE,
    url: `/api/v1/users/${encodeURIComponent(userId)}`,
  });

  return res.data as ApiResponse<null>;
}

export interface UpcomingBirthday {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  department: string | null;
}

export async function getUpcomingBirthdays(): Promise<
  ApiResponse<UpcomingBirthday[]>
> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/users/upcoming-birthdays',
  });
  return res.data as ApiResponse<UpcomingBirthday[]>;
}

export interface UpcomingAnniversary {
  userId: string;
  firstName: string;
  lastName: string;
  joiningDate: string;
  yearsOfService: number;
  department: string | null;
}

export async function getUpcomingAnniversaries(): Promise<
  ApiResponse<UpcomingAnniversary[]>
> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/users/upcoming-anniversaries',
  });
  return res.data as ApiResponse<UpcomingAnniversary[]>;
}
