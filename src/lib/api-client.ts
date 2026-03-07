import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && session?.refreshToken) {
    const refreshRes = await fetch(`${API_URL}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });

    if (refreshRes.ok) {
      const refreshBody = await refreshRes.json();
      headers['Authorization'] = `Bearer ${refreshBody.data.accessToken}`;

      return fetch(`${API_URL}${path}`, { ...options, headers });
    }
  }

  return res;
}

export const api = {
  get: (path: string) => apiFetch(path),

  post: (path: string, body: unknown) =>
    apiFetch(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: (path: string, body: unknown) =>
    apiFetch(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (path: string) => apiFetch(path, { method: 'DELETE' }),
};
