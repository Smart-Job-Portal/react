import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../utils";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: "default" | "filled";
  resize?: "none" | "vertical" | "horizontal" | "both";
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = false,
      variant = "default",
      resize = "vertical",
      disabled,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    const variants = {
      default: "border-gray-300 bg-white focus-visible:ring-blue-500",
      filled: "border-transparent bg-gray-100 focus-visible:ring-blue-500 focus:bg-white focus:border-gray-300",
    };

    const resizeStyles = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    };

    const errorStyles = error ? "border-red-500 focus-visible:ring-red-500" : "";

    const textAreaStyles = cn(baseStyles, variants[variant], resizeStyles[resize], errorStyles, className);

    const containerWidth = fullWidth ? "w-full" : "";

    return (
      <div className={cn("space-y-2", containerWidth)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea className={textAreaStyles} ref={ref} disabled={disabled} rows={rows} {...props} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";

export { TextArea };
