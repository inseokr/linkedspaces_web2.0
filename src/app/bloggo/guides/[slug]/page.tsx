import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/bloggo/components/ui/Container";
import Card from "@/bloggo/components/ui/Card";
import JsonLd from "@/bloggo/components/seo/JsonLd";
import AppStoreBadge from "@/bloggo/components/marketing/AppStoreBadge";
import { GUIDES, getGuide } from "../guides";

const BASE = "/bloggo";
const SITE_URL = "https://bloggo.linkedspaces.com";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${guide.slug}` },
  };
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const related = guide.related.flatMap((relatedSlug) => {
    const relatedGuide = getGuide(relatedSlug);
    return relatedGuide ? [relatedGuide] : [];
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    image: `${SITE_URL}${guide.screenshot.src}`,
    author: { "@type": "Organization", name: "LinkedSpaces LLC" },
    publisher: {
      "@type": "Organization",
      name: "Bloggo",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/bloggo-icon.png` },
    },
    mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Bloggo",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: `${SITE_URL}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: `${SITE_URL}/guides/${guide.slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <article>
        <section className="pt-16 pb-12 border-b border-[var(--bloggo-border)]">
          <Container size="md" className="flex flex-col gap-6">
            <nav
              aria-label="Breadcrumb"
              className="text-sm text-[var(--bloggo-text-muted)]"
            >
              <Link
                href={BASE}
                className="hover:text-[var(--bloggo-text-primary)]"
              >
                Bloggo
              </Link>
              <span className="mx-2">/</span>
              <Link
                href={`${BASE}/guides`}
                className="hover:text-[var(--bloggo-text-primary)]"
              >
                Guides
              </Link>
            </nav>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              {guide.title}
            </h1>
            {guide.intro.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="text-lg text-[var(--bloggo-text-secondary)] leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
            <AppStoreBadge />
          </Container>
        </section>

        <section className="py-16 border-b border-[var(--bloggo-border)]">
          <Container
            size="lg"
            className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start"
          >
            <div className="flex-1 flex flex-col gap-8">
              <h2 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
                How to do it with Bloggo
              </h2>
              <ol className="flex flex-col gap-8">
                {guide.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/15 text-sky-500 font-bold flex items-center justify-center text-sm">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--bloggo-text-primary)] mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[var(--bloggo-text-secondary)] leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex-shrink-0 mx-auto">
              <Image
                src={guide.screenshot.src}
                alt={guide.screenshot.alt}
                width={310}
                height={671}
                className="rounded-3xl border border-[var(--bloggo-border)] shadow-xl"
              />
            </div>
          </Container>
        </section>

        <section className="py-16 border-b border-[var(--bloggo-border)]">
          <Container size="md" className="flex flex-col gap-8">
            <h2 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
              Common questions
            </h2>
            <div className="flex flex-col gap-4">
              {guide.faqs.map((faq) => (
                <Card
                  key={faq.question}
                  padding="lg"
                  className="flex flex-col gap-2"
                >
                  <h3 className="text-lg font-bold text-[var(--bloggo-text-primary)]">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-[var(--bloggo-text-secondary)] leading-relaxed">
                    {faq.answer}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {related.length > 0 && (
          <section className="py-16 border-b border-[var(--bloggo-border)]">
            <Container size="lg" className="flex flex-col gap-8">
              <h2 className="text-2xl font-bold text-[var(--bloggo-text-primary)]">
                Related guides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((relatedGuide) => (
                  <Link
                    key={relatedGuide.slug}
                    href={`${BASE}/guides/${relatedGuide.slug}`}
                    className="group"
                  >
                    <Card
                      padding="lg"
                      hover
                      className="h-full flex flex-col gap-3"
                    >
                      <h3 className="text-base font-bold text-[var(--bloggo-text-primary)]">
                        {relatedGuide.title}
                      </h3>
                      <span className="mt-auto text-sm font-semibold text-sky-500 group-hover:text-sky-400">
                        Read the guide →
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        )}

        <section className="py-16">
          <Container
            size="md"
            className="text-center flex flex-col items-center gap-6"
          >
            <h2 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
              Try it on your own photos
            </h2>
            <p className="text-[var(--bloggo-text-secondary)]">
              Bloggo is free to download. Your first blog takes seconds.
            </p>
            <AppStoreBadge />
          </Container>
        </section>
      </article>
    </>
  );
}
