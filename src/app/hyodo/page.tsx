import type { Metadata } from "next";
import StoreBadges from "@/hyodo/components/StoreBadges";
import { SITE_NAME, TAGLINE } from "@/hyodo/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} – ${TAGLINE}` },
  description: TAGLINE,
  alternates: { canonical: "/" },
};

const BENEFITS = [
  {
    emoji: "🏠",
    title: "Home or away",
    body: "See whether they're home, and when their phone was last used. Never where they are, and never what they did.",
  },
  {
    emoji: "🔔",
    title: "A gentle alert if it's quiet too long",
    body: "A normal day stays quiet. If the phone sits untouched at home longer than you choose (8, 12 or 24 hours), you get an alert.",
  },
  {
    emoji: "💜",
    title: "Knock knock",
    body: "One tap says “thinking of you.” You'll see when they've seen it, and they can knock back.",
  },
];

const SCREENSHOTS = [
  {
    file: "01-know",
    alt: "Home screen showing they're home and when the phone was last used",
  },
  { file: "02-knock", alt: "Sending a knock that says thinking of you" },
  {
    file: "03-alert",
    alt: "An alert after the phone has been quiet at home too long",
  },
  { file: "04-easy", alt: "Setup with a 6-character family code" },
  { file: "05-love", alt: "A knock received, with the option to knock back" },
];

export default function HyodoHomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 50% -10%, #E4DCFA 0%, rgba(246,243,253,0) 70%)",
          }}
        />
        <div className="hw-container relative grid items-center gap-10 pt-10 pb-12 sm:pt-16 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:pb-20">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hyodo/AppIcon.svg"
              alt={`${SITE_NAME} app icon`}
              width={88}
              height={88}
              className="h-[72px] w-[72px] rounded-[20px] shadow-[0_10px_30px_rgba(78,59,160,0.25)] sm:h-[88px] sm:w-[88px] sm:rounded-[22px]"
            />
            <h1 className="mt-6 text-[2.25rem] leading-[1.1] font-semibold sm:text-5xl">
              Know they&rsquo;re OK.
              <br />
              <span className="text-[var(--hw-brand)]">
                Let them know they&rsquo;re loved.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--hw-ink-soft)]">
              {SITE_NAME} is a gentle safety net for someone who lives alone,
              like a parent, grandparent or friend. Their phone already knows
              when it&rsquo;s being used. {SITE_NAME} simply notices.
            </p>
            <StoreBadges className="mt-7" />
          </div>

          <div className="mx-auto w-full max-w-[280px] sm:max-w-[300px]">
            <div className="rounded-[2.75rem] bg-[var(--hw-ink)] p-2.5 shadow-[0_24px_60px_rgba(35,21,69,0.28)]">
              <video
                className="block aspect-[886/1920] w-full rounded-[2.25rem] bg-[var(--hw-lilac)] object-cover"
                src="/hyodo/HomeWatch-preview-6.9.mp4"
                poster="/hyodo/screenshots/web/01-know.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={`${SITE_NAME} app preview`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        className="hw-container py-6 sm:py-10"
        aria-labelledby="benefits"
      >
        <h2 id="benefits" className="sr-only">
          What {SITE_NAME} does
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {BENEFITS.map((b) => (
            <li key={b.title} className="hw-card p-6">
              <div
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--hw-lilac)] text-2xl"
              >
                {b.emoji}
              </div>
              <h3 className="mt-4 text-xl font-semibold">{b.title}</h3>
              <p className="mt-2 leading-relaxed text-[var(--hw-ink-soft)]">
                {b.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Screenshots */}
      <section className="py-10 sm:py-14" aria-labelledby="screens">
        <div className="hw-container">
          <h2 id="screens" className="text-2xl font-semibold sm:text-3xl">
            A normal day stays quiet
          </h2>
          <p className="mt-2 max-w-xl text-[var(--hw-ink-soft)]">
            No buttons to press, no &ldquo;I&rsquo;m OK&rdquo; every morning.
            Using their phone is enough.
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-[64rem]">
          <ul className="hw-shots">
            {SCREENSHOTS.map((s) => (
              <li key={s.file}>
                <a href={`/hyodo/screenshots/${s.file}.png`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/hyodo/screenshots/web/${s.file}.jpg`}
                    alt={s.alt}
                    width={660}
                    height={1434}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-[200px] rounded-[1.5rem] border border-[var(--hw-border)] shadow-[0_8px_24px_rgba(78,59,160,0.12)] sm:w-[230px]"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Privacy promise */}
      <section className="hw-container pb-4">
        <div className="rounded-[1.75rem] bg-[var(--hw-brand)] px-6 py-10 text-center text-white sm:px-10 sm:py-14">
          <p className="hw-display text-2xl leading-snug font-semibold text-white sm:text-3xl">
            No cameras. No tracking.
            <br className="sm:hidden" /> Just home or away.
          </p>
          <p className="mx-auto mt-3 max-w-lg text-white/85">
            Your family sees home or away, when the phone was last used, and
            phone health. That&rsquo;s it. No ads, and we never sell your data.
          </p>
          <div className="mt-7 flex justify-center">
            <StoreBadges className="justify-center" />
          </div>
        </div>
      </section>
    </>
  );
}
