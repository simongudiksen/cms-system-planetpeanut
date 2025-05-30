import React from "react";
import { cn } from "@/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "error";
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helpText,
      leftIcon,
      rightIcon,
      variant = "default",
      fullWidth = true,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || variant === "error";

    return (
      <div className={cn(fullWidth && "w-full", "space-y-1")}>
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">{leftIcon}</span>
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              "input",
              hasError && "input-error",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">{rightIcon}</span>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-error-600 mt-1">{error}</p>}

        {helpText && !error && (
          <p className="text-sm text-gray-500 mt-1">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
