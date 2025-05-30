import React from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "danger"
    | "success"
    | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = "btn focus-visible:focus";

    const variants = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      outline: "btn-outline",
      danger: "btn-danger",
      success: "btn-success",
      ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    };

    const sizes = {
      sm: "btn-sm",
      md: "",
      lg: "btn-lg",
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {isLoading && <div className="loading-spinner w-4 h-4 mr-2" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
