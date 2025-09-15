import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "https://fullstack-crypto-app.onrender.com/api",  // deployed backend
  withCredentials: true, // <-- super important
});