import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { complaintService } from "../../services/complaintService.js";
import { userService } from "../../services/userService.js";
import Navbar from "../../components/layout/Navbar.jsx";
import {
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  UserPlus,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // Fetch complaints and stats
  //       const complaintsData = await complaintService.getComplaints({
  //         limit: 5,
  //       });
  //       setRecentComplaints(complaintsData.results || complaintsData);

  //       // Mock stats - replace with actual API calls
  //       setStats({
  //         total_complaints: 127,
  //         pending_assignments: 23,
  //         active_engineers: 8,
  //         resolution_rate: 94,
  //       });
  //     } catch (err) {
  //       setError("Failed to load dashboard data");
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent complaints
        const complaintsData = await complaintService.getComplaints({
          limit: 5,
        });
        const complaintsArr = complaintsData.results || complaintsData;
        setRecentComplaints(complaintsArr);
        // Cache the latest 4 complaints
        localStorage.setItem(
          "recentComplaintsAdmin",
          JSON.stringify(complaintsArr.slice(0, 4))
        );

        // Fetch real stats from backend
        const realStats = await complaintService.getStats();
        const statsObj = {
          total_complaints: realStats.total_complaints,
          pending_assignments: realStats.pending_complaints,
          active_engineers: realStats.active_engineers || 0,
          resolution_rate: calculateResolutionRate(realStats),
        };
        setStats(statsObj);
        // Cache stats
        localStorage.setItem("dashboardStatsAdmin", JSON.stringify(statsObj));
      } catch (err) {
        // Try to load from cache if offline or failed
        const cached = localStorage.getItem("recentComplaintsAdmin");
        if (cached) {
          setRecentComplaints(JSON.parse(cached));
        }
        const cachedStats = localStorage.getItem("dashboardStatsAdmin");
        if (cachedStats) {
          setStats(JSON.parse(cachedStats));
        }
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  function calculateResolutionRate(stats) {
    const { resolved_complaints, total_complaints } = stats;
    if (!total_complaints) return 0;
    return Math.round((resolved_complaints / total_complaints) * 100);
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
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
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage complaints, engineers, and system overview
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {stats.total_complaints}
                  </h3>
                  <p className="text-sm text-gray-500">Total Complaints</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {stats.pending_assignments}
                  </h3>
                  <p className="text-sm text-gray-500">Pending Assignments</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {stats.active_engineers}
                  </h3>
                  <p className="text-sm text-gray-500">Active Engineers</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {stats.resolution_rate}%
                  </h3>
                  <p className="text-sm text-gray-500">Resolution Rate</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/admin/complaints"
                  className="flex items-center w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <AlertTriangle className="mr-3 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      View All Complaints
                    </p>
                    <p className="text-sm text-gray-500">
                      Manage and assign complaints
                    </p>
                  </div>
                </Link>

                <Link
                  to="/admin/users"
                  className="flex items-center w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <UserPlus className="mr-3 h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Manage Engineers
                    </p>
                    <p className="text-sm text-gray-500">
                      Add, edit, or remove engineers
                    </p>
                  </div>
                </Link>

                <Link
                  to="/admin/complaint-stats"
                  className="flex items-center w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <TrendingUp className="mr-3 h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">View Analytics</p>
                    <p className="text-sm text-gray-500">
                      System performance reports
                    </p>
                  </div>
                </Link>

                {/* <button className="flex items-center w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <TrendingUp className="mr-3 h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">View Analytics</p>
                    <p className="text-sm text-gray-500">
                      System performance reports
                    </p>
                  </div>
                </button> */}
              </div>
            </div>

            {/* Priority Complaints */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Priority Complaints
              </h2>
              <div className="space-y-3">
                {recentComplaints
                  .filter(
                    (c) => c.priority === "critical" || c.priority === "high"
                  )
                  .slice(0, 3)
                  .map((complaint) => (
                    <div
                      key={complaint.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {complaint.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          complaint.priority
                        )}`}
                      >
                        {complaint.priority}
                      </span>
                    </div>
                  ))}

                {recentComplaints.filter(
                  (c) => c.priority === "critical" || c.priority === "high"
                ).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No high priority complaints at the moment
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Complaints
            </h2>

            {recentComplaints.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No complaints yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Complaints will appear here as they are submitted.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {complaint.title}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                              complaint.priority
                            )}`}
                          >
                            {complaint.priority}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Category:</span>{" "}
                            {complaint.category}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>{" "}
                            {complaint.status.replace("_", " ")}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span>{" "}
                            {new Date(
                              complaint.created_at
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Link
                          to={`/admin/complaints/${complaint.id}`}
                          className="btn-primary text-sm"
                        >
                          Manage
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
