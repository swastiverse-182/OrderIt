import API from "../../utils/api";
import {
  loginRequest,
  loginSuccess,
  loginFail,
  loadUserFail,
  logoutSuccess,
  logoutFail,
  updateRequest,
  updateSuccess,
  updateFail,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFail,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFail,
} from "../slices/userSlice";
import { clearCart } from "../slices/cartSlice";

// Helper to support both data structures (data.data.user or data.user)
const extractUser = (data) => (data.data ? data.data.user : data.user);

// --- LOAD USER ---
export const loadUser = () => async (dispatch) => {
  try {
    dispatch(loginRequest());
    const { data } = await API.get("/v1/users/me");
    dispatch(loginSuccess(extractUser(data)));
  } catch (error) {
    dispatch(loadUserFail(error.response?.data?.message));
  }
};

// --- LOGIN ---
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch(loginRequest());
    const { data } = await API.post("/v1/users/login", { email, password });
    dispatch(loginSuccess(extractUser(data)));
  } catch (error) {
    dispatch(loginFail(error.response?.data?.message || "Login Failed"));
  }
};

// --- REGISTER (User) ---
export const register = (userData) => async (dispatch) => {
  try {
    dispatch(loginRequest());
    const { data } = await API.post("/v1/users/signup", userData, {
      headers: { "Content-Type": "application/json" },
    });
    dispatch(loginSuccess(extractUser(data)));
  } catch (error) {
    dispatch(loginFail(error.response?.data?.message));
  }
};

// --- ADMIN REGISTER ---
export const adminRegister = (userData) => async (dispatch) => {
  try {
    dispatch(loginRequest());
    const { data } = await API.post("/v1/users/admin/signup", userData, {
      headers: { "Content-Type": "application/json" },
    });
    dispatch(loginSuccess(extractUser(data)));
  } catch (error) {
    dispatch(loginFail(error.response?.data?.message));
  }
};

// --- LOGOUT ---
export const logout = () => async (dispatch) => {
  try {
    await API.get("/v1/users/logout");
    dispatch(logoutSuccess());
    dispatch(clearCart());
  } catch (error) {
    dispatch(logoutFail(error.response?.data?.message));
  }
};

// --- UPDATE PROFILE ---
export const updateProfile = (userData) => async (dispatch) => {
  try {
    dispatch(updateRequest());
    const { data } = await API.put("/v1/users/me/update", userData, {
      headers: { "Content-Type": "application/json" },
    });
    dispatch(updateSuccess(data.success));
  } catch (error) {
    dispatch(updateFail(error.response?.data?.message));
  }
};

// --- UPDATE PASSWORD ---
export const updatePassword = (passwords) => async (dispatch) => {
  try {
    dispatch(updateRequest());
    const { data } = await API.put("/v1/users/password/update", passwords);
    dispatch(updateSuccess(data.success));
  } catch (error) {
    dispatch(updateFail(error.response?.data?.message));
  }
};

// --- FORGOT PASSWORD ---
export const forgotPassword = (email) => async (dispatch) => {
  try {
    dispatch(forgotPasswordRequest());
    const { data } = await API.post("/v1/users/forgetPassword", { email });
    dispatch(forgotPasswordSuccess(data.message));
  } catch (error) {
    dispatch(forgotPasswordFail(error.response?.data?.message));
  }
};

// --- RESET PASSWORD ---
export const resetPassword = (token, passwords) => async (dispatch) => {
  try {
    dispatch(resetPasswordRequest());
    const { data } = await API.patch(`/v1/users/resetPassword/${token}`, passwords);
    dispatch(resetPasswordSuccess(data.success));
  } catch (error) {
    dispatch(resetPasswordFail(error.response?.data?.message));
  }
};
