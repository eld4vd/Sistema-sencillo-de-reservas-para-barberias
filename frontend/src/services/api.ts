import type { CsrfResponse } from '../models/auth';
import { getCsrfTokenFromCookie } from '../helpers';

export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface ApiRequestOptions extends RequestInit {
  json?: unknown;
  csrfToken?: string | null;
  params?: QueryParams;
}

export type ApiErrorBody = {
  message?: string;
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
} | string | null;

export class ApiError<T = ApiErrorBody> extends Error {
  readonly status: number;
  readonly data: T;

  constructor(status: number, data: T, message?: string) {
    super(message ?? ApiError.extractMessage(data));
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  private static extractMessage(data: unknown): string {
    if (!data) return 'Error desconocido';
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data !== null) {
      const body = data as Record<string, unknown>;
      const message = body.message;
      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }
      const error = body.error;
      if (typeof error === 'string' && error.trim().length > 0) {
        return error;
      }
    }
    return 'Error inesperado en la API';
  }
}

const normalizePath = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

const shouldAttemptRefresh = (pathname: string): boolean => {
  return !pathname.includes('/auth/');
};

const attemptRefresh = async (): Promise<boolean> => {
  try {
    const csrfToken = getCsrfTokenFromCookie();
    if (!csrfToken) {
      return false;
    }

    const response = await fetch(normalizePath('/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
    });

    if (!response.ok) {
      return false;
    }

    try {
      const result = await response.json();
      if (!result || typeof result !== 'object' || result.success !== true) {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

const applyQueryParams = (url: URL, params?: QueryParams): void => {
  if (!params) return;
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, String(value));
  });
};

const buildRequestInit = (options: ApiRequestOptions): RequestInit => {
  const { json, csrfToken, headers, ...rest } = options;
  const finalHeaders = new Headers(headers ?? {});

  if (json !== undefined) {
    if (!finalHeaders.has('Content-Type')) {
      finalHeaders.set('Content-Type', 'application/json');
    }
  }
  if (csrfToken) {
    finalHeaders.set('X-CSRF-Token', csrfToken);
  }

  const init: RequestInit = {
    credentials: 'include',
    ...rest,
    headers: finalHeaders,
  };

  if (json !== undefined) {
    init.body = JSON.stringify(json);
  }

  return init;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, payload);
  }

  return payload as T;
};

export const apiClient = {
  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const baseOptions: ApiRequestOptions = { ...options };
    const url = new URL(normalizePath(path));
    applyQueryParams(url, baseOptions.params);

    const execute = async ({ params, ...rest }: ApiRequestOptions) => {
      void params;
      const init = buildRequestInit(rest as ApiRequestOptions);
      return fetch(url.toString(), init);
    };

    let response = await execute(baseOptions);

    if (response.status === 401 && shouldAttemptRefresh(url.pathname)) {
      const refreshed = await attemptRefresh();
      if (refreshed) {
        const retryOptions: ApiRequestOptions = { ...baseOptions };
        const nextCsrf = getCsrfTokenFromCookie();
        if (nextCsrf) {
          retryOptions.csrfToken = nextCsrf;
        }
        response = await execute(retryOptions);
      }
    }

    return parseResponse<T>(response);
  },

  get<T>(path: string, options: Omit<ApiRequestOptions, 'json' | 'method'> = {}) {
    return this.request<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, json?: unknown, options: Omit<ApiRequestOptions, 'json' | 'method'> = {}) {
    return this.request<T>(path, { ...options, method: 'POST', json });
  },

  put<T>(path: string, json?: unknown, options: Omit<ApiRequestOptions, 'json' | 'method'> = {}) {
    return this.request<T>(path, { ...options, method: 'PUT', json });
  },

  patch<T>(path: string, json?: unknown, options: Omit<ApiRequestOptions, 'json' | 'method'> = {}) {
    return this.request<T>(path, { ...options, method: 'PATCH', json });
  },

  delete<T>(path: string, options: Omit<ApiRequestOptions, 'json' | 'method'> = {}) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  },
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Ocurrió un error inesperado';
};

export const fetchCsrfToken = async (): Promise<CsrfResponse> => {
  return apiClient.get<CsrfResponse>('/auth/csrf', {
    credentials: 'include',
  });
};
