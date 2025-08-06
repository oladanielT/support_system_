import UserDashboard from "./features/user/UserDashboard.jsx";
import SubmitComplaint from "./features/user/SubmitComplaint.jsx";
import ComplaintDetails from "./features/user/ComplaintDetails.jsx";
import EngineerDashboard from "./features/engineer/EngineerDashboard.jsx";
import EngineerComplaintDetails from "./features/engineer/ComplaintDetails.jsx";
import AdminDashboard from "./features/admin/AdminDashboard.jsx";
import ManageUsers from "./features/admin/ManageUsers.jsx";
import ManageComplaint from "./features/admin/AdminComplaintDetails.jsx";
import Login from "./features/auth/Login.jsx";
import Register from "./features/auth/Register.jsx";
import NotFound from "./components/common/NotFound.jsx";
import ProtectedRoute from "./components/routing/ProtectedRoute.jsx";
import HomePage from "./features/auth/HomePage.jsx";

export const publicRoutes = [
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
];

export const privateRoutes = [
  // User
  {
    path: "/user/dashboard",
    element: (
      <ProtectedRoute role="user">
        <UserDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user/complaints/new",
    element: (
      <ProtectedRoute role="user">
        <SubmitComplaint />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user/complaints/:id",
    element: (
      <ProtectedRoute role="user">
        <ComplaintDetails />
      </ProtectedRoute>
    ),
  },
  // Engineer
  {
    path: "/engineer/dashboard",
    element: (
      <ProtectedRoute role="engineer">
        <EngineerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/engineer/complaints/:id",
    element: (
      <ProtectedRoute role="engineer">
        <EngineerComplaintDetails />
      </ProtectedRoute>
    ),
  },
  // Admin
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute role="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute role="admin">
        <ManageUsers />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/complaints/:id",
    element: (
      <ProtectedRoute role="admin">
        <ManageComplaint />
      </ProtectedRoute>
    ),
  },
];

export const fallbackRoute = {
  path: "*",
  element: <NotFound />,
};
