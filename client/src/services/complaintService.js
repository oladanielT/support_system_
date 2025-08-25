import API from "./api.js";

export const complaintService = {
  // Get all complaints
  async getComplaints(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await API.get(`/complaints/?${params}`);
    return response.data;
  },

  getAllComplaints: async () => {
    const res = await API.get("/complaints/");
    return res.data;
  },
  // Get single complaint
  async getComplaint(id) {
    const response = await API.get(`/complaints/${id}/`);
    return response.data;
  },

  // Create new complaint
  // async createComplaint(complaintData) {
  //   const response = await API.post("/complaints/", complaintData);
  //   return response.data;
  // },
  createComplaint: async (complaint) => {
    try {
      const response = await API.post("/complaints/", complaint);
      return response.data;
    } catch (err) {
      console.log("Online complaint submission failed:", err);

      // Check if it's a network issue
      if (!navigator.onLine || err.message === "Network Error") {
        // Save complaint offline instead
        await saveComplaintOffline(complaint);
        return {
          ...complaint,
          id: Date.now(),
          offline: true,
        };
      }

      // If it's not a network error, rethrow
      throw err;
    }
  },

  // Update complaint
  async updateComplaint(id, complaintData) {
    const response = await API.put(`/complaints/${id}/`, complaintData);
    return response.data;
  },

  // Delete complaint
  async deleteComplaint(id) {
    const response = await API.delete(`/complaints/${id}/`);
    return response.data;
  },

  // Update complaint status
  async updateComplaintStatus(id, status, notes = "") {
    const response = await API.patch(`/complaints/${id}/status/`, {
      status,
      resolution_notes: notes,
    });
    return response.data;
  },

  // Assign complaint to engineer
  async assignComplaint(id, engineerId) {
    const response = await API.post(`/complaints/${id}/assign/`, {
      engineer_id: engineerId,
    });
    return response.data;
  },

  getStats: async () => {
    const response = await API.get(`/complaints/complaint-stats/`);
    return response.data;
  },
};
