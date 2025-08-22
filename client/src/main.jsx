import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import AuthWrapper from "./contexts/AuthWrapper.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";

// 👇 import registerSW from vite-plugin-pwa
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline 🚀");
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <AuthWrapper>
          <App />
        </AuthWrapper>
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);
