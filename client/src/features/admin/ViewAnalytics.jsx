import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import { complaintService } from "../../services/complaintService";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

const COLORS = ["#fbbf24", "#3b82f6", "#10b981", "#ef4444"]; // Yellow, Blue, Green, Red

export default function ViewAnalytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintService
      .getStats()
      .then(setStats)
      .catch((err) => {
        console.error("Failed to load stats:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-6 text-center text-gray-600">
          Loading analytics...
        </div>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <Navbar />
        <div className="p-6 text-center text-red-500">
          Failed to load analytics data.
        </div>
      </>
    );
  }

  const pieData = [
    { name: "Pending", value: stats.pending_complaints },
    { name: "Assigned", value: stats.assigned_complaints },
    { name: "Resolved", value: stats.resolved_complaints },
    { name: "High Priority", value: stats.high_priority_complaints },
  ];

  const barData = [
    { name: "Total Complaints", value: stats.total_complaints },
    // { name: "My Complaints", value: stats.my_complaints },
  ];

  return (
    <>
      <Navbar />
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <h2 className="text-3xl font-bold mb-6">Analytics Overview</h2>

        {/* Stats cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 rounded-lg shadow text-white bg-blue-600 flex items-center space-x-4">
            <Clock className="w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">Total Complaints</p>
              <h3 className="text-3xl font-bold">{stats.total_complaints}</h3>
            </div>
          </div>
          <div className="p-6 rounded-lg shadow text-white bg-yellow-500 flex items-center space-x-4">
            <AlertCircle className="w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">Pending Complaints</p>
              <h3 className="text-3xl font-bold">{stats.pending_complaints}</h3>
            </div>
          </div>
          <div className="p-6 rounded-lg shadow text-white bg-green-600 flex items-center space-x-4">
            <CheckCircle className="w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">Resolved Complaints</p>
              <h3 className="text-3xl font-bold">
                {stats.resolved_complaints}
              </h3>
            </div>
          </div>
        </div>

        {/* Extra stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 rounded-lg shadow text-white bg-red-600 flex items-center space-x-4">
            <TrendingUp className="w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">High Priority</p>
              <h3 className="text-3xl font-bold">
                {stats.high_priority_complaints}
              </h3>
            </div>
          </div>
          <div className="p-6 rounded-lg shadow text-white bg-purple-600 flex items-center space-x-4">
            <AlertCircle className="w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">My Complaints</p>
              <h3 className="text-3xl font-bold">{stats.my_complaints}</h3>
            </div>
          </div>
          <div className="p-6 rounded-lg shadow text-white bg-indigo-600 flex items-center space-x-4">
            <Clock className="w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">Avg Resolution Time</p>
              <h3 className="text-3xl font-bold">
                {stats.avg_resolution_time}
              </h3>
            </div>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">
            Complaint Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                fill="#8884d8"
                paddingAngle={5}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                isAnimationActive={true}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Count"]} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Complaints Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={barData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="url(#colorGradient)"
                animationDuration={1500}
                radius={[5, 5, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

// import React, { useEffect, useState } from "react";
// import Navbar from "../../components/layout/Navbar";
// import { useNavigate } from "react-router-dom";
// import { complaintService } from "../../services/complaintService";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import axios from "axios";

// export default function ViewAnalytics() {
//   const navigate = useNavigate();
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     complaintService
//       .getStats()
//       .then(setStats)
//       .catch((err) => {
//         console.error("Failed to load stats:", err);
//         setLoading(false);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   // Placeholder chart data for now
//   const chartData = [
//     { name: "Pending", value: stats?.pending_complaints || 0 },
//     { name: "Assigned", value: stats?.assigned_complaints || 0 },
//     { name: "Resolved", value: stats?.resolved_complaints || 0 },
//     { name: "High Priority", value: stats?.high_priority_complaints || 0 },
//   ];

//   if (loading) {
//     return (
//       <>
//         <Navbar />
//         <div className="p-6">Loading analytics...</div>
//       </>
//     );
//   }

//   return (
//     <>
//       <Navbar />
//       <div className="p-6 space-y-6">
//         {/* Back button */}
//         <button
//           onClick={() => navigate("/admin/dashboard")}
//           className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded shadow"
//         >
//           ← Back to Dashboard
//         </button>

//         <h2 className="text-2xl font-bold">Analytics Overview</h2>

//         {/* Stats cards */}
//         <div className="grid gap-6 md:grid-cols-3">
//           <div className="p-6 rounded-lg shadow text-white bg-blue-500">
//             <p className="text-lg">Total Complaints</p>
//             <h3 className="text-3xl font-bold">{stats.total_complaints}</h3>
//           </div>
//           <div className="p-6 rounded-lg shadow text-white bg-yellow-500">
//             <p className="text-lg">Pending Complaints</p>
//             <h3 className="text-3xl font-bold">{stats.pending_complaints}</h3>
//           </div>
//           <div className="p-6 rounded-lg shadow text-white bg-green-500">
//             <p className="text-lg">Resolved Complaints</p>
//             <h3 className="text-3xl font-bold">{stats.resolved_complaints}</h3>
//           </div>
//         </div>

//         {/* Extra stats */}
//         <div className="grid gap-6 md:grid-cols-3">
//           <div className="p-6 rounded-lg shadow text-white bg-red-500">
//             <p className="text-lg">High Priority</p>
//             <h3 className="text-3xl font-bold">
//               {stats.high_priority_complaints}
//             </h3>
//           </div>
//           <div className="p-6 rounded-lg shadow text-white bg-purple-500">
//             <p className="text-lg">My Complaints</p>
//             <h3 className="text-3xl font-bold">{stats.my_complaints}</h3>
//           </div>
//           <div className="p-6 rounded-lg shadow text-white bg-indigo-500">
//             <p className="text-lg">Avg Resolution Time</p>
//             <h3 className="text-3xl font-bold">{stats.avg_resolution_time}</h3>
//           </div>
//         </div>

//         {/* Chart */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h3 className="text-lg font-semibold mb-4">Complaints Breakdown</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={chartData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="value" fill="#3b82f6" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </>
//   );
// }
