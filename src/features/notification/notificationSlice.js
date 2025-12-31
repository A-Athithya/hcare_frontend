import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // unread notifications only
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    /* ---------- FETCH ---------- */
    fetchNotificationsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchNotificationsSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload || [];
    },
    fetchNotificationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    /* ---------- CREATE ---------- */
    createNotificationRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createNotificationSuccess: (state, action) => {
      state.loading = false;
      state.items.unshift(action.payload);
    },
    createNotificationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    /* ---------- MARK AS READ ---------- */
    markNotificationReadRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    markNotificationReadSuccess: (state, action) => {
      state.loading = false;
      const { id } = action.payload;

      // 🔥 unread list la irunthu remove
      state.items = state.items.filter(
        (n) => String(n.id) !== String(id)
      );
    },
    markNotificationReadFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchNotificationsRequest,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  createNotificationRequest,
  createNotificationSuccess,
  createNotificationFailure,
  markNotificationReadRequest,
  markNotificationReadSuccess,
  markNotificationReadFailure,
} = notificationSlice.actions;

export default notificationSlice.reducer;
