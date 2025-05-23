import api from "@/services/api";
import {API_ENDPOINTS} from "@/constants/endpoints";

export const fetchUser = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);

    if (response.status !== 200) {
      console.warn("User not authenticated");
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    if (response.status !== 200) {
      throw new Error("Failed to log out");
    }
    return { success: true };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false, message: error.response?.data?.message || "Logout failed" };
  }
};

export const registerUser = async (email, password, reEnterPassword) => {
  try {
    const response = await api.post( API_ENDPOINTS.AUTH.REGISTER, {
      email,
      password,
      reEnterPassword
    });

    if (response.status !== 200) {
      throw new Error("Registration failed");
    }

    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, message: error.response?.data?.message || "Registration failed" };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });

    if (response.status !== 200) {
      return { success: false, message: response.data?.message || "Login failed" }; // ✅ Handle error response
    }

    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, message: error.response?.data?.message || "Login failed" };
  }
};
