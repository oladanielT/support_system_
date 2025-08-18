import API from "./api.js";

// Fetch all notifications
export const getNotifications = async () => {
  try {
    const res = await API.get("/notifications/");
    // Works for paginated and non-paginated responses
    if (Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res.data.results)) {
      return res.data.results;
    }
    return [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// Mark a single notification as read
export const markNotificationRead = async (id) => {
  try {
    await API.patch(`/notifications/${id}/read/`);
    return true;
  } catch (error) {
    console.error(`Error marking notification ${id} as read:`, error);
    return false;
  }
};

// Mark ALL notifications as read
export const markAllNotificationsRead = async () => {
  try {
    await API.post("/notifications/mark-all-read/");
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

// Get unread count for the current user
export const getUnreadCount = async () => {
  try {
    const res = await API.get("/notifications/unread-count/");
    return res.data.unread_count ?? 0;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
};


// Delete all notifications
export const clearNotifications = async () => {
  try {
    await API.delete("/notifications/clear/");
    return true;
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return false;
  }
};
