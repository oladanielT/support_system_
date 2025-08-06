import { useEffect, useState } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";
export default function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await API.get("/complaints/");
        setComplaints(res.data);
      } catch (err) {
        setError("Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  if (loading) return <p className="p-6">Loading complaints...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">My Complaints</h2>
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
