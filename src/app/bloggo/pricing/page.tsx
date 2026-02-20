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
    monthlyPrice: "Free",
    yearlyPrice: "Free",
    description: "Perfect for getting started and sharing your travel blogs.",
    badge: null as string | null,
    badgeVariant: "default" as const,
    features: [
      "5 blog uploads",
      "Unlimited blogs on phone",
      "BlogGo subdomain",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get Started Free",
    ctaVariant: "secondary" as const,
    href: `${BASE}/editor/my-first-post`,
  },
  {
    name: "Pro",
    price: "$3.99",
    period: "/month",
    monthlyPrice: "$3.99",
    yearlyPrice: "$19.99",
    description: "For serious bloggers who want to share their adventures!",
    badge: "Most Popular",
    badgeVariant: "violet" as const,
    features: [
      "Unlimited blogs",
      "Unlimited posts",
      "Newsletter (up to 1,000 subscribers)",
      "Web blog editing",
      "BlogGo subdomain",
      "Priority support",
      "Remove BlogGo branding",
    ],
    cta: "Start Pro Trial",
    ctaVariant: "primary" as const,
    href: `${BASE}/editor/my-first-post`,
  },
];

const faqs = [
  // ... (faqs remain the same)
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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
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

      <section className="py-20">
        <Container className="max-w-4xl">
          <div className="flex justify-start mb-8">
            <div className="inline-flex items-center gap-2 p-1 bg-[var(--bloggo-bg-card)] rounded-xl border border-[var(--bloggo-border)]">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  billingCycle === "monthly"
                    ? "bg-[var(--bloggo-bg)] text-[var(--bloggo-text-primary)] shadow-sm"
                    : "text-[var(--bloggo-text-muted)] hover:text-[var(--bloggo-text-secondary)]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  billingCycle === "yearly"
                    ? "bg-[var(--bloggo-bg)] text-[var(--bloggo-text-primary)] shadow-sm"
                    : "text-[var(--bloggo-text-muted)] hover:text-[var(--bloggo-text-secondary)]"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {plans.map((plan) => {
              const isPro = plan.name === "Pro";
              const currentPrice =
                billingCycle === "monthly"
                  ? plan.monthlyPrice
                  : plan.yearlyPrice;
              const currentPeriod =
                plan.name === "Starter"
                  ? ""
                  : billingCycle === "monthly"
                    ? "/month"
                    : "/year";

              return (
                <Card
                  key={plan.name}
                  padding="lg"
                  className={[
                    "flex flex-col gap-6 relative transition-all duration-300",
                    isPro
                      ? "border-sky-500 shadow-xl shadow-sky-500/10 scale-105 z-10 ring-4 ring-sky-500/10"
                      : "border-[var(--bloggo-border)]",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-2 mt-2">
                    <h2 className="text-lg font-semibold text-[var(--bloggo-text-primary)]">
                      {plan.name}
                    </h2>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-[var(--bloggo-text-primary)]">
                        {currentPrice}
                      </span>
                      {currentPeriod && (
                        <span className="text-[var(--bloggo-text-muted)]">
                          {currentPeriod}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--bloggo-text-secondary)]">
                      {plan.description}
                    </p>
                  </div>

                  <Link href={plan.href} className="block">
                    <Button
                      variant={isPro ? "primary" : plan.ctaVariant}
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
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isPro ? "text-sky-500" : "text-emerald-500"}`}
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
