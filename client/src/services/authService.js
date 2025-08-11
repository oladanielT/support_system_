import API from "./api.js";

export const authService = {
  async login(email, password) {
    const response = await API.post("/auth/login/", { email, password });
    return response.data;
  },

  async register(userData) {
    const response = await API.post("/auth/register/", userData);
    return response.data;
  },

  async getCurrentUser() {
    const response = await API.get("/auth/profile/");
    return response.data;
  },

  async logout() {
    localStorage.removeItem("token");
  },
};
