import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

const doctorsSlice = createSlice({
  name: "doctors",
  initialState,
  reducers: {
    // Fetch
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create
    createStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createSuccess: (state, action) => {
      state.loading = false;
      state.list.unshift(action.payload); // add new doctor to top
    },
    createFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update
    updateStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateSuccess: (state, action) => {
      state.loading = false;
      state.list = state.list.map((d) =>
        d.id === action.payload.id ? action.payload : d
      );
    },
    updateFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete
    deleteStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteSuccess: (state, action) => {
      state.loading = false;
      state.list = state.list.filter((d) => d.id !== action.payload);
    },
    deleteFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  createStart,
  createSuccess,
  createFailure,
  updateStart,
  updateSuccess,
  updateFailure,
  deleteStart,
  deleteSuccess,
  deleteFailure,
} = doctorsSlice.actions;

export default doctorsSlice.reducer;
