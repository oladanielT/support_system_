import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes, fallbackRoute } from "./routes.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import { useToast } from "./components/hooks/useToast.js";
import { Toaster } from "./components/ui/Toast.jsx";
import { LoadingSpinner } from "./components/ui/LoadingSpinner.jsx";

import { useEffect } from "react";
import {
  getOfflineComplaints,
  clearOfflineComplaints,
} from "./lib/offlineDB.js";
import { complaintService } from "./services/complaintService.js";

function App() {
  const { loading } = useAuth();
  const { toasts, dismiss } = useToast();

  useEffect(() => {
    async function syncComplaints() {
      if (navigator.onLine) {
        const offlineComplaints = await getOfflineComplaints();
        for (const complaint of offlineComplaints) {
          try {
            await complaintService.createComplaint(complaint);
          } catch (e) {
            console.error("Failed to sync complaint:", complaint, e);
          }
        }
        if (offlineComplaints.length) {
          await clearOfflineComplaints();
          alert("Offline complaints synced successfully!");
        }
      }
    }

    window.addEventListener("online", syncComplaints);
    syncComplaints(); // Try syncing once on app start if online

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
          {/* Public Routes */}
          {publicRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          {/* Private Routes */}
          {privateRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          {/* Fallback Route */}
          <Route path={fallbackRoute.path} element={fallbackRoute.element} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster toasts={toasts} onDismiss={dismiss} />
      </div>
    </Router>
  );
}

export default App;
