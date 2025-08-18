// src/features/admin/UserEditAdmin.jsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { userService } from "../../services/userService";
import { ArrowLeft } from "lucide-react";

export default function UserEditAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    userService.getUser(id).then((data) => {
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        role: data.role,
        is_active: data.is_active,
      });
    });
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await userService.updateUser(id, formData);
    navigate("/admin/users");
  }

  console.log(formData);

  if (!formData) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
      <h2 className="text-xl font-bold">Edit User</h2>

      <input
        type="text"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        className="border p-2 w-full"
        placeholder="First Name"
      />

      <input
        type="text"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        className="border p-2 w-full"
        placeholder="Last Name"
      />

      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="border p-2 w-full"
        placeholder="Email"
      />

      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="user">User</option>
        <option value="engineer">Engineer</option>
        <option value="admin">Admin</option>
      </select>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
        />
        <span>Active</span>
      </label>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Changes
      </button>
    </form>
  );
}
