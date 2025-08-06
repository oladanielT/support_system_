import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";

const Alert = forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-gray-50 text-gray-900 border-gray-200",
      destructive: "bg-red-50 text-red-900 border-red-200",
      success: "bg-green-50 text-green-900 border-green-200",
      warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
      info: "bg-blue-50 text-blue-900 border-blue-200",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

const AlertDescription = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

const AlertIcon = ({ variant }) => {
  const icons = {
    default: Info,
    destructive: XCircle,
    success: CheckCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[variant] || Info;
  return <Icon className="h-4 w-4" />;
};

export { Alert, AlertDescription, AlertIcon };
