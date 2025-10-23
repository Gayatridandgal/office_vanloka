// src/services/authService.ts
import axios from "axios";
import type { User } from "../Types/Index";

const API_URL = "http://localhost:3000/api/";

export const register = ({ username, email, password }: User) => {
  return axios.post(API_URL + "register", { username, email, password });
};

export const login = ({ email, password }: User) => {
  return axios.post(API_URL + "login", { email, password }).then((response) => {
    if (response.data.token) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  });
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) return JSON.parse(userStr);
  return null;
};
