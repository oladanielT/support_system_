import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

const ProtectedRoute = ({ children, role }) => {
  const { user, role: userRole, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show a loader while we don't know the auth state yet
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no user, go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role mismatch, send to correct dashboard (only if we know the role)
  if (role && userRole && userRole !== role) {
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  // Finally, render the child component
  return children;
};

export default ProtectedRoute;
