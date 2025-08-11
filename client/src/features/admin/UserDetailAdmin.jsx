import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userService } from "../../services/userService";

export default function UserDetailAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    userService.getUser(id).then(setUser);
  }, [id]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/users")}
        className="mb-6 inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
      >
        ← Back to Manage Users
      </button>

      {/* User Card */}
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-6 border">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
          User Details
        </h2>

        <div className="space-y-4">
          <p className="text-gray-700">
            <span className="font-semibold">Name:</span> {user.first_name}{" "}
            {user.last_name}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p className="text-gray-700 capitalize">
            <span className="font-semibold">Role:</span> {user.role}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded text-sm ${
                user.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.is_active ? "Active" : "Inactive"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
