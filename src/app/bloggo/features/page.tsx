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

const featureGroups = [
  {
    group: "Writing Experience",
    badge: "Editor",
    badgeVariant: "violet" as const,
    features: [
      {
        icon: "✍️",
        title: "Rich Text Editor",
        description:
          "A distraction-free editor with markdown support, code blocks with syntax highlighting, and inline image uploads.",
      },
      {
        icon: "🖼️",
        title: "Image Galleries",
        description:
          "Add beautiful image galleries to your posts with a built-in lightbox viewer. Drag to reorder, click to zoom.",
      },
      {
        icon: "💾",
        title: "Auto-Save",
        description:
          "Never lose your work. Bloggo auto-saves your drafts every few seconds, with full version history.",
      },
      {
        icon: "📋",
        title: "Templates",
        description:
          "Start from a curated library of post templates — tutorials, case studies, opinion pieces, and more.",
      },
    ],
  },
  {
    group: "Publishing & Growth",
    badge: "Platform",
    badgeVariant: "green" as const,
    features: [
      {
        icon: "🌍",
        title: "Custom Domains",
        description:
          "Connect your own domain and make your blog truly yours. SSL included, zero configuration.",
      },
      {
        icon: "📊",
        title: "Analytics Dashboard",
        description:
          "Understand your audience with privacy-friendly analytics. See views, reads, and top posts at a glance.",
      },
      {
        icon: "🔔",
        title: "Newsletter",
        description:
          "Turn readers into subscribers. Send beautiful email newsletters directly from your Bloggo dashboard.",
      },
      {
        icon: "🔍",
        title: "SEO Tools",
        description:
          "Built-in SEO optimization with meta tags, Open Graph images, sitemaps, and structured data.",
      },
    ],
  },
  {
    group: "Developer Features",
    badge: "Dev",
    badgeVariant: "blue" as const,
    features: [
      {
        icon: "🔌",
        title: "REST API",
        description:
          "Full REST API access to your blog data. Build custom integrations, mobile apps, or automate publishing.",
      },
      {
        icon: "🪝",
        title: "Webhooks",
        description:
          "Trigger webhooks on publish, comment, or subscriber events. Integrate with any service.",
      },
      {
        icon: "📦",
        title: "Import / Export",
        description:
          "Import from Medium, Substack, Ghost, or WordPress. Export your data anytime in standard formats.",
      },
      {
        icon: "🎨",
        title: "Theme API",
        description:
          "Build custom themes with our component API. Full control over your blog's look and feel.",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <section className="pt-20 pb-16 border-b border-[var(--bloggo-border)]">
        <Container className="flex flex-col items-center text-center gap-6">
          <Badge variant="violet">Features</Badge>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight max-w-3xl">
            Everything you need to{" "}
            <span className="gradient-text">write and grow</span>
          </h1>
          <p className="text-lg text-[var(--bloggo-text-secondary)] max-w-2xl">
            Bloggo packs a professional-grade feature set into a beautifully
            simple interface. No bloat, no confusion — just powerful tools that
            get out of your way.
          </p>
          <Link href={`${BASE}/pricing`}>
            <Button size="lg" variant="primary">
              See Pricing
            </Button>
          </Link>
        </Container>
      </section>

      {featureGroups.map((group) => (
        <section
          key={group.group}
          className="py-20 border-b border-[var(--bloggo-border)]"
        >
          <Container className="flex flex-col gap-12">
            <SectionHeader
              eyebrow={group.badge}
              title={group.group}
              align="left"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {group.features.map((feat) => (
                <Card
                  key={feat.title}
                  hover
                  padding="md"
                  className="flex flex-col gap-3"
                >
                  <div
                    className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-black/5"
                    aria-hidden="true"
                  >
                    {feat.icon}
                  </div>
                  <h3 className="font-semibold text-[var(--bloggo-text-primary)]">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[var(--bloggo-text-secondary)] leading-relaxed">
                    {feat.description}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      ))}

      <section className="py-20">
        <Container
          size="md"
          className="text-center flex flex-col items-center gap-6"
        >
          <h2 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
            Ready to get started?
          </h2>
          <p className="text-[var(--bloggo-text-secondary)]">
            Try Bloggo free — no credit card required.
          </p>
          <div className="flex gap-3">
            <Link href={`${BASE}/editor/my-first-post`}>
              <Button variant="primary">Start Writing Free</Button>
            </Link>
            <Link href={`${BASE}/pricing`}>
              <Button variant="secondary">View Plans</Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
