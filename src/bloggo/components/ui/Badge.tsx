type BadgeVariant = "default" | "violet" | "green" | "yellow" | "red" | "blue";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  /** Larger, stronger treatment for hero / section emphasis */
  size?: "sm" | "lg";
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-black/5 text-[var(--bloggo-text-secondary)] border-white/10",
  violet:
    "bg-sky-500/15 text-sky-800 border-sky-500/40 dark:text-sky-200 dark:border-sky-500/35",
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  yellow: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  red: "bg-red-500/15 text-red-300 border-red-500/30",
  blue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
};

const sizeClasses = {
  sm: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
  lg: "inline-flex items-center px-4 py-2 rounded-full text-sm sm:text-[15px] font-semibold tracking-wide border shadow-sm",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[sizeClasses[size], variantClasses[variant], className].join(
        " ",
      )}
    >
      {children}
    </span>
  );
}
