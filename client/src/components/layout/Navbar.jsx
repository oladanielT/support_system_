import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNotifications } from "../../contexts/NotificationContext.jsx"; // Add this import
import { Menu, X, Bell, User, LogOut, Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markNotificationRead,
    markAllRead,
  } = useNotifications(); // Use context
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case "user":
        return [
          { to: "/user/dashboard", label: "Dashboard" },
          { to: "/user/complaints/new", label: "New Complaint" },
        ];
      case "engineer":
        return [{ to: "/engineer/dashboard", label: "Dashboard" }];
      case "admin":
        return [
          { to: "/admin/dashboard", label: "Dashboard" },
          { to: "/admin/users", label: "Manage Users" },
        ];
      default:
        return [];
    }
  };

  // Fetch notifications when dropdown is toggled open
  useEffect(() => {
    if (isNotifOpen && user) {
      setLoadingNotif(true);
      // mark all as read and refresh the list/count
      markAllRead().then(() => setLoadingNotif(false));
    }
  }, [isNotifOpen, user, markAllRead]);

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={`/${user.role}/dashboard`} className="flex-shrink-0">
              <h1 className="text-xl font-bold text-blue-600">
                Network Support
              </h1>
            </Link>

            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {getNavLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                className="text-gray-500 hover:text-gray-700 p-2 relative"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[18px] h-[18px]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-md shadow-lg py-2 z-50 border">
                  {loadingNotif ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading...
                    </div>
                  ) : !Array.isArray(notifications) ||
                    notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notif.is_read ? "bg-blue-50" : ""
                        }`}
                        onClick={() => {
                          // You can add click handler here to mark as read
                          // markNotificationRead(notif.id);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-gray-800 flex-1 pr-2">
                            {notif.message}
                          </p>
                          {!notif.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2"
              >
                <User size={20} />
                <span className="hidden md:block">Profile</span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  {/* <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </button> */}
                  <button
                    onClick={toggleTheme}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun size={16} className="mr-2" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon size={16} className="mr-2" />
                        Dark Mode
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext.jsx";
// import { Menu, X, Bell, User, LogOut, Settings } from "lucide-react";
// import API from "../../services/api.js"; // your axios instance

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isNotifOpen, setIsNotifOpen] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [loadingNotif, setLoadingNotif] = useState(false);

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   const getNavLinks = () => {
//     if (!user) return [];

//     switch (user.role) {
//       case "user":
//         return [
//           { to: "/user/dashboard", label: "Dashboard" },
//           { to: "/user/complaints/new", label: "New Complaint" },
//         ];
//       case "engineer":
//         return [{ to: "/engineer/dashboard", label: "Dashboard" }];
//       case "admin":
//         return [
//           { to: "/admin/dashboard", label: "Dashboard" },
//           { to: "/admin/users", label: "Manage Users" },
//         ];
//       default:
//         return [];
//     }
//   };

//   // Fetch notifications when dropdown is toggled open
//   useEffect(() => {
//     if (isNotifOpen && user) {
//       setLoadingNotif(true);
//       API.get("/notifications/")
//         .then((res) => setNotifications(res.data))
//         .catch((err) => {
//           console.error("Failed to load notifications", err);
//           setNotifications([]);
//         })
//         .finally(() => setLoadingNotif(false));
//     }
//   }, [isNotifOpen, user]);

//   if (!user) return null;

//   return (
//     <nav className="bg-white shadow-lg border-b">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center">
//             <Link to={`/${user.role}/dashboard`} className="flex-shrink-0">
//               <h1 className="text-xl font-bold text-blue-600">
//                 Network Support
//               </h1>
//             </Link>

//             <div className="hidden md:ml-6 md:flex md:space-x-8">
//               {getNavLinks().map((link) => (
//                 <Link
//                   key={link.to}
//                   to={link.to}
//                   className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
//                 >
//                   {link.label}
//                 </Link>
//               ))}
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             <div className="relative">
//               <button
//                 className="text-gray-500 hover:text-gray-700 p-2"
//                 onClick={() => setIsNotifOpen(!isNotifOpen)}
//                 aria-label="Notifications"
//               >
//                 <Bell size={20} />
//                 {notifications.length > 0 && (
//                   <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
//                     {notifications.length}
//                   </span>
//                 )}
//               </button>

//               {isNotifOpen && (
//                 <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-md shadow-lg py-2 z-50">
//                   {loadingNotif ? (
//                     <div className="p-4 text-center text-gray-500">
//                       Loading...
//                     </div>
//                   ) : notifications.length === 0 ? (
//                     <div className="p-4 text-center text-gray-500">
//                       No notifications
//                     </div>
//                   ) : (
//                     (notifications || []).map((notif) => (
//                       <div
//                         key={notif.id}
//                         className="px-4 py-2 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
//                       >
//                         <p className="text-sm">{notif.message}</p>
//                         <p className="text-xs text-gray-400">
//                           {new Date(notif.created_at).toLocaleString()}
//                         </p>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="relative">
//               <button
//                 onClick={() => setIsMenuOpen(!isMenuOpen)}
//                 className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2"
//               >
//                 <User size={20} />
//                 <span className="hidden md:block">Profile</span>
//               </button>

//               {isMenuOpen && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
//                   <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                     <Settings size={16} className="mr-2" />
//                     Settings
//                   </button>
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   >
//                     <LogOut size={16} className="mr-2" />
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext.jsx";
// import { Menu, X, Bell, User, LogOut, Settings } from "lucide-react";

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   const getNavLinks = () => {
//     if (!user) return [];

//     switch (user.role) {
//       case "user":
//         return [
//           { to: "/user/dashboard", label: "Dashboard" },
//           { to: "/user/complaints/new", label: "New Complaint" },
//         ];
//       case "engineer":
//         return [{ to: "/engineer/dashboard", label: "Dashboard" }];
//       case "admin":
//         return [
//           { to: "/admin/dashboard", label: "Dashboard" },
//           { to: "/admin/users", label: "Manage Users" },
//         ];
//       default:
//         return [];
//     }
//   };

//   if (!user) return null;

//   return (
//     <nav className="bg-white shadow-lg border-b">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center">
//             <Link to={`/${user.role}/dashboard`} className="flex-shrink-0">
//               <h1 className="text-xl font-bold text-blue-600">
//                 Network Support
//               </h1>
//             </Link>

//             <div className="hidden md:ml-6 md:flex md:space-x-8">
//               {getNavLinks().map((link) => (
//                 <Link
//                   key={link.to}
//                   to={link.to}
//                   className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
//                 >
//                   {link.label}
//                 </Link>
//               ))}
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             <button className="text-gray-500 hover:text-gray-700 p-2">
//               <Bell size={20} />
//             </button>

//             <div className="relative">
//               <button
//                 onClick={() => setIsMenuOpen(!isMenuOpen)}
//                 className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2"
//               >
//                 <User size={20} />
//                 <span className="hidden md:block">Profile</span>
//               </button>

//               {isMenuOpen && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
//                   <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                     <Settings size={16} className="mr-2" />
//                     Settings
//                   </button>
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   >
//                     <LogOut size={16} className="mr-2" />
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
