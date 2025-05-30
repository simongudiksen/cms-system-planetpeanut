import React from "react";
import { cn } from "@/utils/cn";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  className,
  showIcon = true,
}) => {
  const baseClasses = "rounded-lg p-4 border";

  const variants = {
    success: "bg-success-50 border-success-200 text-success-800",
    error: "bg-error-50 border-error-200 text-error-800",
    warning: "bg-warning-50 border-warning-200 text-warning-800",
    info: "bg-info-50 border-info-200 text-info-800",
  };

  const iconVariants = {
    success: "text-success-500",
    error: "text-error-500",
    warning: "text-warning-500",
    info: "text-info-500",
  };

  const icons = {
    success: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    error: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
    info: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div className={cn(baseClasses, variants[type], className)}>
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <span className={cn(iconVariants[type])}>{icons[type]}</span>
          </div>
        )}
        <div className={cn("flex-1", showIcon && "ml-3")}>
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={cn(
                  "inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-opacity-75",
                  {
                    "text-success-500 hover:bg-success-100 focus:ring-success-600":
                      type === "success",
                    "text-error-500 hover:bg-error-100 focus:ring-error-600":
                      type === "error",
                    "text-warning-500 hover:bg-warning-100 focus:ring-warning-600":
                      type === "warning",
                    "text-info-500 hover:bg-info-100 focus:ring-info-600":
                      type === "info",
                  }
                )}
                onClick={onClose}
              >
                <span className="sr-only">Dismiss</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { Alert };
