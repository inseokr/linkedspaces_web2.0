import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/bloggo/components/ui/Container";
import Card from "@/bloggo/components/ui/Card";
import Badge from "@/bloggo/components/ui/Badge";
import AppStoreBadge from "@/bloggo/components/marketing/AppStoreBadge";
import { GUIDES } from "./guides";

const BASE = "/bloggo";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Practical guides for turning your camera roll into travel blogs, Instagram carousels, photo books, videos, and maps with Bloggo.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndexPage() {
  return (
    <>
      <section className="pt-20 pb-16 border-b border-[var(--bloggo-border)]">
        <Container className="flex flex-col items-center text-center gap-6">
          <Badge variant="violet">Guides</Badge>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight max-w-3xl">
            Get more from your{" "}
            <span className="gradient-text">travel photos</span>
          </h1>
          <p className="text-lg text-[var(--bloggo-text-secondary)] max-w-2xl">
            Practical guides for turning your camera roll into blogs, carousels,
            photo books, videos, and maps.
          </p>
        </Container>
      </section>

      <section className="py-20 border-b border-[var(--bloggo-border)]">
        <Container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`${BASE}/guides/${guide.slug}`}
              className="group"
            >
              <Card padding="lg" hover className="h-full flex flex-col gap-3">
                <h2 className="text-lg font-bold text-[var(--bloggo-text-primary)]">
                  {guide.title}
                </h2>
                <p className="text-sm text-[var(--bloggo-text-secondary)] leading-relaxed">
                  {guide.metaDescription}
                </p>
                <span className="mt-auto text-sm font-semibold text-sky-500 group-hover:text-sky-400">
                  Read the guide →
                </span>
              </Card>
            </Link>
          ))}
        </Container>
      </section>

      <section className="py-20">
        <Container
          size="md"
          className="text-center flex flex-col items-center gap-6"
        >
          <h2 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
            Skip the reading — try it on your own photos
          </h2>
          <p className="text-[var(--bloggo-text-secondary)]">
            Bloggo is free to download. Your first blog takes seconds.
          </p>
          <AppStoreBadge />
        </Container>
      </section>
    </>
  );
}
