import { LAST_UPDATED } from "@/hyodo/lib/site";

/** Shared shell for Privacy / Terms / Delete account: title, last-updated date, body. */
export default function LegalPage({
  eyebrow = "Legal",
  title,
  intro,
  showLastUpdated = true,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: React.ReactNode;
  showLastUpdated?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className="hw-container-narrow pt-10 pb-6 sm:pt-16">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--hw-brand-mid)]">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-[2rem] leading-tight font-semibold sm:text-[2.5rem]">
        {title}
      </h1>
      {showLastUpdated && (
        <p className="mt-2 text-sm text-[var(--hw-muted)]">
          Last updated: {LAST_UPDATED}
        </p>
      )}
      {intro && (
        <p className="mt-5 text-lg leading-relaxed text-[var(--hw-ink-soft)]">
          {intro}
        </p>
      )}
      <div className="hw-prose mt-6">{children}</div>
    </article>
  );
}
