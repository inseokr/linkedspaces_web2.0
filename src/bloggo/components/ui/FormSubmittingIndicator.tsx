"use client";

type Props = {
  active: boolean;
  message?: string;
  className?: string;
};

/**
 * Indeterminate progress + status for async form submits (no true % available).
 */
export default function FormSubmittingIndicator({
  active,
  message = "Sending your message…",
  className = "",
}: Props) {
  if (!active) return null;

  return (
    <div
      className={[
        "flex flex-col gap-2 w-full animate-in fade-in duration-200",
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="text-sm font-medium text-[var(--bloggo-text-secondary)] text-center">
        {message}
      </p>
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--bloggo-border)]"
        aria-hidden="true"
      >
        <div className="form-submit-indeterminate-fill absolute top-0 bottom-0 w-[42%] rounded-full bg-gradient-to-r from-sky-600 via-sky-400 to-sky-600 shadow-[0_0_12px_rgba(14,165,233,0.45)]" />
      </div>
    </div>
  );
}
