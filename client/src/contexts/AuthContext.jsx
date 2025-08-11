import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // stores the full user object
  const [loading, setIsLoading] = useState(true);

  // Run once on app load to restore auth

  useEffect(() => {
    // Load from localStorage on mount
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      API.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    setIsLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    delete API.defaults.headers.common["Authorization"];
    setUser(null);
  };

  // useEffect(() => {
  //   const initAuth = async () => {
  //     const token = localStorage.getItem("token");
  //     const savedUser = localStorage.getItem("user"); // store whole user from login

  //     if (token) {
  //       API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  //       if (savedUser) {
  //         // Use saved user info immediately to avoid flicker
  //         setUser(JSON.parse(savedUser));
  //       }

  //       try {
  //         // Try to fetch updated user profile (requires /auth/user/ backend)
  //         const res = await API.get("/auth/user/");
  //         setUser(res.data);
  //         localStorage.setItem("user", JSON.stringify(res.data));
  //       } catch (error) {
  //         console.warn("Could not refresh user from API, using saved data.");
  //         if (!savedUser) {
  //           logout();
  //         }
  //       }
  //     }
  //     setLoading(false);
  //   };

  //   initAuth();
  // }, []);

  // Login — save everything in localStorage
  // const login = (token, userData) => {
  //   localStorage.setItem("token", token);
  //   localStorage.setItem("user", JSON.stringify(userData));
  //   API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  //   setUser(userData);
  // };

  // const logout = () => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("user");
  //   delete API.defaults.headers.common["Authorization"];
  //   setUser(null);
  // };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
