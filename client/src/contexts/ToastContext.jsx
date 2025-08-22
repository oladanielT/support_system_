import { createContext, useContext } from "react";
import { useToast as useToastHook } from "../components/hooks/useToast";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const { toast, dismiss, toasts } = useToastHook();

  return (
    <ToastContext.Provider
      value={{
        toast,
        dismiss,
        toasts,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
