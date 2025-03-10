import api from "@/services/api";

export const fetchUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
