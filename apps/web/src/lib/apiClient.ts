import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true, // send httpOnly refresh-token cookie
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let csrfToken: string | null = null;

/**
 * The refresh/logout endpoints are cookie-authenticated and therefore
 * CSRF-protected server-side (double-submit cookie pattern). Every other
 * endpoint authenticates via a Bearer header, which browsers never attach
 * automatically, so it isn't a classic CSRF target. Fetch (and cache) the
 * token before hitting either of those two routes.
 */
export async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  const res = await axios.get(`${API_URL}/api/v1/csrf-token`, { withCredentials: true });
  csrfToken = res.data.data.csrfToken as string;
  return csrfToken;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const csrf = await ensureCsrfToken();
    const res = await axios.post(
      `${API_URL}/api/v1/auth/refresh`,
      {},
      { withCredentials: true, headers: { "X-CSRF-Token": csrf } }
    );
    const token = res.data?.data?.accessToken as string;
    useAuthStore.getState().setAccessToken(token);
    return token;
  } catch {
    useAuthStore.getState().logout();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshPromise = refreshPromise || refreshAccessToken();
      const token = await refreshPromise;
      refreshPromise = null;

      if (token) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        return apiClient(original);
      }
    }

    return Promise.reject(error);
  }
);

export function apiErrorMessage(err: unknown, fallback = "Terjadi kesalahan, silakan coba lagi"): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message || fallback;
  }
  return fallback;
}
