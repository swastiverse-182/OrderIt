import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: true, // FIX: Start as true so Login button doesn't flash before loadUser completes
  isAuthenticated: false,
  error: null,
  isUpdated: false,
  message: null,
  success: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // LOGIN, REGISTER, AND INITIAL LOAD
    loginRequest: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFail: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },

    // SPECIFIC FAIL FOR APP REFRESH (loadUser)
    loadUserFail: (state) => {
      state.loading = false; // CRITICAL: This allows the Login button to show
      state.isAuthenticated = false;
      state.user = null;
    },

    // LOGOUT LOGIC
    logoutSuccess: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
    },
    logoutFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // PROFILE & PASSWORD UPDATES
    updateRequest: (state) => {
      state.loading = true;
    },
    updateSuccess: (state) => {
      state.loading = false;
      state.isUpdated = true;
    },
    updateFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateReset: (state) => {
      state.isUpdated = false;
    },

    // FORGOT / RESET PASSWORD
    forgotPasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload;
    },
    forgotPasswordFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    resetPasswordRequest: (state) => {
      state.loading = true;
    },
    resetPasswordSuccess: (state, action) => {
      state.loading = false;
      state.success = action.payload;
    },
    resetPasswordFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // FIX: Also clear message and success in clearErrors
    clearErrors: (state) => {
      state.error = null;
      state.message = null;
      state.success = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFail,
  loadUserFail,
  logoutSuccess,
  logoutFail,
  updateRequest,
  updateSuccess,
  updateFail,
  updateReset,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFail,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFail,
  clearErrors,
} = userSlice.actions;

export default userSlice.reducer;