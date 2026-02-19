import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  hover = false,
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-[var(--bloggo-border)] bg-[var(--bloggo-bg-card)]",
        "shadow-xl shadow-black/20",
        hover &&
          "transition-all duration-300 hover:border-sky-500/30 hover:bg-[var(--bloggo-bg-card-hover)] hover:shadow-sky-900/20 hover:-translate-y-0.5",
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
