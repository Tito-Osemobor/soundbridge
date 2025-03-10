import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, // Backend URL
  withCredentials: true, // Ensures cookies are sent with requests
});

export default api;
