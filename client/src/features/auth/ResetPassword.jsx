import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext.jsx";
import API from "../../services/api"; // ✅ use your existing axios instance

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/password-reset-confirm/", {
        uid,
        token,
        password,
      });
      toast({
        title: "Success",
        description: "Password updated successfully!",
        variant: "success",
      });
      navigate("/login");
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="border p-2 w-full"
          required
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          className="border p-2 w-full"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
