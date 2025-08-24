import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { complaintService } from "../../services/complaintService";
import Navbar from "../../components/layout/Navbar.jsx";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../../contexts/ToastContext.jsx";

export default function EditComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    priority: "Low",
    category: "",
    description: "",
  });

  useEffect(() => {
    async function loadComplaint() {
      try {
        const data = await complaintService.getComplaint(id);
        setFormData(data);
      } catch (err) {
        console.error("Error loading complaint", err);
      }
    }
    loadComplaint();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await complaintService.updateComplaint(id, formData);
      toast({
        title: "Success",
        description: "Complaint updated successfully",
        variant: "success",
      });
      navigate(`/user/complaints/${id}`);
    } catch (err) {
      toast({
        title: "Error",
        description: "Error updating complaint",
        variant: "destructive",
      });
      console.error("Error updating complaint", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <Link
              to={`/user/complaints/${id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Complaint Details
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Complaint</h1>
            <p className="mt-2 text-gray-600">
              Update your complaint details below
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Title"
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location"
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                {/* <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Category"
                  className="input-field"
                  required
                /> */}

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="network_slow">Network Slow</option>
                  <option value="network_down">Network Down</option>
                  <option value="wifi_issues">WiFi Issues</option>
                  <option value="server_issues">Server Issues</option>
                  <option value="email_issues">Email Issues</option>
                  <option value="internet">Internet Connectivity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                rows={6}
                className="input-field"
              />

              <button type="submit" className="flex-1 btn-primary">
                Update
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
