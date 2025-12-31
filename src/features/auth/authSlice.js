// src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Load tokens
const storedUser = localStorage.getItem("hcare_user");
const storedAccessToken = localStorage.getItem("hcare_access_token");
const storedRefreshToken = localStorage.getItem("hcare_refresh_token");


let preloadedUser = null;
if (storedUser && storedUser !== "undefined") {
  try {
    preloadedUser = JSON.parse(storedUser);
  } catch (e) {
    console.error("Failed to parse stored user", e);
    localStorage.removeItem("hcare_user");
  }
}

const initialState = {
  user: preloadedUser, // Load from storage
  accessToken: storedAccessToken,
  // refreshToken: storedRefreshToken, // Removed - HttpOnly Cookie
  loading: false,
  error: null,
  tokenExpiresAt: null, // Hard to persist expiry accurately without timestamp
  csrfToken: null // CSRF usually not persisted long term but can be
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state, action) {
      state.loading = true;
      state.error = null;
    },

    loginSuccess(state, action) {
      state.loading = false;

      // Only update user if provided (e.g. login)
      // On refresh, we might not get user object back
      if (action.payload.user) {
        state.user = action.payload.user;
        localStorage.setItem("hcare_user", JSON.stringify(action.payload.user));
      }

      state.accessToken = action.payload.accessToken;
      state.tokenExpiresAt = Date.now() + (action.payload.expiresIn * 1000);
      state.error = null;

      localStorage.setItem("hcare_access_token", action.payload.accessToken);
    },

    loginFailure(state, action) {
      state.loading = false;
      state.user = null;
      state.accessToken = null;
      state.tokenExpiresAt = null;
      state.error = action.payload || "Login failed";
    },

    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.tokenExpiresAt = null;
      state.loading = false;
      state.error = null;

      // Clear persistence
      localStorage.removeItem("hcare_user");
      localStorage.removeItem("hcare_access_token");
      // localStorage.removeItem("hcare_refresh_token");
    },

    setCsrfToken(state, action) {
      state.csrfToken = action.payload;
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("hcare_user", JSON.stringify(state.user));
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setCsrfToken,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
