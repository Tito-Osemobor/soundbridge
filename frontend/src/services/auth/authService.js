import api from "@/services/api";

export const logoutUser = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

export const fetchUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const registerUser = async (email, password, reEnterPassword) => {
  try {
    const response = await api.post("/auth/register", {
      email,
      password,
      reEnterPassword
    });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    return {success: false, message: error.response?.data?.message || "Registration failed"};
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/auth/login", {email, password});
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    return {success: false, message: error.response?.data?.message || "Login failed"};
  }
};
