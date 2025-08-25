import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { complaintService } from "../../services/complaintService.js";
import Navbar from "../../components/layout/Navbar.jsx";
import { useToast } from "../../contexts/ToastContext.jsx";

const categories = [
  { value: "network_slow", label: "Network Slow" },
  { value: "network_down", label: "Network Down" },
  { value: "wifi_issues", label: "WiFi Issues" },
  { value: "server_issues", label: "Server Issues" },
  { value: "email_issues", label: "Email Issues" },
  { value: "internet", label: "Internet Connectivity" },
  { value: "other", label: "Other" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "medium",
    description: "",
    location: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Frontend validation for title and description length
    if (formData.title.trim().length < 5) {
      setError("Title must be at least 5 characters long.");
      setLoading(false);
      return;
    }
    if (formData.description.trim().length < 10) {
      setError("Description must be at least 10 characters long.");
      setLoading(false);
      return;
    }

    try {
      const complaint = await complaintService.createComplaint(formData);

      if (complaint.offline) {
        toast({
          title: "Saved Offline",
          description:
            "Complaint saved offline. It will sync automatically when online.",
          variant: "info",
        });
      } else {
        toast({
          title: "Success",
          description: "Complaint submitted successfully!",
          variant: "success",
        });
      }

      navigate("/user/dashboard");
    } catch (err) {
      console.error("Error submitting complaint:", err);
      setError("Failed to submit complaint. Please try again.");
      toast({
        title: "Error",
        description: "Failed to submit complaint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError(null);

  //   if (navigator.onLine) {
  //     try {
  //       await complaintService.createComplaint(formData);
  //       navigate("/user/dashboard");
  //     } catch (err) {
  //       console.error("Failed to submit complaint:", err);
  //       setError("Failed to submit complaint. Please try again.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   } else {
  //     try {
  //       await saveComplaintOffline(formData);
  //       toast.info(
  //         "No internet connection: complaint saved offline and will sync automatically when back online."
  //       );
  //       setLoading(false);
  //       navigate("/user/dashboard");
  //     } catch (err) {
  //       console.error("Failed to save complaint offline:", err);
  //       setError("Failed to save complaint offline. Please try again.");
  //       setLoading(false);
  //     }
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Submit New Complaint
            </h1>
            <p className="mt-2 text-gray-600">
              Report network-related issues for quick resolution
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Issue Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Building, Floor, Room number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Priority *
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Detailed Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="input-field"
                  placeholder="Please provide detailed information about the issue, including any error messages, when it started, and steps you've already tried..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Submit Complaint"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/user/dashboard")}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
