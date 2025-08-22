import { useEffect } from "react";
import { X } from "lucide-react";
import { Alert, AlertDescription, AlertIcon } from "./Alert.jsx";
import { Button } from "./Button.jsx";
import { cn } from "../../lib/utils.js";

export function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <Alert
      variant={toast.variant}
      className={cn(
        "fixed top-4 right-4 w-96 z-50 shadow-lg animate-in slide-in-from-right-full",
        "border-l-4"
      )}
    >
      <div className="flex items-start">
        <AlertIcon variant={toast.variant} />
        <div className="ml-3 flex-1">
          {toast.title && <div className="font-medium">{toast.title}</div>}
          <AlertDescription>{toast.description}</AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-2"
          onClick={() => onDismiss(toast.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}

export function Toaster({ toasts, onDismiss }) {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
