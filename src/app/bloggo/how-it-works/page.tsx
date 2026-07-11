import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Container from "@/bloggo/components/ui/Container";
import Card from "@/bloggo/components/ui/Card";
import Badge from "@/bloggo/components/ui/Badge";
import SectionHeader from "@/bloggo/components/ui/SectionHeader";
import JsonLd from "@/bloggo/components/seo/JsonLd";
import AppStoreBadge from "@/bloggo/components/marketing/AppStoreBadge";

const BASE = "/bloggo";

export const metadata: Metadata = {
  title: "How it works – turn photos into a travel blog",
  description:
    "Bloggo is an AI travel journal for iPhone. See how it finds trips in your camera roll, groups photos by place, and drafts a travel blog in seconds.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    number: "01",
    title: "Bloggo finds the trips in your camera roll",
    body: "Open Bloggo and tap 'Tap to Blog'. It scans your photo library on your device, using time and location metadata to detect when you were traveling. Every trip appears in a list with its dates, city, and photo count — from a three-week tour to a Saturday in the next town over.",
    screenshot: {
      src: "/bloggo/screenshots/automatic-trip-detection.png",
      alt: "Bloggo's Your Memories screen listing trips detected from the camera roll, grouped by year, with a Create Blog button",
    },
  },
  {
    number: "02",
    title: "Your photos are grouped by place",
    body: "Pick a trip and Bloggo clusters its photos by the places you visited, in the order you visited them. Each day gets a route map with numbered stops and the distances between them, so the shape of the day is visible before you write a word.",
    screenshot: {
      src: "/bloggo/screenshots/trip-route-map.png",
      alt: "A day route map in Bloggo with numbered place stops and distances between them",
    },
  },
  {
    number: "03",
    title: "You get a structured blog draft in seconds",
    body: "Bloggo turns the grouped photos into a blog draft: a cover with your trip title and map, a page per day, and a card per place with your photos already in order. Describe each day in a sentence, tell the story behind a photo, and the draft becomes yours.",
    screenshot: {
      src: "/bloggo/screenshots/write-your-travel-story.png",
      alt: "Bloggo's editor showing a day summary field, a place card, and photo captions ready to edit",
    },
  },
];

const exportOptions = [
  {
    icon: "🖼️",
    title: "Instagram carousel",
    body: "Ready-made slides with covers, maps, and place highlights, in 4:5 or 9:16.",
    href: `${BASE}/guides/instagram-carousel-from-travel-photos`,
  },
  {
    icon: "📖",
    title: "PDF storybook",
    body: "A printable travel photo book from your blog, in one tap.",
    href: `${BASE}/guides/travel-photo-book-from-iphone`,
  },
  {
    icon: "🎬",
    title: "Video slideshow",
    body: "A slideshow video with music, ready for reels and stories.",
    href: `${BASE}/guides/travel-video-slideshow-with-music`,
  },
];

const faqs = [
  {
    question: "Does Bloggo upload my photos?",
    answer:
      "No. Bloggo reads photo metadata like time and location on your device to organize trips. Your photos are never uploaded, and blog drafts stay on your iPhone unless you export or publish them.",
    learnMore: {
      href: `${BASE}/guides/private-travel-journal-app`,
      label: "Private travel journal",
    },
  },
  {
    question: "How does Bloggo know where my photos were taken?",
    answer:
      "Your iPhone stores a timestamp and location with every photo. Bloggo groups photos into trips and places from that metadata — no manual sorting, no uploads.",
    learnMore: {
      href: `${BASE}/guides/organize-travel-photos-by-trip`,
      label: "Organize photos by trip",
    },
  },
  {
    question: "Can I make an Instagram carousel from my trip photos?",
    answer:
      "Yes. Bloggo exports your blog as Instagram-ready slides — cover pages, maps, and place highlights included — in 4:5 or 9:16. Save them to your camera roll or share them directly.",
    learnMore: {
      href: `${BASE}/guides/instagram-carousel-from-travel-photos`,
      label: "Make a carousel",
    },
  },
  {
    question: "Can I turn a trip into a photo book?",
    answer:
      "Yes. One tap exports your blog as a printable PDF storybook with your photos, maps, and captions laid out for reading or printing.",
    learnMore: {
      href: `${BASE}/guides/travel-photo-book-from-iphone`,
      label: "Create a photo book",
    },
  },
  {
    question: "Can I make a video slideshow with music?",
    answer:
      "Yes. Bloggo generates a slideshow video from your blog, set to music and ready to share to reels, stories, or anywhere else.",
    learnMore: {
      href: `${BASE}/guides/travel-video-slideshow-with-music`,
      label: "Make a video slideshow",
    },
  },
  {
    question: "Does it work for everyday photos, not just trips?",
    answer:
      "Yes. Bloggo captures everyday moments too — the new café, Sunday's hike, last week's dinner — and groups them by place just like travel.",
    learnMore: {
      href: `${BASE}/guides/photo-journal-app-for-everyday-life`,
      label: "Photo journal for everyday life",
    },
  },
  {
    question: "Can I see a map of everywhere I've been?",
    answer:
      "Yes. Bloggo builds a private places-visited map from your photos, browsable by year and category, entirely on your device.",
    learnMore: {
      href: `${BASE}/guides/travel-map-of-places-visited`,
      label: "Map your travels",
    },
  },
  {
    question: "What about photos from years ago?",
    answer:
      "Bloggo scans your whole camera roll, so trips and everyday days from years back can become entries today.",
    learnMore: {
      href: `${BASE}/guides/turn-camera-roll-into-diary`,
      label: "Turn your camera roll into a diary",
    },
  },
  {
    question: "Can I edit the blog Bloggo creates?",
    answer:
      "Yes. Every title, caption, and photo is editable. The draft is a starting point — the structure is done, the words are yours.",
    learnMore: {
      href: `${BASE}/guides/turn-photos-into-travel-blog`,
      label: "Turn photos into a travel blog",
    },
  },
  {
    question: "Is Bloggo free?",
    answer:
      "Bloggo is free to download. You can try it as a guest — save one blog and export once — and a free account removes those caps.",
    learnMore: { href: `${BASE}/pricing`, label: "Pricing" },
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to turn your photos into a travel blog with Bloggo",
  step: steps.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.body,
  })),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={howToJsonLd} />
      <JsonLd data={faqJsonLd} />

      <section className="pt-20 pb-16 border-b border-[var(--bloggo-border)]">
        <Container className="flex flex-col items-center text-center gap-6">
          <Badge variant="violet">How it works</Badge>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight max-w-3xl">
            Turn your photos into a{" "}
            <span className="gradient-text">travel blog</span>
          </h1>
          <p className="text-lg text-[var(--bloggo-text-secondary)] max-w-2xl">
            Bloggo is an AI travel journal for iPhone. It finds trips in your
            camera roll, groups them by place, and drafts your blog — no blank
            page, no manual sorting.
          </p>
          <AppStoreBadge />
        </Container>
      </section>

      <section className="py-20 border-b border-[var(--bloggo-border)]">
        <Container size="lg" className="flex flex-col gap-16">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={[
                "flex flex-col items-center gap-10 lg:gap-16",
                i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row",
              ].join(" ")}
            >
              <div className="flex-1 flex flex-col gap-4">
                <span className="text-sm font-bold tracking-widest text-sky-500">
                  {step.number}
                </span>
                <h2 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
                  {step.title}
                </h2>
                <p className="text-[var(--bloggo-text-secondary)] leading-relaxed">
                  {step.body}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Image
                  src={step.screenshot.src}
                  alt={step.screenshot.alt}
                  width={310}
                  height={671}
                  className="rounded-3xl border border-[var(--bloggo-border)] shadow-xl"
                />
              </div>
            </div>
          ))}
        </Container>
      </section>

      <section className="py-20 border-b border-[var(--bloggo-border)]">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Share it"
            title="One trip, three ways to share"
            subtitle="Every blog exports as a carousel, a photo book, or a video — you choose the shape."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exportOptions.map((option) => (
              <Link key={option.href} href={option.href} className="group">
                <Card padding="lg" hover className="h-full flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-2xl">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--bloggo-text-primary)] mb-2">
                      {option.title}
                    </h3>
                    <p className="text-sm text-[var(--bloggo-text-secondary)]">
                      {option.body}
                    </p>
                  </div>
                  <span className="mt-auto text-sm font-semibold text-sky-500 group-hover:text-sky-400">
                    Read the guide →
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 border-b border-[var(--bloggo-border)]">
        <Container size="md" className="flex flex-col gap-12">
          <SectionHeader eyebrow="FAQ" title="Questions, answered" />
          <div className="flex flex-col gap-4">
            {faqs.map((faq) => (
              <Card
                key={faq.question}
                padding="lg"
                className="flex flex-col gap-3"
              >
                <h3 className="text-lg font-bold text-[var(--bloggo-text-primary)]">
                  {faq.question}
                </h3>
                <p className="text-sm text-[var(--bloggo-text-secondary)] leading-relaxed">
                  {faq.answer}
                </p>
                <Link
                  href={faq.learnMore.href}
                  className="text-sm font-semibold text-sky-500 hover:text-sky-400 w-fit"
                >
                  Learn more: {faq.learnMore.label} →
                </Link>
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
            Your next blog is already in your camera roll
          </h2>
          <p className="text-[var(--bloggo-text-secondary)]">
            Download Bloggo and turn your last trip into a blog in seconds.
          </p>
          <AppStoreBadge />
        </Container>
      </section>
    </>
  );
}
