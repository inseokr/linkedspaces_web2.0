import Link from "next/link";

export default function HyodoNotFound() {
  return (
    <div className="hw-container-narrow flex flex-col items-center py-24 text-center">
      <p className="hw-display text-6xl font-semibold text-[var(--hw-brand-mid)]">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold">
        This page isn&rsquo;t home.
      </h1>
      <p className="mt-2 text-[var(--hw-ink-soft)]">
        The page you&rsquo;re looking for doesn&rsquo;t exist.
      </p>
      <Link href="/" className="hw-button mt-8">
        Go to HomeWatch
      </Link>
    </div>
  );
}
