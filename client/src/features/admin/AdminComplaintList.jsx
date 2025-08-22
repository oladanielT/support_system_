import React, { useEffect, useState } from "react";
import { complaintService } from "../../services/complaintService";
import Navbar from "../../components/layout/Navbar";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  default: "bg-gray-100 text-gray-800",
};

const AdminComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await complaintService.getAllComplaints();
        setComplaints(data.results);
      } catch (err) {
        console.error("Error fetching admin complaints:", err);
        setError(err.response?.data?.detail || "Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          All Complaints (Admin View)
        </h2>

        <Link
          to="/admin/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            <Loader2 className="animate-spin w-8 h-8 mr-2" />
            Loading complaints...
          </div>
        ) : error ? (
          <p className="text-red-500 font-medium">{error}</p>
        ) : complaints.length === 0 ? (
          <p className="text-gray-600">No complaints found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-xl transition p-5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    Issue: {c.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        statusColors[c.status] || statusColors.default
                      }`}
                    >
                      {c.status.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                      Priority: {c.priority}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Submitted By:</span>{" "}
                      {c.submitted_by?.email || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Assigned To:</span>{" "}
                      {c.assigned_to?.first_name || "Unassigned"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminComplaintList;
