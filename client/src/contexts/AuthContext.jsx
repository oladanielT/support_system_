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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Set the token in API headers
          API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Get current user info
          const response = await API.get("/auth/user/");
          setUser(response.data);
        } catch (error) {
          console.error("Failed to get current user:", error);
          localStorage.removeItem("token");
          delete API.defaults.headers.common["Authorization"];
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token, role) => {
    localStorage.setItem("token", token);
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // You might want to fetch user details here or pass them from login
    setUser({ role, token });
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete API.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
