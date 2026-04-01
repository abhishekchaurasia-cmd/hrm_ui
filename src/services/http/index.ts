import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type CancelToken,
} from 'axios';
import { getSession, signOut } from 'next-auth/react';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

interface ServiceConfig {
  method: HttpMethod;
  url: string;
  params?: Record<string, unknown>;
  data?: unknown;
  cancelToken?: CancelToken;
  headers?: Record<string, string>;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  async config => {
    if (typeof window !== 'undefined') {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined'
    ) {
      void signOut({ callbackUrl: '/' });
    }

    return Promise.reject(error);
  }
);

async function service(config: ServiceConfig): Promise<AxiosResponse> {
  const axiosConfig: AxiosRequestConfig = {
    method: config.method,
    url: config.url,
    cancelToken: config.cancelToken,
    headers: config.headers,
  };

  if (config.method === HttpMethod.GET) {
    axiosConfig.params = config.params;
  } else {
    axiosConfig.data = config.data;
    axiosConfig.params = config.params;
  }

  return apiClient(axiosConfig);
}

export default service;
export { apiClient };
