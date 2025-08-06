import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { complaintService } from "../../services/complaintService.js";
import Navbar from "../../components/layout/Navbar.jsx";
import { ArrowLeft, Clock, User, MapPin, Save } from "lucide-react";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export default function EngineerComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const data = await complaintService.getComplaint(id);
        setComplaint(data);
        setStatus(data.status);
        setNotes(data.resolution_notes || "");
      } catch (err) {
        setError("Failed to load complaint details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      const updatedComplaint = await complaintService.updateComplaintStatus(
        id,
        status,
        notes
      );
      setComplaint(updatedComplaint);
      alert("Complaint updated successfully!");
    } catch (err) {
      console.error("Failed to update complaint:", err);
      setError("Failed to update complaint. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {error || "Complaint not found"}
              </h1>
              <Link to="/engineer/dashboard" className="btn-primary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              to="/engineer/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">
              Complaint Details & Update
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Complaint Details */}
            <div className="card">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {complaint.title}
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2">
                  {complaint.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{complaint.location}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="font-medium">Priority:</span>
                    <span className="ml-2 capitalize">
                      {complaint.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {complaint.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Category
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {complaint.category}
                  </span>
                </div>

                {complaint.submitted_by && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Submitted By
                    </h3>
                    <p className="text-gray-700">
                      {complaint.submitted_by.first_name}{" "}
                      {complaint.submitted_by.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {complaint.submitted_by.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Update Form */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Update Status & Notes
              </h2>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input-field"
                    required
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Resolution Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    className="input-field"
                    placeholder="Add notes about the resolution, steps taken, or any additional information..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updating ? "Updating..." : "Update Complaint"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
