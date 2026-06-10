import Link from "next/link";
import Image from "next/image";
import Container from "@/bloggo/components/ui/Container";
import Button from "@/bloggo/components/ui/Button";
import Badge from "@/bloggo/components/ui/Badge";
import BloggoHomeRedirect from "@/bloggo/components/BloggoHomeRedirect";

const BASE = "/bloggo";

const APP_STORE_URL = "https://apps.apple.com/us/app/bloggo/id6759849314";

const steps = [
  {
    number: "01",
    emoji: "📸",
    title: "Memories are meant to last.",
    desc: "Photos shouldn't sit scattered in your camera roll, forgotten. We group them by place and turn scattered shots into a clear, organized draft.",
    microcopy: "Just choose the adventure you want to tell.",
    side: "left",
  },
  {
    number: "02",
    emoji: "📍",
    title: "You shouldn't start from nothing.",
    desc: "Your photos become a structured blog draft in seconds, so you never start from scratch.",
    microcopy: '"IMG_4821" → "Blue Bottle Coffee, San Francisco."',
    side: "right",
  },
  {
    number: "03",
    emoji: "✨",
    title: "You already lived the story.",
    desc: "Now you can write it without the friction. Focus on adding your voice, your perspective, and the details that make it uniquely yours.",
    microcopy: "Never from scratch again.",
    side: "left",
  },
];

const privacyFeatures = [
  {
    icon: "🔒",
    title: "Local first, private by default.",
    desc: "Your blog drafts live on your device until you export or publish. Nothing is shared unless you choose.",
  },
  {
    icon: "👤",
    title: "Try it as a guest.",
    desc: "No account needed to get started. Guests can save one blog and export once; both stay on your device.",
  },
  {
    icon: "✨",
    title: "Unlimited with a free account.",
    desc: "Sign in to save and export as many blogs as you like, with the same local first privacy and no guest caps.",
  },
];

export default function BloggoHomePage() {
  return (
    <>
      <BloggoHomeRedirect />

      {/* ── HERO — untouched ── */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-10 sm:pb-16">
        <Container>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 lg:gap-16">
            {/* Left column — text content */}
            <div className="flex flex-col items-start text-left gap-6 lg:max-w-[520px]">
              <Badge variant="violet" size="lg" className="text-gray-300">
                Photo-First Blogging
              </Badge>
              <h1 className="text-balance text-5xl font-black leading-[1.08] tracking-tight text-[var(--bloggo-text-primary)] sm:text-6xl lg:text-7xl">
                Turn Trip Photos into{" "}
                <span className="gradient-text">Blogs. Fast.</span>
              </h1>
              <p className="text-lg leading-relaxed text-[var(--bloggo-text-secondary)] sm:text-xl">
                Bloggo eliminates blank page anxiety. Turn your camera roll into
                a blog draft in seconds.
              </p>
              <div className="mt-2 flex flex-wrap gap-4">
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download Bloggo on the App Store"
                >
                  <Image
                    src="/images/app-store-badge.svg"
                    alt="Download on the App Store"
                    width={160}
                    height={54}
                    className="h-[54px] w-auto"
                  />
                </a>
                <Link href={`${BASE}/features`}>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-black hover:text-black"
                  >
                    Explore features
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right column — hero image */}
            <div className="flex justify-center lg:justify-end flex-shrink-0">
              <div className="relative w-[360px] sm:w-[480px] lg:w-[600px] aspect-[3/4]">
                <Image
                  src="/images/Untitled (2064 x 2752 px).png"
                  alt="Bloggo app preview"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </Container>

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(100vw,600px)] w-[min(100vw,600px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          }}
        />
      </section>

      {/* ── HOW IT WORKS — vertical timeline ── */}
      <section style={{ background: "#060d1f" }} className="py-24">
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{
              background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.25)",
              color: "#38bdf8",
            }}
          >
            How It Works
          </span>
          <h2
            className="text-4xl sm:text-5xl font-black tracking-tight leading-tight"
            style={{ color: "white" }}
          >
            From camera roll
            <br />
            to published blog.
          </h2>
        </div>

        {/* Timeline */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              const StepContent = () => (
                <div className={index === 0 ? "pt-0" : ""}>
                  <div
                    className="text-xs font-bold tracking-widest uppercase mb-2"
                    style={{ color: "#38bdf8" }}
                  >
                    Step {step.number}
                  </div>
                  <h3
                    className="text-xl font-black mb-3 leading-snug"
                    style={{ color: "white" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-3"
                    style={{ color: "#94a3b8" }}
                  >
                    {step.desc}
                  </p>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs italic"
                    style={{
                      background: "rgba(56,189,248,0.08)",
                      border: "1px solid rgba(56,189,248,0.15)",
                      color: "#38bdf8",
                    }}
                  >
                    {step.microcopy}
                  </span>
                </div>
              );

              return (
                <div
                  key={step.number}
                  className="grid grid-cols-1 md:grid-cols-[1fr_48px_1fr] md:items-stretch"
                >
                  {/* Left slot */}
                  <div
                    className={`hidden md:block md:pr-14 pb-12 ${step.side === "left" ? "md:text-right" : ""}`}
                  >
                    {step.side === "left" && <StepContent />}
                  </div>

                  {/* Center: node + connecting line */}
                  <div className="hidden md:flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 z-10"
                      style={{
                        background: "#0ea5e9",
                        border: "3px solid #060d1f",
                        boxShadow:
                          "0 0 0 2px #38bdf8, 0 0 20px rgba(56,189,248,0.4)",
                      }}
                    >
                      {step.emoji}
                    </div>
                    {!isLast && (
                      <div
                        className="flex-1 w-0.5 mt-1"
                        style={{
                          background:
                            "linear-gradient(180deg, #38bdf8, #0284c7)",
                          opacity: 0.55,
                        }}
                      />
                    )}
                  </div>

                  {/* Right slot */}
                  <div
                    className={`hidden md:block md:pl-14 pb-12 ${step.side === "right" ? "" : ""}`}
                  >
                    {step.side === "right" && <StepContent />}
                  </div>

                  {/* Mobile: node + content stacked */}
                  <div className="md:hidden flex gap-4 items-start pb-10">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: "#0ea5e9",
                        border: "3px solid #060d1f",
                        boxShadow:
                          "0 0 0 2px #38bdf8, 0 0 16px rgba(56,189,248,0.4)",
                      }}
                    >
                      {step.emoji}
                    </div>
                    <StepContent />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRIVACY FIRST ── */}
      <section
        style={{
          background: "#0a1628",
          borderTop: "1px solid rgba(56,189,248,0.1)",
          borderBottom: "1px solid rgba(56,189,248,0.1)",
        }}
        className="py-24"
      >
        <div className="text-center mb-14 px-6">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{
              background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.25)",
              color: "#38bdf8",
            }}
          >
            Privacy First
          </span>
          <h2
            className="text-4xl sm:text-5xl font-black tracking-tight mb-4"
            style={{ color: "white" }}
          >
            Private by default
          </h2>
          <p
            className="text-base leading-relaxed max-w-xl mx-auto"
            style={{ color: "#94a3b8" }}
          >
            Your trip blogs stay on your phone until you export or publish. Try
            Bloggo as a guest, or sign in when you&apos;re ready for unlimited
            saves and exports.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {privacyFeatures.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: "rgba(56,189,248,0.1)",
                  border: "1px solid rgba(56,189,248,0.15)",
                }}
              >
                {f.icon}
              </div>
              <div>
                <h4
                  className="text-sm font-extrabold mb-1"
                  style={{ color: "#f1f5f9" }}
                >
                  {f.title}
                </h4>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#94a3b8" }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BIG EMOTIONAL CTA ── */}
      <section
        style={{ background: "#060d1f" }}
        className="py-32 px-6 text-center relative overflow-hidden"
      >
        {/* Glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(14,165,233,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8"
            style={{
              background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.25)",
              color: "#38bdf8",
            }}
          >
            Ready?
          </span>
          <h2
            className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-5"
            style={{ color: "white" }}
          >
            The trip happened.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Now tell the story.
            </span>
          </h2>
          <p className="text-lg mb-10" style={{ color: "#64748b" }}>
            Download Bloggo on the App Store and start your first draft today.
          </p>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Bloggo on the App Store"
          >
            <Image
              src="/images/app-store-badge.svg"
              alt="Download on the App Store"
              width={200}
              height={67}
              className="h-[67px] w-auto mx-auto"
            />
          </a>
        </div>
      </section>
    </>
  );
}
