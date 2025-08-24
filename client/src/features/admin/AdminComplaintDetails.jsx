import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { complaintService } from "../../services/complaintService.js";
import { userService } from "../../services/userService.js";
import Navbar from "../../components/layout/Navbar.jsx";
import { ArrowLeft, Clock, User, MapPin, UserCheck } from "lucide-react";
// import { toast } from "react-toastify";
import { useToast } from "../../contexts/ToastContext.jsx";

export default function AdminComplaintDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEngineer, setSelectedEngineer] = useState("");
  console.log(id, "here");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintData, engineersData] = await Promise.all([
          complaintService.getComplaint(id),
          userService.getEngineers().catch(() => []),
        ]);
        setComplaint(complaintData);
        setEngineers(engineersData);
        setSelectedEngineer(complaintData.assigned_to?.id || "");
        console.log(engineersData);
      } catch (err) {
        setError("Failed to load complaint details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  console.log(engineers);

  // const handleAssignEngineer = async (e) => {
  //   e.preventDefault();
  //   if (!selectedEngineer) return;

  //   setAssigning(true);
  //   setError(null);

  //   try {
  //     const updatedComplaint = await complaintService.assignComplaint(
  //       id,
  //       selectedEngineer
  //     );
  //     setComplaint(updatedComplaint.complaint);
  //     toast.success("Engineer assigned successfully!");
  //   } catch (err) {
  //     console.log("Failed to assign engineer:", err);
  //     setError("Failed to assign engineer. Please try again.");
  //   } finally {
  //     setAssigning(false);
  //   }
  // };

  const handleAssignEngineer = async (e) => {
    e.preventDefault();
    if (!selectedEngineer) return;

    setAssigning(true);
    setError(null);

    try {
      const updatedComplaint = await complaintService.assignComplaint(
        id,
        selectedEngineer
      );
      setComplaint(updatedComplaint.complaint);

      toast({
        title: "Success",
        description: "Engineer assigned successfully!",
        variant: "success",
      });
    } catch (err) {
      console.log("Failed to assign engineer:", err);
      setError("Failed to assign engineer. Please try again.");

      toast({
        title: "Error",
        description: "Failed to assign engineer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
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
    console.log("Error :", error);
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {error || "Complaint not found"}
              </h1>
              <Link to="/admin/dashboard" className="btn-primary">
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
              to="/admin/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">
              Manage Complaint
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
                  {complaint?.status?.replace("_", " ") ?? ""}
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

                {complaint.assigned_to && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Currently Assigned To
                    </h3>
                    <p className="text-gray-700">
                      {complaint.assigned_to.first_name}{" "}
                      {complaint.assigned_to.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {complaint.assigned_to.email}
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

            {/* Assignment Form */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Assign Engineer
              </h2>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleAssignEngineer} className="space-y-4">
                <div>
                  <label
                    htmlFor="engineer"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select Engineer
                  </label>
                  <select
                    id="engineer"
                    value={selectedEngineer}
                    onChange={(e) => setSelectedEngineer(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Choose an engineer...</option>
                    {engineers.map((engineer) => (
                      <option key={engineer.id} value={engineer.id}>
                        {/* {engineer.first_name} {engineer.last_name} -{" "}
                        {engineer.department} */}
                        Engineer {engineer.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={assigning || !selectedEngineer}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  {assigning ? "Assigning..." : "Assign Engineer"}
                </button>
              </form>

              {engineers.length === 0 && (
                <div className="mt-4 text-center text-gray-500">
                  <p>No engineers available for assignment.</p>
                  <Link
                    to="/admin/users"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Manage Engineers
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
