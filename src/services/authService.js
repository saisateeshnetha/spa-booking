import {
  apiClient,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
} from "./apiClient.js";

const DEFAULT_EMAIL =
  import.meta.env.VITE_ASSESSMENT_EMAIL ?? "react@hipster-inc.com";
const DEFAULT_PASSWORD =
  import.meta.env.VITE_ASSESSMENT_PASSWORD ?? "React@123";
const DEFAULT_KEY_PASS =
  import.meta.env.VITE_ASSESSMENT_KEY_PASS ??
  "07ba959153fe7eec778361bf42079439";

function readTokenFromResponse(data) {
  const candidates = [
    data?.token,
    data?.access_token,
    data?.data?.token,
    data?.data?.access_token,
    data?.data?.data?.token,
    data?.data?.data?.access_token,
    data?.data?.data?.token?.token,
    data?.data?.token?.token,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (
      value &&
      typeof value === "object" &&
      typeof value.token === "string" &&
      value.token.trim()
    ) {
      return value.token.trim();
    }
  }
  return "";
}

let authInFlight = null;

export const authService = {
  async ensureAuth(forceRefresh = false) {
    const existing = getStoredToken();
    if (existing && !forceRefresh) return existing;
    if (authInFlight && !forceRefresh) return authInFlight;
    if (forceRefresh) {
      clearStoredToken();
      authInFlight = null;
    }

    authInFlight = (async () => {
      const payload = new FormData();
      payload.append("email", DEFAULT_EMAIL);
      payload.append("password", DEFAULT_PASSWORD);
      payload.append("key_pass", DEFAULT_KEY_PASS);

      const response = await apiClient.post("/login", payload);
      const token = readTokenFromResponse(response.data);
      if (token) {
        setStoredToken(token);
        return token;
      }
      throw new Error("Login response did not include token.");
    })();

    try {
      return await authInFlight;
    } finally {
      authInFlight = null;
    }
  },
};
