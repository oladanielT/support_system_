import { useEffect, useState } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";
import { Clock10 } from "lucide-react";
import { getOfflineComplaints } from "../../lib/offlineDB.js";

export default function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offlineComplaints, setOfflineComplaints] = useState([]);

  // useEffect(() => {
  //   const fetchComplaints = async () => {
  //     try {
  //       const res = await API.get("/complaints/");
  //       setComplaints(res.data);
  //     } catch (err) {
  //       setError("Failed to load complaints");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchComplaints();
  // }, []);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await API.get("/complaints/");
        setComplaints(res.data);
        // Cache the latest 4 complaints
        localStorage.setItem(
          "recentComplaints",
          JSON.stringify(res.data.slice(0, 4))
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
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();

    // Listen for offlineComplaintsUpdated event to refresh offline complaints in real time
    const handleOfflineUpdate = async () => {
      const offline = await getOfflineComplaints();
      setOfflineComplaints(offline);
    };
    window.addEventListener("offlineComplaintsUpdated", handleOfflineUpdate);
    return () => {
      window.removeEventListener(
        "offlineComplaintsUpdated",
        handleOfflineUpdate
      );
    };
  }, []);

  if (loading) return <p className="p-6">Loading complaints...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">My Complaints</h2>
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
                  <p className="text-sm text-gray-600">{c.category}</p>
                  <p className="text-xs text-yellow-700 mt-1 font-semibold">
                    Pending Sync
                  </p>
                </div>
                <span className="text-xs text-gray-400">(Offline)</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {complaints.length === 0 ? (
        <p>No complaints submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">{c.title}</h3>
                  <p className="text-sm text-gray-600">{c.category}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Status: {c.status}
                  </p>
                </div>
                <Link
                  to={`/user/complaints/${c.id}`}
                  className="text-sm text-blue-500 hover:underline"
                >
                  View
                </Link>
              </div>
              <p className="text-sm mt-2">
                Priority: <span className="font-medium">{c.priority}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Submitted: {new Date(c.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
