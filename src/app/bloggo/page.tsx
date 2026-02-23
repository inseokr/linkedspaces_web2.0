import Link from "next/link";
import Container from "@/bloggo/components/ui/Container";
import Button from "@/bloggo/components/ui/Button";
import Card from "@/bloggo/components/ui/Card";
import Badge from "@/bloggo/components/ui/Badge";
import SectionHeader from "@/bloggo/components/ui/SectionHeader";
import BloggoHomeRedirect from "@/bloggo/components/BloggoHomeRedirect";

const BASE = "/bloggo";

const howItWorks = [
  {
    step: "1",
    title: "Select Your Trip",
    description:
      "No digging through your camera roll. Your photos are already grouped by date and trip.",
    microCopy: "Just choose the adventure you want to turn into a blog.",
    icon: "📸",
  },
  {
    step: "2",
    title: "We Organize by Place",
    description:
      "Bloggo detects real locations from your photo metadata and structures your trip into chapters by place.",
    microCopy: 'From "IMG_4821" to "Blue Bottle Coffee, San Francisco."',
    icon: "📍",
  },
  {
    step: "3",
    title: "Your Recap Blog Is Built",
    description:
      "A structured, beautifully formatted recap is generated instantly. Edit, enrich, and share anywhere.",
    microCopy: "Never from scratch again.",
    icon: "✨",
  },
];

const smartFeatures = [
  {
    title: "Smart Photo Picker",
    description:
      "Intelligently selects your best shots, filtering out duplicates and blurs.",
    icon: "🖼️",
  },
  {
    title: "Automatic Place Detection",
    description:
      "Uses GPS metadata to identify exactly where each memory happened.",
    icon: "🗺️",
  },
  {
    title: "Instant Blog Structure",
    description:
      "Creates a narrative arc for your trip, organized by location and time.",
    icon: "🏗️",
  },
  {
    title: "Edit & Enrich",
    description:
      "Add your voice, captions, and details to make the story yours.",
    icon: "✍️",
  },
  {
    title: "Share Anywhere",
    description: "Available to view on any platform",
    icon: "🚀",
  },
];

export default function BloggoHomePage() {
  return (
    <>
      <BloggoHomeRedirect />
      <section className="relative pt-32 pb-24 overflow-hidden">
        <Container className="flex flex-col items-center text-center gap-8">
          <Badge variant="violet">🚀 Photo-First Blogging</Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight max-w-4xl">
            Turn Trip Photos into{" "}
            <span className="gradient-text">Blogs. Fast.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--bloggo-text-secondary)] max-w-2xl leading-relaxed">
            Bloggo eliminates blank page anxiety. Turn your camera roll into a
            blog draft in seconds.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <Link href={`${BASE}/profile/demo`}>
              <Button size="lg" variant="secondary">
                Demo Profile
              </Button>
            </Link>
            <Link href={`${BASE}/editor/new`}>
              <Button size="lg" variant="primary">
                Try Today
                <svg
                  className="w-4 h-4"
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
        </Container>

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-50"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
          }}
        />
      </section>

      <section className="py-24 border-t border-[var(--bloggo-border)] bg-[var(--bloggo-bg-secondary)]/30">
        <Container className="flex flex-col gap-16">
          <SectionHeader
            eyebrow="How It Works"
            title="From Camera Roll to Blog in 3 Steps"
            subtitle="Stop staring at a blank screen. Let your photos tell the story first."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step) => (
              <Card
                key={step.step}
                padding="lg"
                className="relative group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="absolute top-6 right-6 text-4xl font-black text-black/20 select-none group-hover:text-blue-600 transition-colors">
                  {step.step}
                </div>
                <div className="text-4xl mb-6" aria-hidden="true">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-[var(--bloggo-text-primary)] mb-3">
                  {step.title}
                </h3>
                <p className="text-[var(--bloggo-text-secondary)] leading-relaxed mb-4">
                  {step.description}
                </p>
                <div className="text-sm font-medium text-violet-600/80 bg-violet-50/50 p-3 rounded-lg border border-violet-100/50">
                  {step.microCopy}
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 border-t border-[var(--bloggo-border)]">
        <Container className="flex flex-col gap-16">
          <SectionHeader
            eyebrow="Smart Features"
            title="The Power of AI-Organized Memories"
            subtitle="We handle the heavy lifting of organization and formatting."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {smartFeatures.map((feature) => (
              <Card
                key={feature.title}
                padding="lg"
                className="flex flex-col gap-4 border-transparent hover:border-[var(--bloggo-border)] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-2xl">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--bloggo-text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--bloggo-text-secondary)]">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 border-t border-[var(--bloggo-border)]">
        <Container size="md">
          <Card
            padding="lg"
            className="flex flex-col items-center text-center gap-8 relative overflow-hidden py-16"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse 80% 80% at 50% 120%, rgba(124,58,237,0.15) 0%, transparent 70%)",
              }}
            />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2 className="text-4xl sm:text-5xl font-black text-[var(--bloggo-text-primary)] tracking-tight">
                Ready to relive your trips?
              </h2>
              <p className="text-lg text-[var(--bloggo-text-secondary)] max-w-lg">
                Stop letting your photos sit in your camera roll. Turn them into
                stories you can share forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-2">
                <Link href={`${BASE}/editor/new`}>
                  <Button
                    size="lg"
                    variant="primary"
                    className="w-full sm:w-auto px-8"
                  >
                    Start Building Now
                  </Button>
                </Link>
                <Link href={`${BASE}/profile/demo`}>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    See What&apos;s Possible
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
