import axios from "axios";
import CryptoJS from "crypto-js";
import store from "../app/store";
import { loginSuccess, logout } from "../features/auth/authSlice";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost/Healthcare/backup-final/backend/public";
const AES_KEY_STR = process.env.REACT_APP_AES_KEY;
if (!AES_KEY_STR) {
  console.error("FATAL: REACT_APP_AES_KEY is missing in environment variables.");
}
const AES_KEY = CryptoJS.enc.Utf8.parse(AES_KEY_STR || "");

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

/* --- Encryption Helpers --- */
const encryptPayload = (data) => {
  try {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), AES_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    const combined = iv.concat(encrypted.ciphertext);
    return CryptoJS.enc.Base64.stringify(combined);
  } catch (e) {
    console.error("Encryption Failed", e);
    return data;
  }
};

const decryptPayload = (encryptedBase64) => {
  try {
    if (!encryptedBase64 || typeof encryptedBase64 !== "string") return null;

    const raw = CryptoJS.enc.Base64.parse(encryptedBase64);
    if (raw.sigBytes < 16) return null; // Too short for IV

    const iv = CryptoJS.lib.WordArray.create(raw.words.slice(0, 4), 16);
    const ciphertext = CryptoJS.lib.WordArray.create(raw.words.slice(4), raw.sigBytes - 16);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext },
      AES_KEY,
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );

    // Try to decode as UTF-8. If it fails (malformed UTF-8), it throws.
    try {
      const str = decrypted.toString(CryptoJS.enc.Utf8);
      if (!str) return null;
      return JSON.parse(str);
    } catch (utf8Err) {
      console.warn("Decryption succeeded but data is not valid UTF-8. Key mismatch or corrupted data.");
      return null;
    }
  } catch (e) {
    // console.error("Decryption System Failure", e.message);
    return null;
  }
};

// Request Interceptor
api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.accessToken;
  const csrf = state.auth.csrfToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // CSRF Header (if available)
  if (csrf) {
    config.headers['X-CSRF-Token'] = csrf;
  }

  // Encrypt Data if JSON
  if (config.data && !(config.data instanceof FormData)) {
    // Don't encrypt if already encrypted (check payload key?)
    // But we construct payload here.
    if (!config.data.payload) {
      const payload = encryptPayload(config.data);
      config.data = { payload };
    }
  }

  return config;
}, (error) => Promise.reject(error));

// Response Interceptor
api.interceptors.response.use((response) => {
  // Decrypt Response
  if (response.data && response.data.payload) {
    const decrypted = decryptPayload(response.data.payload);
    if (decrypted) {
      response.data = decrypted;
    }
  }
  return response;
}, async (error) => {
  const originalRequest = error.config;

  // Handle 401 & Refresh Token
  // Exclude login/register from refresh logic
  if (error.response?.status === 401 && !originalRequest._retry &&
    !originalRequest.url.includes("/login") &&
    !originalRequest.url.includes("/register")) {
    console.log("DEBUG: 401 detected, attempting refresh");
    originalRequest._retry = true;

    try {
      const state = store.getState();
      const csrf = state.auth.csrfToken;

      // Call refresh endpoint directly using Cookie (withCredentials: true)
      // We must send encrypted payload even if empty, and CSRF header.
      const payload = {};
      const encryptedPayload = encryptPayload(payload);

      const res = await axios.post(`${API_BASE}/refresh-token`, { payload: encryptedPayload }, {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrf
        },
        withCredentials: true
      });

      // Decrypt response
      let data = res.data;
      if (data.payload) {
        data = decryptPayload(data.payload);
      }

      if (data && data.accessToken) {
        store.dispatch(loginSuccess(data));

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      }

    } catch (refreshError) {
      console.error("DEBUG: Refresh failed", refreshError);
      store.dispatch(logout());
      window.location.href = "/login";
    }
  }

  // If error data is encrypted, decrypt it for better error message
  if (error.response && error.response.data && error.response.data.payload) {
    const decryptedFn = decryptPayload(error.response.data.payload);
    if (decryptedFn) error.response.data = decryptedFn;
  }

  return Promise.reject(error);
});

/* ================= GET ================= */
export const getData = async (endpoint) => {
  const res = await api.get(endpoint);
  return res.data;
};

/* ================= POST ================= */
export const postData = async (endpoint, payload) => {
  const res = await api.post(endpoint, payload);
  return res.data;
};

/* ================= PUT ================= */
export const putData = async (endpoint, payload) => {
  const res = await api.put(endpoint, payload);
  return res.data;
};

/* ================= PATCH ================= */
export const patchData = async (endpoint, payload) => {
  const res = await api.patch(endpoint, payload);
  return res.data;
};

/* ================= DELETE ================= */
export const deleteData = async (endpoint) => {
  const res = await api.delete(endpoint);
  return res.data;
};

export default api;
