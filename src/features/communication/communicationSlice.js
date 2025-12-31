import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  appointments: [],          // ✅ appointments list
  notesByAppointment: {},    // { [appointmentId]: [] }
  history: [],
  loading: false,
  sendingNote: false,
  error: null
};

const communicationSlice = createSlice({
  name: "communication",
  initialState,
  reducers: {
    /* ================= APPOINTMENTS ================= */
    fetchAppointmentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAppointmentsSuccess: (state, action) => {
      state.appointments = action.payload;
      state.loading = false;
    },

    /* ================= NOTES ================= */
    fetchNotesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchNotesSilentRequest: (state) => {
      state.error = null;
      // Do not set loading to true
    },
    fetchNotesSuccess: (state, action) => {
      const { appointmentId, notes } = action.payload;
      state.notesByAppointment[appointmentId] = notes;
      state.loading = false;
    },

    /* ================= HISTORY ================= */
    fetchHistoryRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchHistorySuccess: (state, action) => {
      state.history = action.payload;
      state.loading = false;
    },

    /* ================= ADD NOTE ================= */
    addNoteRequest: (state) => {
      state.sendingNote = true;
      state.error = null;
    },
    addNoteSuccess: (state) => {
      state.sendingNote = false;
    },

    /* ================= ERROR ================= */
    communicationFailure: (state, action) => {
      state.loading = false;
      state.sendingNote = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchAppointmentsRequest,
  fetchAppointmentsSuccess,
  fetchNotesRequest,
  fetchNotesSilentRequest,
  fetchNotesSuccess,
  fetchHistoryRequest,
  fetchHistorySuccess,
  addNoteRequest,
  addNoteSuccess,
  communicationFailure
} = communicationSlice.actions;

export default communicationSlice.reducer;
