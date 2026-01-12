import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
  throw new Error("Missing EXPO_PUBLIC_API_BASE_URL in environment variables");
}

let URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: URL, 
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token and log requests
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
    }
    
    console.log("🔵 [axios] Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
    });
    
    return config;
  },
  (error) => {
    console.error("🔴 [axios] Request error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("🟢 [axios] Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("🔴 [axios] Response error:", {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
      url: error?.config?.url,
      baseURL: error?.config?.baseURL,
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
