

import axios from "axios";

const hostname = window.location.hostname;
const tenantName = hostname.split('.')[0];

const baseURL = `https://${tenantName}.backend.vanloka.com/api/`;
export const tenantAsset = `https://${tenantName}.backend.vanloka.com/tenancy/assets/`


export const centralAsset = `https://backend.vanloka.com/storage/`
export const centralUrl = `https://backend.vanloka.com/api`

const tenantApi = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Correct for Sanctum
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 2. CONFIGURE INTERCEPTOR WITH THE CORRECT LOCAL STORAGE KEY
tenantApi.interceptors.request.use(
  (config) => {
    // We will consistently use the key 'token'
    const token = localStorage.getItem("token");

    if (token) {
      // Laravel Sanctum expects the token prefixed with 'Bearer '
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// This response interceptor is great, let's keep it but use the correct key
tenantApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a 401 error AND we are NOT on the login page
    if (
      error.response &&
      error.response.status === 401 &&
      window.location.pathname !== "/login" // <-- THIS IS THE FIX
    ) {
      console.error("Unauthorized access!.. Redirecting to login.");
      localStorage.removeItem("token");
      window.location.href = "/login"; // Only redirect if we're not already there
    }
    return Promise.reject(error);
  },
);

export default tenantApi;
