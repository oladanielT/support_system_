import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { complaintService } from "../../services/complaintService.js";
import Navbar from "../../components/layout/Navbar.jsx";
import { Plus, AlertCircle, Clock, CheckCircle, Clock10 } from "lucide-react";
import { getOfflineComplaints } from "../../lib/offlineDB.js";

export default function UserDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offlineComplaints, setOfflineComplaints] = useState([]);

  // useEffect(() => {
  //   const fetchComplaints = async () => {
  //     setLoading(true);
  //     try {
  //       const data = await complaintService.getComplaints({ limit: 5 });
  //       setComplaints(data.results || data);
  //     } catch (err) {
  //       setError("Failed to load complaints");
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchComplaints();
  // }, [location]);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const data = await complaintService.getComplaints({ limit: 5 });
        setComplaints(data.results || data);
        // Cache the latest 4 complaints
        localStorage.setItem(
          "recentComplaints",
          JSON.stringify((data.results || data).slice(0, 4))
        );
        // Fetch offline complaints
        const offline = await getOfflineComplaints();
        setOfflineComplaints(offline);
      } catch (err) {
        // Try to load from cache if offline or failed
        const cached = localStorage.getItem("recentComplaints");
        if (cached) {
          setComplaints(JSON.parse(cached));
        }
        setError("Failed to load complaints");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [location]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="mt-2 text-gray-600">
              Track your network support requests and submit new complaints
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <Link to="/user/complaints/new" className="block">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      New Complaint
                    </h3>
                    <p className="text-sm text-gray-500">Report an issue</p>
                  </div>
                </div>
              </Link>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {complaints.length}
                  </h3>
                  <p className="text-sm text-gray-500">Total Complaints</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {complaints.filter((c) => c.status === "pending").length}
                  </h3>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {complaints.filter((c) => c.status === "resolved").length}
                  </h3>
                  <p className="text-sm text-gray-500">Resolved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Complaints */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Complaints
              </h2>
            </div>

            {complaints.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No complaints yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by submitting your first complaint.
                </p>
                <div className="mt-6">
                  <Link to="/user/complaints/new" className="btn-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    New Complaint
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {offlineComplaints.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Pending Sync</h2>
                    <div className="space-y-4">
                      {offlineComplaints.map((c, idx) => (
                        <div
                          key={c.id || idx}
                          className="bg-yellow-50 p-4 rounded shadow flex items-center justify-between"
                        >
                          <div>
                            <h3 className="text-lg font-bold flex items-center">
                              <Clock10 className="h-5 w-5 text-yellow-500 mr-2" />
                              {c.title || "(No Title)"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {c.category}
                            </p>
                            <p className="text-xs text-yellow-700 mt-1 font-semibold">
                              Pending Sync
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            (Offline)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(complaint.status)}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {complaint.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {complaint.category} •{" "}
                            {new Date(
                              complaint.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {complaint.status.replace("_", " ")}
                        </span>
                        <Link
                          to={`/user/complaints/${complaint.id}`}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
