import { getStoredAccessToken } from "./auth-storage";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3000/api";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | object | null;
  token?: string | null;
  skipAuth?: boolean;
};

const isFormData = (value: unknown): value is FormData =>
  typeof FormData !== "undefined" && value instanceof FormData;

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? text : null;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
) {
  const token = options.skipAuth ? null : options.token ?? getStoredAccessToken();
  const headers = new Headers(options.headers);
  const body = options.body ?? null;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body && !isFormData(body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body:
      body && !isFormData(body) && typeof body !== "string"
        ? JSON.stringify(body)
        : body,
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : response.statusText || "Unexpected API error";

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export { API_BASE_URL };