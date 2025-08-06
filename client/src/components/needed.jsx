// 📄 src/components/layout/Navbar.jsx
// jsx
// CopyEdit
// import { Link, useNavigate } from "react-router-dom";import { useAuth } from "../../contexts/AuthContext";
// export default function Navbar() {
//   const { role, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <nav className="bg-blue-700 text-white px-4 py-3 flex justify-between items-center shadow">
//       <h1 className="text-lg font-bold">Complaint System</h1>
//       <div className="flex items-center space-x-4">
//         {role === "user" && <Link to="/user/dashboard">Dashboard</Link>}
//         {role === "engineer" && <Link to="/engineer/dashboard">Dashboard</Link>}
//         {role === "admin" && <Link to="/admin/dashboard">Dashboard</Link>}
//         <button onClick={handleLogout} className="bg-white text-blue-700 px-3 py-1 rounded">
//           Logout
//         </button>
//       </div>
//     </nav>
//   );
// }

// src/components/layout/Layout.jsx
// jsx
// CopyEdit
// import Navbar from "./Navbar";
// export default function Layout({ children }) {
//   return (
//     <div className="min-h-screen flex flex-col">
//       <Navbar />
//       <main className="flex-grow p-4 bg-gray-50">{children}</main>
//     </div>
//   );
// }

// 📄 src/components/common/Button.jsx
// jsx
// CopyEdit
// export default function Button({ children, onClick, type = "button", className = "", disabled }) {
//   return (
//     <button
//       onClick={onClick}
//       type={type}
//       disabled={disabled}
//       className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 ${className}`}
//     >
//       {children}
//     </button>
//   );
// }

// 📄 src/components/common/Loader.jsx
// jsx
// CopyEdit
// export default function Loader({ size = 6 }) {
//   return (
//     <div className={`w-${size} h-${size} border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}></div>
//   );
// }

// You can import these in any page like:
// jsx
// CopyEdit
// import Button from "../../components/common/Button";
// import Loader from "../../components/common/Loader";

// 🔐 Step 6: Authentication Flow (Frontend Only)
// 📄 src/features/auth/Login.jsx
// jsx
// CopyEdit
// import { useState } from "react";import { useNavigate } from "react-router-dom";import { useAuth } from "../../contexts/AuthContext";import API from "../../services/api";
// export default function Login() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await API.post("/auth/login/", { email, password });

//       const { token, role } = res.data;
//       login(token, role);
//       navigate(`/${role}/dashboard`);
//     } catch (err) {
//       setError("Invalid credentials.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
//         <h2 className="text-xl font-bold mb-4">Login</h2>
//         {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="mb-2 w-full p-2 border rounded"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="mb-4 w-full p-2 border rounded"
//         />
//         <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded">
//           Login
//         </button>
//       </form>
//     </div>
//   );
// }

// 📄 src/features/auth/Register.jsx
// Here’s a complete, professional React registration component:
// jsx
// CopyEdit
// import { useState } from "react";import { useNavigate } from "react-router-dom";import API from "../../services/api";
// const departments = [
//   { value: "computer_science", label: "Computer Science" },
//   { value: "engineering", label: "Engineering" },
//   { value: "medicine", label: "Medicine" },
//   { value: "law", label: "Law" },
//   { value: "arts", label: "Arts" },
//   { value: "sciences", label: "Sciences" },
//   { value: "administration", label: "Administration" },
//   { value: "ict", label: "ICT Department" },
// ];
// export default function Register() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     first_name: "",
//     last_name: "",
//     username: "",
//     email: "",
//     password: "",
//     department: "",
//     phone_number: "",
//   });
//   const [error, setError] = useState(null);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await API.post("/auth/register/", {
//         ...formData,
//         role: "user", // Explicitly send user role
//       });
//       navigate("/login");
//     } catch (err) {
//       const detail = err.response?.data?.detail || "Registration failed";
//       setError(detail);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
//         <h2 className="text-2xl font-semibold text-center">Create an Account</h2>
//         {error && <p className="text-red-500 text-sm">{error}</p>}

//         <div className="flex space-x-2">
//           <input
//             type="text"
//             name="first_name"
//             placeholder="First Name"
//             value={formData.first_name}
//             onChange={handleChange}
//             className="w-1/2 p-2 border rounded"
//             required
//           />
//           <input
//             type="text"
//             name="last_name"
//             placeholder="Last Name"
//             value={formData.last_name}
//             onChange={handleChange}
//             className="w-1/2 p-2 border rounded"
//             required
//           />
//         </div>

//         <input
//           type="text"
//           name="username"
//           placeholder="Username"
//           value={formData.username}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//           required
//         />

//         <input
//           type="email"
//           name="email"
//           placeholder="Staff Email (e.g., you@oauife.edu.ng)"
//           value={formData.email}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//           required
//         />

//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//           required
//         />

//         <input
//           type="text"
//           name="phone_number"
//           placeholder="Phone Number (e.g., +2348012345678)"
//           value={formData.phone_number}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//         />

//         <select
//           name="department"
//           value={formData.department}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//           required
//         >
//           <option value="">Select Department</option>
//           {departments.map((dept) => (
//             <option key={dept.value} value={dept.value}>
//               {dept.label}
//             </option>
//           ))}
//         </select>

//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
//         >
//           Register
//         </button>
//       </form>
//     </div>
//   );
// }

// 📄 src/features/user/SubmitComplaint.jsx
// jsx
// CopyEdit
// import { useState } from "react";import API from "../../services/api";import { useNavigate } from "react-router-dom";
// const categories = [
//   { value: "network_slow", label: "Network Slow" },
//   { value: "network_down", label: "Network Down" },
//   { value: "wifi_issues", label: "WiFi Issues" },
//   { value: "server_issues", label: "Server Issues" },
//   { value: "email_issues", label: "Email Issues" },
//   { value: "other", label: "Other" },
// ];
// const priorities = [
//   { value: "low", label: "Low" },
//   { value: "medium", label: "Medium" },
//   { value: "high", label: "High" },
//   { value: "critical", label: "Critical" },
// ];
// export default function SubmitComplaint() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     category: "",
//     priority: "medium",
//     location: "",
//     contact_info: "",
//   });

//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     try {
//       await API.post("/complaints/", formData);
//       setSuccess(true);
//       setTimeout(() => navigate("/user/dashboard"), 1500);
//     } catch (err) {
//       setError("Could not submit complaint. Please try again.");
//     }
//   };

//   return (
//     <div className="p-6 max-w-xl mx-auto">
//       <h2 className="text-2xl font-semibold mb-4">Submit a Complaint</h2>
//       {error && <p className="text-red-500 mb-2">{error}</p>}
//       {success && <p className="text-green-600 mb-2">Complaint submitted successfully!</p>}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           name="title"
//           placeholder="Title"
//           value={formData.title}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//           required
//         />

//         <textarea
//           name="description"
//           placeholder="Describe the issue"
//           value={formData.description}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//           rows={4}
//           required
//         />

//         <select
//           name="category"
//           value={formData.category}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//           required
//         >
//           <option value="">Select Category</option>
//           {categories.map(c => (
//             <option key={c.value} value={c.value}>{c.label}</option>
//           ))}
//         </select>

//         <select
//           name="priority"
//           value={formData.priority}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//           required
//         >
//           {priorities.map(p => (
//             <option key={p.value} value={p.value}>{p.label}</option>
//           ))}
//         </select>

//         <input
//           name="location"
//           placeholder="Location (e.g., Faculty Building, Room 201)"
//           value={formData.location}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//         />

//         <input
//           name="contact_info"
//           placeholder="Contact Info (Phone/Email)"
//           value={formData.contact_info}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//         />

//         <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded">
//           Submit Complaint
//         </button>
//       </form>
//     </div>
//   );
// }

// 📄 Update UserDashboard.jsx to Link to Complaint List
// jsx
// Copy
// Edit
// import { Link } from "react-router-dom";

// export default function UserDashboard() {
//   return (
//     <div className="p-6 space-y-4">
//       <h1 className="text-xl font-semibold">Welcome to your dashboard</h1>
//       <Link to="/user/submit" className="text-blue-600 underline block">
//         ➕ Submit a New Complaint
//       </Link>
//       <Link to="/user/complaints" className="text-blue-600 underline block">
//         📋 View My Complaints
//       </Link>
//     </div>
//   );
// }

// 📄 src/features/user/ComplaintList.jsx
// jsx
// CopyEdit
// import { useEffect, useState } from "react";import API from "../../services/api";import { Link } from "react-router-dom";
// export default function ComplaintList() {
//   const [complaints, setComplaints] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchComplaints = async () => {
//       try {
//         const res = await API.get("/complaints/");
//         setComplaints(res.data);
//       } catch (err) {
//         setError("Failed to load complaints");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchComplaints();
//   }, []);

//   if (loading) return <p className="p-6">Loading complaints...</p>;
//   if (error) return <p className="p-6 text-red-500">{error}</p>;

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h2 className="text-xl font-semibold mb-4">My Complaints</h2>
//       {complaints.length === 0 ? (
//         <p>No complaints submitted yet.</p>
//       ) : (
//         <div className="space-y-4">
//           {complaints.map((c) => (
//             <div key={c.id} className="bg-white p-4 rounded shadow">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h3 className="text-lg font-bold">{c.title}</h3>
//                   <p className="text-sm text-gray-600">{c.category}</p>
//                   <p className="text-xs text-blue-600 mt-1">Status: {c.status}</p>
//                 </div>
//                 <Link
//                   to={`/user/complaints/${c.id}`}
//                   className="text-sm text-blue-500 hover:underline"
//                 >
//                   View
//                 </Link>
//               </div>
//               <p className="text-sm mt-2">Priority: <span className="font-medium">{c.priority}</span></p>
//               <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(c.created_at).toLocaleString()}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// 📄 src/features/user/ComplaintDetails.jsx
// jsx
// Copy
// Edit
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import API from "../../services/api";
// import Layout from "../../components/layout/Layout";

// export default function ComplaintDetails() {
//   const { id } = useParams();
//   const [complaint, setComplaint] = useState(null);
//   const [updates, setUpdates] = useState([]);

//   useEffect(() => {
//     const fetchDetails = async () => {
//       try {
//         const res = await API.get(`/complaints/${id}/`);
//         setComplaint(res.data);

//         const updatesRes = await API.get(`/complaints/${id}/updates/`);
//         setUpdates(updatesRes.data);
//       } catch (err) {
//         console.error("Failed to load complaint details");
//       }
//     };

//     fetchDetails();
//   }, [id]);

//   if (!complaint) return <Layout><p>Loading...</p></Layout>;

//   return (
//     <Layout>
//       <div className="max-w-4xl mx-auto space-y-6">
//         <div className="bg-white p-6 rounded shadow">
//           <h2 className="text-2xl font-bold">{complaint.title}</h2>
//           <p className="text-gray-700">{complaint.description}</p>
//           <div className="mt-2 text-sm text-gray-500">
//             <p>Status: {complaint.status}</p>
//             <p>Priority: {complaint.priority}</p>
//             <p>Category: {complaint.category}</p>
//             <p>Submitted: {new Date(complaint.created_at).toLocaleString()}</p>
//           </div>
//         </div>

//         {complaint.resolution_notes && (
//           <div className="bg-green-50 p-4 rounded shadow border border-green-200">
//             <h3 className="font-semibold text-green-800 mb-2">Resolution Notes</h3>
//             <p className="text-sm text-gray-700">{complaint.resolution_notes}</p>
//           </div>
//         )}

//         <div className="bg-white p-4 rounded shadow">
//           <h3 className="text-lg font-semibold mb-3">Status Timeline</h3>
//           {updates.length === 0 ? (
//             <p className="text-gray-500 text-sm">No updates yet.</p>
//           ) : (
//             <ul className="space-y-2">
//               {updates.map((u) => (
//                 <li key={u.id} className="text-sm border-b pb-2">
//                   <p><strong>{u.update_type.replace(/_/g, " ")}</strong> by {u.updated_by.full_name || "System"}</p>
//                   <p className="text-gray-600">{u.message}</p>
//                   <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleString()}</p>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }

// ✅ Step 11: Engineer Dashboard — Assigned Complaints
// 📄 src/features/engineer/Dashboard.jsx
// jsx
// Copy
// Edit
// import { useEffect, useState } from "react";
// import API from "../../services/api";
// import { Link } from "react-router-dom";

// export default function EngineerDashboard() {
//   const [complaints, setComplaints] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAssigned = async () => {
//       try {
//         const res = await API.get("/complaints/assigned/"); // ✅ Make sure this endpoint exists
//         setComplaints(res.data);
//       } catch (err) {
//         setError("Failed to fetch assigned complaints");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAssigned();
//   }, []);

//   if (loading) return <p className="p-6">Loading...</p>;
//   if (error) return <p className="p-6 text-red-500">{error}</p>;

//   return (
//     <div className="p-6 max-w-5xl mx-auto">
//       <h1 className="text-2xl font-semibold mb-4">Assigned Complaints</h1>

//       {complaints.length === 0 ? (
//         <p>No complaints assigned yet.</p>
//       ) : (
//         <div className="space-y-4">
//           {complaints.map(c => (
//             <div key={c.id} className="bg-white p-4 rounded shadow">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h3 className="text-lg font-bold">{c.title}</h3>
//                   <p className="text-sm text-gray-600">Category: {c.category}</p>
//                   <p className="text-sm text-blue-700 mt-1">Status: {c.status}</p>
//                 </div>
//                 <Link
//                   to={`/engineer/complaints/${c.id}`}
//                   className="text-sm text-blue-600 hover:underline"
//                 >
//                   Update
//                 </Link>
//               </div>
//               <p className="text-xs text-gray-400 mt-1">Priority: {c.priority}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// ✅ Step 12: Engineer Complaint Details + Update Form
// 📄 src/features/engineer/ComplaintDetails.jsx
// jsx
// Copy
// Edit
// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import API from "../../services/api";

// export default function EngineerComplaintDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [complaint, setComplaint] = useState(null);
//   const [status, setStatus] = useState("");
//   const [resolution, setResolution] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     const fetchComplaint = async () => {
//       try {
//         const res = await API.get(`/complaints/${id}/`);
//         setComplaint(res.data);
//         setStatus(res.data.status);
//         setResolution(res.data.resolution_notes || "");
//       } catch (err) {
//         console.error("Error loading complaint", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchComplaint();
//   }, [id]);

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       await API.patch(`/complaints/${id}/`, {
//         status,
//         resolution_notes: resolution,
//       });
//       navigate("/engineer/dashboard");
//     } catch (err) {
//       alert("Failed to update complaint");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return <p className="p-6">Loading complaint...</p>;
//   if (!complaint) return <p className="p-6 text-red-500">Complaint not found</p>;

//   return (
//     <div className="p-6 max-w-2xl mx-auto space-y-4">
//       <h2 className="text-xl font-semibold">{complaint.title}</h2>
//       <p className="text-sm text-gray-600">{complaint.description}</p>

//       <form onSubmit={handleUpdate} className="space-y-4 mt-4">
//         <label className="block">
//           Status:
//           <select
//             value={status}
//             onChange={(e) => setStatus(e.target.value)}
//             className="w-full p-2 border rounded mt-1"
//             required
//           >
//             <option value="pending">Pending</option>
//             <option value="assigned">Assigned</option>
//             <option value="in_progress">In Progress</option>
//             <option value="resolved">Resolved</option>
//             <option value="closed">Closed</option>
//           </select>
//         </label>

//         <label className="block">
//           Resolution Notes:
//           <textarea
//             value={resolution}
//             onChange={(e) => setResolution(e.target.value)}
//             rows={4}
//             className="w-full p-2 border rounded mt-1"
//           />
//         </label>

//         <button
//           type="submit"
//           disabled={saving}
//           className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
//         >
//           {saving ? "Saving..." : "Update Complaint"}
//         </button>
//       </form>
//     </div>
//   );
// }

//  2. Updated AdminDashboard.jsx (Full Version)
// 📄 src/features/admin/Dashboard.jsx

// jsx
// Copy
// Edit
// import { useEffect, useState } from "react";
// import API from "../../services/api";
// import Layout from "../../components/layout/Layout";
// import StatCard from "../../components/common/StatCard";
// import { Link } from "react-router-dom";
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
// } from "recharts";

// export default function AdminDashboard() {
//   const [complaints, setComplaints] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchComplaints = async () => {
//       try {
//         const res = await API.get("/complaints/");
//         setComplaints(res.data);
//       } catch (err) {
//         setError("Failed to load complaints");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchComplaints();
//   }, []);

//   const countBy = (status) => {
//     return complaints.filter(c => c.status === status).length;
//   };

//   const getStatusCounts = () => {
//     const countMap = {};
//     complaints.forEach(c => {
//       countMap[c.status] = (countMap[c.status] || 0) + 1;
//     });
//     return Object.entries(countMap).map(([status, count]) => ({
//       status,
//       count
//     }));
//   };

//   return (
//     <Layout>
//       <div className="max-w-7xl mx-auto space-y-6">
//         <div>
//           <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//           <p className="text-sm text-gray-600">Overview of complaints and system activity</p>
//         </div>

//         {/* Stat Cards */}
//         {!loading && complaints.length > 0 && (
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <StatCard title="Total Complaints" value={complaints.length} />
//             <StatCard title="Pending" value={countBy("pending")} />
//             <StatCard title="Assigned" value={countBy("assigned")} />
//             <StatCard title="Resolved" value={countBy("resolved")} />
//           </div>
//         )}

//         {/* Chart */}
//         {!loading && complaints.length > 0 && (
//           <div className="bg-white p-6 rounded shadow">
//             <h2 className="text-lg font-semibold mb-4">Complaints by Status</h2>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={getStatusCounts()}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="status" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="count" fill="#2563eb" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         )}

//         {/* All Complaints */}
//         {!loading && (
//           <div className="bg-white p-6 rounded shadow">
//             <h2 className="text-lg font-semibold mb-4">All Complaints</h2>
//             {complaints.length === 0 ? (
//               <p>No complaints found.</p>
//             ) : (
//               <div className="space-y-3">
//                 {complaints.map(c => (
//                   <div key={c.id} className="border-b pb-3">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="font-semibold text-blue-800">{c.title}</h3>
//                         <p className="text-sm text-gray-600">{c.description.slice(0, 100)}...</p>
//                         <p className="text-xs mt-1 text-gray-400">
//                           Status: {c.status} | Priority: {c.priority} | Category: {c.category}
//                         </p>
//                       </div>
//                       <Link
//                         to={`/admin/complaints/${c.id}`}
//                         className="text-blue-600 text-sm underline"
//                       >
//                         Manage
//                       </Link>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// }

// ✅ Step 14: Assign Engineer to Complaint
// 📄 src/features/admin/ComplaintDetails.jsx
// jsx
// Copy
// Edit
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import API from "../../services/api";

// export default function AdminComplaintDetails() {
//   const { id } = useParams();
//   const [complaint, setComplaint] = useState(null);
//   const [engineers, setEngineers] = useState([]);
//   const [selectedEngineer, setSelectedEngineer] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const [complaintRes, engineersRes] = await Promise.all([
//           API.get(`/complaints/${id}/`),
//           API.get("/users/?role=engineer"),
//         ]);
//         setComplaint(complaintRes.data);
//         setEngineers(engineersRes.data);
//         setSelectedEngineer(complaintRes.data.assigned_to || "");
//       } catch (err) {
//         console.error("Failed to load data", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, [id]);

//   const assignEngineer = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       await API.patch(`/complaints/${id}/`, {
//         assigned_to: selectedEngineer,
//         status: "assigned",
//       });
//       alert("Engineer assigned successfully.");
//     } catch (err) {
//       alert("Failed to assign engineer.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return <p className="p-6">Loading...</p>;
//   if (!complaint) return <p className="p-6 text-red-500">Complaint not found</p>;

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <h2 className="text-xl font-bold">{complaint.title}</h2>
//       <p className="text-sm text-gray-600 mb-4">{complaint.description}</p>

//       <form onSubmit={assignEngineer} className="space-y-4">
//         <label>
//           Assign to Engineer:
//           <select
//             value={selectedEngineer}
//             onChange={(e) => setSelectedEngineer(e.target.value)}
//             className="w-full p-2 border rounded mt-1"
//           >
//             <option value="">Select Engineer</option>
//             {engineers.map((e) => (
//               <option key={e.id} value={e.id}>
//                 {e.full_name || e.username}
//               </option>
//             ))}
//           </select>
//         </label>

//         <button
//           type="submit"
//           disabled={saving}
//           className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
//         >
//           {saving ? "Assigning..." : "Assign Engineer"}
//         </button>
//       </form>
//     </div>
//   );
// }

// ✅ Step 17: Admin – Manage Users Page
// 📄 src/features/admin/ManageUsers.jsx
// jsx
// Copy
// Edit
// import { useEffect, useState } from "react";
// import API from "../../services/api";

// export default function ManageUsers() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchUsers = async () => {
//     try {
//       const res = await API.get("/users/"); // Must be admin-only
//       setUsers(res.data);
//     } catch (err) {
//       setError("Failed to load users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleApproval = async (userId, is_verified) => {
//     try {
//       await API.patch(`/users/${userId}/`, { is_verified: !is_verified });
//       fetchUsers();
//     } catch (err) {
//       alert("Failed to update user approval.");
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   if (loading) return <p className="p-6">Loading users...</p>;
//   if (error) return <p className="p-6 text-red-500">{error}</p>;

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Manage Users & Engineers</h1>

//       <table className="w-full text-left border">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="p-2">Full Name</th>
//             <th className="p-2">Email</th>
//             <th className="p-2">Role</th>
//             <th className="p-2">Department</th>
//             <th className="p-2">Verified</th>
//             <th className="p-2">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((user) => (
//             <tr key={user.id} className="border-t">
//               <td className="p-2">{user.full_name || `${user.first_name} ${user.last_name}`}</td>
//               <td className="p-2">{user.email}</td>
//               <td className="p-2">{user.role}</td>
//               <td className="p-2">{user.department}</td>
//               <td className="p-2">{user.is_verified ? "Yes" : "No"}</td>
//               <td className="p-2">
//                 <button
//                   onClick={() => toggleApproval(user.id, user.is_verified)}
//                   className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
//                 >
//                   {user.is_verified ? "Revoke" : "Approve"}
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

//  1. First, Create the StatCard Component
// 📄 src/components/common/StatCard.jsx

// jsx
// Copy
// Edit
// export default function StatCard({ title, value }) {
//   return (
//     <div className="bg-white p-4 rounded shadow text-center">
//       <p className="text-sm text-gray-500">{title}</p>
//       <p className="text-xl font-bold text-blue-700">{value}</p>
//     </div>
//   );
// }
