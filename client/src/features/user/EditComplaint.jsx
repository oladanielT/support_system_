import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { complaintService } from "../../services/complaintService";

export default function EditComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      alert("Complaint updated successfully");
      navigate(`/user/complaints/${id}`);
    } catch (err) {
      console.error("Error updating complaint", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Edit Complaint</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="input"
        />
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="input"
        />
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="input"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          className="input"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="input"
        ></textarea>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Update
        </button>
      </form>
    </div>
  );
}
