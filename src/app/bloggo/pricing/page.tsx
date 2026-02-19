"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/bloggo/components/ui/Container";
import Card from "@/bloggo/components/ui/Card";
import Badge from "@/bloggo/components/ui/Badge";
import SectionHeader from "@/bloggo/components/ui/SectionHeader";
import Button from "@/bloggo/components/ui/Button";

const BASE = "/bloggo";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for getting started and sharing your ideas.",
    badge: null as string | null,
    badgeVariant: "default" as const,
    features: [
      "1 blog",
      "Up to 10 posts/month",
      "BlogGo subdomain",
      "Basic analytics",
      "Community support",
      "5 GB storage",
    ],
    cta: "Get Started Free",
    ctaVariant: "secondary" as const,
    href: `${BASE}/editor/my-first-post`,
    minSubs: 0,
    maxSubs: 1000,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For serious writers who want to grow their audience.",
    badge: "Most Popular",
    badgeVariant: "violet" as const,
    features: [
      "Unlimited blogs",
      "Unlimited posts",
      "Custom domain",
      "Advanced analytics",
      "Newsletter (up to 1,000 subscribers)",
      "Priority support",
      "50 GB storage",
      "Remove BlogGo branding",
    ],
    cta: "Start Pro Trial",
    ctaVariant: "primary" as const,
    href: `${BASE}/editor/my-first-post`,
    minSubs: 1001,
    maxSubs: 10000,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "For teams and publications with multiple authors.",
    badge: null,
    badgeVariant: "default" as const,
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Collaborative editing",
      "Unlimited newsletter subscribers",
      "REST API access",
      "Webhooks",
      "Dedicated support",
      "500 GB storage",
    ],
    cta: "Contact Sales",
    ctaVariant: "secondary" as const,
    href: `${BASE}/support`,
    minSubs: 10001,
    maxSubs: Infinity,
  },
];

const faqs = [
  {
    q: "Can I change plans later?",
    a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any billing differences.",
  },
  {
    q: "Is there a free trial?",
    a: "The Starter plan is free forever. Pro and Team plans include a 14-day free trial — no credit card required.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. Annual plans receive a 20% discount.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel anytime from your account settings. You'll retain access until the end of your billing period.",
  },
];

export default function PricingPage() {
  const [subscribers, setSubscribers] = useState(500);

  const recommendedPlan = plans.find(
    (p) => subscribers >= p.minSubs && subscribers <= p.maxSubs,
  );

  return (
    <>
      <section className="pt-20 pb-16 border-b border-[var(--bloggo-border)]">
        <Container className="flex flex-col items-center text-center gap-6">
          <Badge variant="violet">Pricing</Badge>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight">
            Simple, <span className="gradient-text">transparent</span> pricing
          </h1>
          <p className="text-lg text-[var(--bloggo-text-secondary)] max-w-xl">
            Start free. Upgrade when you&apos;re ready. No hidden fees, no
            surprises.
          </p>
        </Container>
      </section>

      <section className="py-12 bg-[var(--bloggo-bg-card)]/50 border-b border-[var(--bloggo-border)]">
        <Container size="sm" className="flex flex-col gap-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[var(--bloggo-text-primary)]">
              Estimate Your Cost
            </h2>
            <p className="text-[var(--bloggo-text-secondary)]">
              Drag slider to set your audience size
            </p>
          </div>

          <div className="p-8 bg-[var(--bloggo-bg)] rounded-3xl border border-[var(--bloggo-border)] shadow-xl shadow-black/5">
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-end">
                <label
                  htmlFor="subs-slider"
                  className="text-sm font-semibold text-[var(--bloggo-text-secondary)] uppercase tracking-wider"
                >
                  Subscribers
                </label>
                <span className="text-4xl font-black text-sky-600 tabular-nums">
                  {subscribers.toLocaleString()}
                </span>
              </div>

              <input
                id="subs-slider"
                type="range"
                min="0"
                max="20000"
                step="100"
                value={subscribers}
                onChange={(e) => setSubscribers(Number(e.target.value))}
                className="w-full h-2 bg-[var(--bloggo-border)] rounded-lg appearance-none cursor-pointer accent-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              />

              <div className="flex justify-between text-xs text-[var(--bloggo-text-muted)] font-medium">
                <span>0</span>
                <span>5k</span>
                <span>10k</span>
                <span>15k</span>
                <span>20k+</span>
              </div>

              <div className="mt-4 pt-6 border-t border-[var(--bloggo-border)] flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--bloggo-text-secondary)]">
                    Recommended Plan
                  </p>
                  <p className="text-xl font-bold text-[var(--bloggo-text-primary)]">
                    {recommendedPlan?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--bloggo-text-secondary)]">
                    Estimated Cost
                  </p>
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-3xl font-black text-[var(--bloggo-text-primary)]">
                      {recommendedPlan?.price}
                    </span>
                    {recommendedPlan?.period && (
                      <span className="text-sm text-[var(--bloggo-text-muted)]">
                        {recommendedPlan.period}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => {
              const isRecommended = recommendedPlan?.name === plan.name;
              return (
                <Card
                  key={plan.name}
                  padding="lg"
                  className={[
                    "flex flex-col gap-6 relative transition-all duration-300",
                    isRecommended
                      ? "border-sky-500 shadow-xl shadow-sky-500/10 scale-105 z-10 ring-4 ring-sky-500/10"
                      : plan.badge
                        ? "border-sky-500/30 shadow-lg"
                        : "border-[var(--bloggo-border)]",
                  ].join(" ")}
                >
                  {isRecommended && (
                    <div className="absolute -top-4 inset-x-0 flex justify-center">
                      <Badge variant="violet" className="shadow-lg">
                        Recommended for You
                      </Badge>
                    </div>
                  )}

                  {!isRecommended && plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant={plan.badgeVariant}>{plan.badge}</Badge>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 mt-2">
                    <h2 className="text-lg font-semibold text-[var(--bloggo-text-primary)]">
                      {plan.name}
                    </h2>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-[var(--bloggo-text-primary)]">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-[var(--bloggo-text-muted)]">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--bloggo-text-secondary)]">
                      {plan.description}
                    </p>
                  </div>

                  <Link href={plan.href} className="block">
                    <Button
                      variant={isRecommended ? "primary" : plan.ctaVariant}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>

                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2.5 text-sm text-[var(--bloggo-text-secondary)]"
                      >
                        <svg
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isRecommended ? "text-sky-500" : "text-emerald-500"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-20 border-t border-[var(--bloggo-border)]">
        <Container size="md" className="flex flex-col gap-10">
          <SectionHeader eyebrow="FAQ" title="Frequently asked questions" />
          <div className="flex flex-col gap-4">
            {faqs.map((faq) => (
              <Card key={faq.q} padding="md">
                <h3 className="font-semibold text-[var(--bloggo-text-primary)] mb-2">
                  {faq.q}
                </h3>
                <p className="text-sm text-[var(--bloggo-text-secondary)] leading-relaxed">
                  {faq.a}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
