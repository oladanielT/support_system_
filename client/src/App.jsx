import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes, fallbackRoute } from "./routes.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import { useToast } from "./contexts/ToastContext.jsx";
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
  const { toast, toasts, dismiss } = useToast();

  // Sync offline complaints when online
  useEffect(() => {
    async function syncComplaints() {
      if (!navigator.onLine) return;

      const offlineComplaints = await getOfflineComplaints();
      for (const complaint of offlineComplaints) {
        try {
          await complaintService.createComplaint(complaint);
        } catch (e) {
          console.log("Failed to sync complaint:", complaint, e);
        }
      }

      if (offlineComplaints.length) {
        await clearOfflineComplaints();
        toast({
          title: "Success",
          description: "Offline complaints synced successfully!",
          variant: "success",
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

export default App;
