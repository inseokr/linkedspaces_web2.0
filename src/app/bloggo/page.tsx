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
    title: "Memories are meant to last.",
    description:
      "Photos shouldn’t sit scattered in your camera roll, forgotten. We group them by place and turn scattered photos into a clear, organized draft.",
    microCopy: "Just choose the adventure you want to turn into a blog.",
    icon: "📸",
  },
  {
    step: "2",
    title: "You shouldn’t start from nothing.",
    description:
      "Your photos become a structured blog draft in seconds, so you never start from scratch.",
    microCopy: 'From "IMG_4821" to "Blue Bottle Coffee, San Francisco."',
    icon: "📍",
  },
  {
    step: "3",
    title: "You already lived the story.",
    description:
      "Now you can write it without the friction. You can focus on adding your voice, your perspective, and the details that make it yours.",
    microCopy: "Never from scratch again.",
    icon: "✨",
  },
];

const privateByDefaultFeatures = [
  {
    title: "Unlimited on your phone.",
    description: "Create and edit as many blogs as you want.",
    icon: "📱",
  },
  {
    title: "Write faster on desktop.",
    description: "Upload up to five blogs to edit on your computer.",
    icon: "💻",
  },
  {
    title: "You decide what gets shared.",
    description: "Nothing is published unless you choose.",
    icon: "🔒",
  },
];

export default function BloggoHomePage() {
  return (
    <>
      <BloggoHomeRedirect />
      <section className="relative overflow-hidden pt-28 pb-24 sm:pt-32 sm:pb-28">
        <Container
          size="md"
          className="relative z-10 flex flex-col items-center gap-8 text-center"
        >
          <Badge variant="violet" size="lg">
            Photo-First Blogging
          </Badge>
          <h1 className="text-balance text-5xl font-black leading-[1.08] tracking-tight text-[var(--bloggo-text-primary)] sm:text-6xl lg:text-7xl">
            Turn Trip Photos into{" "}
            <span className="gradient-text">Blogs. Fast.</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--bloggo-text-secondary)] sm:text-xl">
            Bloggo eliminates blank page anxiety. Turn your camera roll into a
            blog draft in seconds.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            <Link href={`${BASE}/features`}>
              <Button size="lg" variant="primary">
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
                <p className="text-[var(--bloggo-text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 border-t border-[var(--bloggo-border)]">
        <Container className="flex flex-col gap-16">
          <SectionHeader
            eyebrow="Privacy First"
            title="Private by default"
            subtitle="Your blogs are stored locally on your device. No account required."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {privateByDefaultFeatures.map((feature) => (
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
                Download the app and start building your drafts today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-2">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto px-8 opacity-50 cursor-not-allowed"
                  disabled
                >
                  Start Building Now
                </Button>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
