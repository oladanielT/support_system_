import API from "./api.js";

export const userService = {
  // Get all users
  async getUsers(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await API.get(`/users/?${params}`);
    return response.data;
  },

  // Get single user
  async getUser(id) {
    const response = await API.get(`/users/${id}/`);
    return response.data;
  },

  // Update user
  async updateUser(id, userData) {
    const response = await API.put(`/users/${id}/`, userData);
    return response.data;
  },

  // Delete user
  async deleteUser(id) {
    const response = await API.delete(`/users/${id}/`);
    return response.data;
  },

  // Get engineers
  async getEngineers() {
    const response = await API.get("/users/?role=engineer");
    return response.data;
  },
};
