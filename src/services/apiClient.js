import axios from "axios";
import { logger } from "../utils/logger.js";

const BASE_URL =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.DEV ? "" : "https://dev.natureland.hipster-virtual.com");
const TOKEN_KEY = "spa.api.token.v1";

export const apiClient = axios.create({
  baseURL: BASE_URL ? `${BASE_URL}/api/v1` : "/api/v1",
  timeout: 12000,
  headers: {
    Accept: "application/json",
  },
});

export function getStoredToken() {
  try {
    const localToken = localStorage.getItem(TOKEN_KEY);
    if (
      localToken &&
      localToken !== "[object Object]" &&
      localToken !== "undefined"
    ) {
      return localToken;
    }
  } catch {}
  const envToken = import.meta.env.VITE_API_TOKEN;
  return envToken ?? "";
}

export function setStoredToken(token) {
  if (!token || typeof token !== "string") return;
  try {
    localStorage.setItem(TOKEN_KEY, token.trim());
  } catch {}
}

export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error("api.failure", {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      message: error?.message,
    });
    return Promise.reject(error);
  },
);
