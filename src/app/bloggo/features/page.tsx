import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/bloggo/components/ui/Container";
import Card from "@/bloggo/components/ui/Card";
import Badge from "@/bloggo/components/ui/Badge";
import SectionHeader from "@/bloggo/components/ui/SectionHeader";
import Button from "@/bloggo/components/ui/Button";

const BASE = "/bloggo";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore Bloggo's powerful features for writers and developers — rich editor, analytics, custom domains, and more.",
};

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

export default function FeaturesPage() {
  return (
    <>
      <section className="pt-20 pb-16 border-b border-[var(--bloggo-border)]">
        <Container className="flex flex-col items-center text-center gap-6">
          <Badge variant="violet">Features</Badge>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight max-w-3xl">
            The tools that turn{" "}
            <span className="gradient-text">photos into blogs</span>
          </h1>
          <p className="text-lg text-[var(--bloggo-text-secondary)] max-w-2xl">
            Bloggo does the heavy lifting, so you can focus on writing.
          </p>
        </Container>
      </section>

      <section className="py-20 border-b border-[var(--bloggo-border)]">
        <Container className="flex flex-col gap-12">
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

      <section className="py-20">
        <Container
          size="md"
          className="text-center flex flex-col items-center gap-6"
        >
          <h2 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
            Ready to get started?
          </h2>
          <p className="text-[var(--bloggo-text-secondary)]">
            Try Bloggo today.
          </p>
          <div className="flex gap-3">
            <Link href={`${BASE}/profile/demo`}>
              <Button variant="secondary">Demo Profile</Button>
            </Link>
            <Link href={`${BASE}/sign-in`}>
              <Button variant="primary">Sign In</Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
