import type { User } from "../Types/Index";
import tenantApi from "./ApiService";

export const login = async ({ email, password }: User) => {
  // Use our configured adminApiService instance
  const response = await tenantApi.post("/tenant-login", { email, password });

  // When login is successful, save the token to localStorage
  if (response.data.token) {
    // 3. CONSISTENTLY SAVE THE TOKEN UNDER THE KEY 'token'
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
};

export const logout = () => {
  // 4. CONSISTENTLY REMOVE THE TOKEN UNDER THE KEY 'token'
  localStorage.removeItem("token");
  // Optionally, you can also redirect here or in the component
  // window.location.href = "/login";
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// This function will be used by your ProtectedRoute
export const isLoggedIn = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token; // Returns true if token exists, false otherwise
};
