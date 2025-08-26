import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes, fallbackRoute } from "./routes.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import { useToast } from "./contexts/ToastContext.jsx";
import { Toaster } from "./components/ui/Toast.jsx";
import { LoadingSpinner } from "./components/ui/LoadingSpinner.jsx";

import { useEffect } from "react";
import { ComplaintSyncProvider } from "./contexts/ComplaintSyncContext.jsx";
import {
  getOfflineComplaints,
  clearOfflineComplaints,
  removeOfflineComplaintByTempId,
} from "./lib/offlineDB.js";
import { complaintService } from "./services/complaintService.js";

function App() {
  const { loading } = useAuth();
  const { toast, toasts, dismiss } = useToast();

  // Sync offline complaints when online
  useEffect(() => {
    async function syncComplaints() {
      if (!navigator.onLine) return;

      const offlineComplaints = await getOfflineComplaints();
      if (!offlineComplaints.length) return;

      const failedComplaints = [];
      const successfulComplaints = [];

      for (const complaint of offlineComplaints) {
        try {
          await complaintService.createComplaint(complaint);
          successfulComplaints.push(complaint);
        } catch (e) {
          failedComplaints.push(complaint);
          if (e?.response?.data) {
            console.log(
              "Failed to sync complaint:",
              complaint,
              e.response.data
            );
          } else {
            console.log("Failed to sync complaint:", complaint, e);
          }
        }
      }

      // Remove only the successfully synced complaints from offline storage
      for (const synced of successfulComplaints) {
        if (synced.tempId) {
          await removeOfflineComplaintByTempId(synced.tempId);
        }
      }

      // Notify UI to update offline complaints (for ComplaintList)
      if (successfulComplaints.length) {
        window.dispatchEvent(new Event("offlineComplaintsUpdated"));
      }

      if (successfulComplaints.length || failedComplaints.length) {
        toast({
          title: failedComplaints.length
            ? successfulComplaints.length
              ? "Partial Sync"
              : "Sync Failed"
            : "Success",
          description: failedComplaints.length
            ? `${successfulComplaints.length} complaint(s) synced, ${failedComplaints.length} failed. Check console for details.`
            : "Offline complaints synced successfully!",
          variant: failedComplaints.length ? "warning" : "success",
          duration: 5000,
        });
      }
    }

    window.addEventListener("online", syncComplaints);
    syncComplaints(); // Initial sync

    return () => window.removeEventListener("online", syncComplaints);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {publicRoutes.map((route, idx) => (
            <Route key={idx} path={route.path} element={route.element} />
          ))}

          {privateRoutes.map((route, idx) => (
            <Route key={idx} path={route.path} element={route.element} />
          ))}

          <Route path={fallbackRoute.path} element={fallbackRoute.element} />
        </Routes>

        {/* Toast notifications */}
        <Toaster toasts={toasts} onDismiss={dismiss} />
      </div>
    </Router>
  );
}

// Wrap App with ComplaintSyncProvider
export default function AppWithSyncProvider(props) {
  return (
    <ComplaintSyncProvider>
      <App {...props} />
    </ComplaintSyncProvider>
  );
}
