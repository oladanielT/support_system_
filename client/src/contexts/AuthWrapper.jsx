import { useAuth } from "./AuthContext";
import { NotificationProvider } from "./NotificationContext";

export default function AuthWrapper({ children }) {
  const { user } = useAuth();

  // If no user (not logged in) → don't mount NotificationProvider
  if (!user) {
    return children;
  }

  return <NotificationProvider>{children}</NotificationProvider>;
}
