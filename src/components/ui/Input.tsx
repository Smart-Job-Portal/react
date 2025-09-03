import React, { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: "default" | "filled";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      variant = "default",
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    const variants = {
      default: "border-gray-300 bg-white focus-visible:ring-blue-500",
      filled: "border-transparent bg-gray-100 focus-visible:ring-blue-500 focus:bg-white focus:border-gray-300",
    };

    const errorStyles = error ? "border-red-500 focus-visible:ring-red-500" : "";

    const inputStyles = cn(
      baseStyles,
      variants[variant],
      errorStyles,
      leftIcon ? "pl-10" : "",
      rightIcon ? "pr-10" : "",
      className,
    );

    const containerWidth = fullWidth ? "w-full" : "";

    return (
      <div className={cn("space-y-2", containerWidth)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</div>}

          <input type={type} className={inputStyles} ref={ref} disabled={disabled} {...props} />

          {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{rightIcon}</div>}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
