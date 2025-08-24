import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { complaintService } from "../../services/complaintService.js";
import Navbar from "../../components/layout/Navbar.jsx";
import { ArrowLeft, Clock, User, MapPin, Trash2 } from "lucide-react";
import { useToast } from "../../contexts/ToastContext.jsx";
// import { toast } from "react-toastify";

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const data = await complaintService.getComplaint(id);
        setComplaint(data);
      } catch (err) {
        setError("Failed to load complaint details");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  const handleDelete = async () => {
    try {
      await complaintService.deleteComplaint(id);
      toast({
        title: "Success",
        description: "Complaint deleted successfully.",
        variant: "success",
      });
      navigate("/user/dashboard");
    } catch (err) {
      console.error("Failed to delete complaint:", err);
      toast({
        title: "Error",
        description: "Something went wrong while deleting.",
        variant: "destructive",
      });
    } finally {
      setShowConfirm(false);
    }
  };

  // const handleDelete = async () => {
  //   try {
  //     await complaintService.deleteComplaint(id);
  //     toast.success("Complaint deleted successfully");
  //     navigate("/user/dashboard");
  //   } catch (err) {
  //     console.error("Failed to delete complaint:", err);
  //     toast.error("Something went wrong while deleting.");
  //   } finally {
  //     setShowConfirm(false);
  //   }
  // };

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
              <div className="flex justify-end space-x-4 mt-8">
                <Link
                  to={`/user/complaints/${complaint.id}/edit`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Edit Complaint
                </Link>
                {/* <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Delete
                </button> */}

                <button
                  onClick={() => setShowConfirm(true)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Confirmation dialog */}
                {showConfirm && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-dialog-title"
                  >
                    <div
                      className="bg-white p-6 rounded shadow-md max-w-sm w-full text-center"
                      tabIndex="-1"
                    >
                      <p
                        id="delete-dialog-title"
                        className="mb-4 text-lg font-medium"
                      >
                        Are you sure you want to delete this complaint?
                      </p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={handleDelete}
                          className="btn-primary px-4 py-2"
                          aria-label="Confirm delete complaint"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setShowConfirm(false)}
                          className="btn-secondary px-4 py-2"
                          aria-label="Cancel delete complaint"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
