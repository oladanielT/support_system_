import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { complaintService } from "../../services/complaintService.js";
import Navbar from "../../components/layout/Navbar.jsx";
import { Wrench, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function EngineerDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const complaintsData = await complaintService.getComplaints({
          assigned_to: user.id,
        });
        const complaintsArray = complaintsData.results || complaintsData;
        setComplaints(complaintsArray);
        // Cache the latest 4 complaints
        localStorage.setItem(
          "recentComplaintsEngineer",
          JSON.stringify(complaintsArray.slice(0, 4))
        );

        const resolvedToday = complaintsArray.filter((c) => {
          return (
            c.status === "resolved" &&
            new Date(c.resolved_at).toDateString() === new Date().toDateString()
          );
        }).length;

        const resolvedComplaints = complaintsArray.filter((c) => {
          return (
            c.status === "resolved" &&
            new Date(c.resolved_at).toDateString() === new Date().toDateString()
          );
        });

        let avgResolution = "N/A";
        if (resolvedComplaints.length > 0) {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          const totalMs = resolvedComplaints.reduce((acc, c) => {
            const resolved = new Date(c.resolved_at);
            return acc + (resolved - startOfToday);
          }, 0);

          const avgHours =
            totalMs / resolvedComplaints.length / (1000 * 60 * 60);
          avgResolution = `${avgHours.toFixed(1)}h`;
        }

        setStats({
          assigned: complaintsArray.length,
          in_progress: complaintsArray.filter((c) => c.status === "in_progress")
            .length,
          resolved_today: resolvedToday,
          avg_resolution: avgResolution,
        });
      } catch (err) {
        // Try to load from cache if offline or failed
        const cached = localStorage.getItem("recentComplaintsEngineer");
        if (cached) {
          setComplaints(JSON.parse(cached));
        }
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id, location.key]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const complaintsData = await complaintService.getComplaints({
          assigned_to: user.id,
        });
        const complaintsArray = complaintsData.results || complaintsData;
        setComplaints(complaintsArray);
        // Cache the latest 4 complaints
        localStorage.setItem(
          "recentComplaintsEngineer",
          JSON.stringify(complaintsArray.slice(0, 4))
        );

        const resolvedToday = complaintsArray.filter((c) => {
          return (
            c.status === "resolved" &&
            new Date(c.resolved_at).toDateString() === new Date().toDateString()
          );
        }).length;

        const resolvedComplaints = complaintsArray.filter((c) => {
          return (
            c.status === "resolved" &&
            new Date(c.resolved_at).toDateString() === new Date().toDateString()
          );
        });

        let avgResolution = "N/A";
        if (resolvedComplaints.length > 0) {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          const totalMs = resolvedComplaints.reduce((acc, c) => {
            const resolved = new Date(c.resolved_at);
            return acc + (resolved - startOfToday);
          }, 0);

          const avgHours =
            totalMs / resolvedComplaints.length / (1000 * 60 * 60);
          avgResolution = `${avgHours.toFixed(1)}h`;
        }

        const statsObj = {
          assigned: complaintsArray.length,
          in_progress: complaintsArray.filter((c) => c.status === "in_progress")
            .length,
          resolved_today: resolvedToday,
          avg_resolution: avgResolution,
        };
        setStats(statsObj);
        // Cache stats
        localStorage.setItem(
          "dashboardStatsEngineer",
          JSON.stringify(statsObj)
        );
      } catch (err) {
        // Try to load from cache if offline or failed
        const cached = localStorage.getItem("recentComplaintsEngineer");
        if (cached) {
          setComplaints(JSON.parse(cached));
        }
        const cachedStats = localStorage.getItem("dashboardStatsEngineer");
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
  }, [user.id, location.key]);
  //           totalMs / resolvedComplaints.length / (1000 * 60 * 60);
  //         avgResolution = `${avgHours.toFixed(1)}h`;
  //       }

  //       setStats({
  //         assigned: complaintsArray.length,
  //         in_progress: complaintsArray.filter((c) => c.status === "in_progress")
  //           .length,
  //         resolved_today: resolvedToday,
  //         avg_resolution: avgResolution,
  //       });

  //       // setStats({
  //       //   assigned: complaintsArray.length,
  //       //   in_progress: complaintsArray.filter((c) => c.status === "in_progress")
  //       //     .length,
  //       //   resolved_today: 3,
  //       //   avg_resolution: "2.4h",
  //       // });
  //     } catch (err) {
  //       setError("Failed to load dashboard data");
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [user.id]);

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
              Engineer Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your assigned complaints and track resolution progress
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
                  <Wrench className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {stats.assigned}
                  </h3>
                  <p className="text-sm text-gray-500">Assigned Tasks</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {stats.in_progress}
                  </h3>
                  <p className="text-sm text-gray-500">In Progress</p>
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
                    {stats.resolved_today}
                  </h3>
                  <p className="text-sm text-gray-500">Resolved Today</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {stats.avg_resolution}
                  </h3>
                  <p className="text-sm text-gray-500">Avg Resolution Time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Complaints */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Assigned Complaints
              </h2>
            </div>

            {complaints.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No complaints assigned
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any complaints assigned to you yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
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
                            <span className="font-medium">Location:</span>{" "}
                            {complaint.location}
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
                          to={`/engineer/complaints/${complaint.id}`}
                          className="btn-primary text-sm"
                        >
                          View & Update
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
