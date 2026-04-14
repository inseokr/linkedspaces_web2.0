"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** When set and `loading` is true, replaces `children` (e.g. "Sending…"). */
  loadingLabel?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 border border-sky-500/30",
  secondary:
    "bg-black/5 hover:bg-black/5 text-[var(--bloggo-text-primary)] border border-white/10 hover:border-white/20",
  ghost:
    "bg-transparent hover:bg-black/5 text-[var(--bloggo-text-secondary)] hover:text-[var(--bloggo-text-primary)]",
  destructive:
    "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      loadingLabel,
      children,
      className = "",
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const content =
      loading && loadingLabel !== undefined ? loadingLabel : children;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={[
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bloggo-bg)]",
          "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-[0.98] disabled:active:scale-100",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
