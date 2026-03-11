import axios from 'axios';

import service, { HttpMethod } from '@/services/http';

import type { EmployeeProfileUpdatePayload } from '@/features/admin/employee-profile/schema/employee-profile.schema';
import type {
  ApiResponse,
  EmployeeProfile,
  OptionItem,
} from '@/features/admin/employee-profile/types/employee-profile';

export async function getEmployeeProfile(
  userId: string
): Promise<ApiResponse<EmployeeProfile | null>> {
  const res = await service({
    method: HttpMethod.GET,
    url: `/api/v1/employee-profiles/${userId}`,
  });

  return res.data as ApiResponse<EmployeeProfile | null>;
}

export async function getMyEmployeeProfile(): Promise<
  ApiResponse<EmployeeProfile | null>
> {
  try {
    const res = await service({
      method: HttpMethod.GET,
      url: '/api/v1/employee-profiles/me',
    });

    return res.data as ApiResponse<EmployeeProfile | null>;
  } catch (error: unknown) {
    if (!isUuidValidationError(error)) throw error;

    const userId = await resolveCurrentUserUuid();
    const fallbackRes = await service({
      method: HttpMethod.GET,
      url: `/api/v1/employee-profiles/${userId}`,
    });
    return fallbackRes.data as ApiResponse<EmployeeProfile | null>;
  }
}

export async function updateEmployeeProfile(
  userId: string,
  payload: EmployeeProfileUpdatePayload
): Promise<ApiResponse<EmployeeProfile>> {
  const res = await service({
    method: HttpMethod.PATCH,
    url: `/api/v1/employee-profiles/${userId}`,
    data: payload,
  });

  return res.data as ApiResponse<EmployeeProfile>;
}

export async function updateMyEmployeeProfile(
  payload: EmployeeProfileUpdatePayload
): Promise<ApiResponse<EmployeeProfile>> {
  try {
    const res = await service({
      method: HttpMethod.PATCH,
      url: '/api/v1/employee-profiles/me',
      data: payload,
    });

    return res.data as ApiResponse<EmployeeProfile>;
  } catch (error: unknown) {
    if (!isUuidValidationError(error)) throw error;

    const userId = await resolveCurrentUserUuid();
    const fallbackRes = await service({
      method: HttpMethod.PATCH,
      url: `/api/v1/employee-profiles/${userId}`,
      data: payload,
    });
    return fallbackRes.data as ApiResponse<EmployeeProfile>;
  }
}

interface OptionApiItem {
  id: string;
  userId?: string;
  name?: string;
  label?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

function resolveOptionLabel(item: OptionApiItem): string {
  const fullName = [item.firstName, item.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (item.label && item.label.trim()) return item.label;
  if (item.name && item.name.trim()) return item.name;
  if (fullName) return fullName;
  if (item.email && item.email.trim()) return item.email;
  return item.id;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUuidValidationError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const message = error.response?.data?.message;
  return (
    typeof message === 'string' &&
    message.toLowerCase().includes('uuid is expected')
  );
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function extractUuidFromPayload(payload: unknown): string | null {
  if (!isRecord(payload) || !isRecord(payload.data)) return null;

  const queue: unknown[] = [payload.data];
  const visited = new Set<unknown>();
  const candidateKeys = ['id', 'userId', 'user_id', 'uuid'];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);

    if (typeof current === 'string' && isUuid(current)) {
      return current;
    }

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (!isRecord(current)) continue;

    for (const key of candidateKeys) {
      const value = current[key];
      if (typeof value === 'string' && isUuid(value)) {
        return value;
      }
    }

    queue.push(...Object.values(current));
  }

  return null;
}

async function resolveCurrentUserUuid(): Promise<string> {
  const res = await service({
    method: HttpMethod.GET,
    url: '/api/v1/auth/profile',
  });

  const userId = extractUuidFromPayload(res.data);
  if (!userId) {
    throw new Error('Could not resolve current user UUID');
  }

  return userId;
}

export async function getRelationOptions(
  endpoint: string
): Promise<OptionItem[]> {
  const res = await service({
    method: HttpMethod.GET,
    url: endpoint,
  });

  // Some endpoints return a plain array; others wrap it in { data: [...] }
  const raw = res.data as ApiResponse<OptionApiItem[]> | OptionApiItem[];
  const items: OptionApiItem[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.data)
      ? raw.data
      : [];

  return items.map(item => ({
    value: item.userId ?? item.id,
    label: resolveOptionLabel(item),
  }));
}
