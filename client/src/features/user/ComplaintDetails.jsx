import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { complaintService } from "../../services/complaintService.js";
import Navbar from "../../components/layout/Navbar.jsx";
import { ArrowLeft, Clock, User, MapPin } from "lucide-react";

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const data = await complaintService.getComplaint(id);
        setComplaint(data);
      } catch (err) {
        setError("Failed to load complaint details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {error || "Complaint not found"}
              </h1>
              <Link to="/user/dashboard" className="btn-primary">
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
              to="/user/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">
              Complaint Details
            </h1>
          </div>

          <div className="card">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {complaint.title}
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {complaint.status.replace("_", " ")}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Created: {new Date(complaint.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Location: {complaint.location}
                </div>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Priority: {complaint.priority}
                </div>
              </div>
            </div>

            <div className="space-y-6">
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

              {complaint.assigned_to && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Assigned Engineer
                  </h3>
                  <p className="text-gray-700">
                    {complaint.assigned_to.first_name}{" "}
                    {complaint.assigned_to.last_name}
                  </p>
                </div>
              )}

              {complaint.resolution_notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Resolution Notes
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {complaint.resolution_notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
