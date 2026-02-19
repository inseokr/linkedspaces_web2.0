interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={[
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      ].join(" ")}
    >
      {eyebrow && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-sky-500/15 text-sky-300 border border-sky-500/30">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-[var(--bloggo-text-primary)] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p
          className={[
            "text-[var(--bloggo-text-secondary)] leading-relaxed",
            align === "center" ? "max-w-2xl" : "max-w-xl",
          ].join(" ")}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
