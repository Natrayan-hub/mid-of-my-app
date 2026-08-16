// LifeOS API client — thin typed fetch wrapper around the backend
// (API design Part B: base /api, bearer auth, uniform error envelope).
// Feature modules build on this; no feature logic lives here.
import { storage } from "@/src/utils/storage";

const BASE_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

// ONE shared key for auth tokens: AuthProvider writes it, this client reads it.
export const ACCESS_TOKEN_KEY = "lifeos.auth.access_token";
export const REFRESH_TOKEN_KEY = "lifeos.auth.refresh_token";

export class ApiError extends Error {
  code: string;
  status: number;
  retryable: boolean;

  constructor(status: number, code: string, message: string, retryable = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  auth?: boolean; // default true — set false for /auth/* routes
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params, auth = true } = options;

  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = await storage.secureGet<string>(ACCESS_TOKEN_KEY, "");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Network request failed", true);
  }

  if (!response.ok) {
    let code = "INTERNAL";
    let message = `Request failed (${response.status})`;
    let retryable = response.status >= 500 || response.status === 429;
    try {
      const payload = await response.json();
      if (payload?.error) {
        code = payload.error.code ?? code;
        message = payload.error.message ?? message;
        retryable = payload.error.retryable ?? retryable;
      } else if (payload?.detail) {
        message = typeof payload.detail === "string" ? payload.detail : message;
      }
    } catch {
      // non-JSON error body — keep defaults
    }
    throw new ApiError(response.status, code, message, retryable);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, params?: RequestOptions["params"], auth?: boolean) =>
    request<T>(path, { method: "GET", params, auth }),
  post: <T>(path: string, body?: unknown, auth?: boolean) =>
    request<T>(path, { method: "POST", body, auth }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
  del: <T>(path: string, params?: RequestOptions["params"]) =>
    request<T>(path, { method: "DELETE", params }),
};
