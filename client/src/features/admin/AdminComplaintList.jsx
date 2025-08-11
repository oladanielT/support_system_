import React, { useEffect, useState } from "react";
import { complaintService } from "../../services/complaintService";
import Navbar from "../../components/layout/Navbar";
import { Loader2 } from "lucide-react";

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
        console.log(data.results);
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
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">All Complaints (Admin View)</h2>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
            <span className="ml-2 text-gray-500">Loading complaints...</span>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : complaints.length === 0 ? (
          <p>No complaints found.</p>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="border rounded-lg shadow hover:shadow-lg transition p-4 bg-white w-full"
              >
                <h3 className="font-semibold text-lg mb-2">{c.title}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Status:</span> {c.status}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Priority:</span> {c.priority}
                </p>
                <div className="flex justify-end">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">Submitted By:</span>{" "}
                      {c.submitted_by?.email || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Assigned To:</span>
                      {" Engineer "}
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
