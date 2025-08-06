import API from "./api.js";

export const complaintService = {
  // Get all complaints
  async getComplaints(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await API.get(`/complaints/?${params}`);
    return response.data;
  },

  // Get single complaint
  async getComplaint(id) {
    const response = await API.get(`/complaints/${id}/`);
    return response.data;
  },

  // Create new complaint
  async createComplaint(complaintData) {
    const response = await API.post("/complaints/", complaintData);
    return response.data;
  },

  // Update complaint
  async updateComplaint(id, complaintData) {
    const response = await API.put(`/complaints/${id}/`, complaintData);
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
    const response = await API.patch(`/complaints/${id}/assign/`, {
      engineer_id: engineerId,
    });
    return response.data;
  },
};
