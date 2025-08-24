import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext.jsx";
import API from "../../services/api"; // 👈 import your configured axios instance

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/password-reset/", { email });
      toast({
        title: "Success",
        description: "Password reset email sent!",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.detail || "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="border p-2 w-full"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-blue-600 hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
