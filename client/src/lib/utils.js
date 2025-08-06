export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status) {
  const colors = {
    pending: "warning",
    assigned: "info",
    in_progress: "info",
    resolved: "success",
    closed: "secondary",
  };
  return colors[status] || "default";
}

export function getPriorityColor(priority) {
  const colors = {
    low: "success",
    medium: "warning",
    high: "destructive",
    critical: "destructive",
  };
  return colors[priority] || "default";
}
