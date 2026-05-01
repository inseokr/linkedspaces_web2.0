"use client";

import { useState } from "react";
import Container from "@/bloggo/components/ui/Container";
import Card from "@/bloggo/components/ui/Card";
import Badge from "@/bloggo/components/ui/Badge";
import SectionHeader from "@/bloggo/components/ui/SectionHeader";
import Input from "@/bloggo/components/ui/Input";
import Button from "@/bloggo/components/ui/Button";
import FormSubmittingIndicator from "@/bloggo/components/ui/FormSubmittingIndicator";
import Accordion from "@/bloggo/components/ui/Accordion";
import { submitSupportContact } from "@/api/supportContact";

const SUPPORT_EMAIL = "bloggo@linkedspaces.com";

const faqItems = [
  {
    id: "account",
    question: "How do I reset my password?",
    answer:
      "Go to the login page and click 'Forgot password'. Enter your email address and we'll send you a reset link within a few minutes. Check your spam folder if you don't see it.",
  },
  {
    id: "create",
    question: "How do I create my first blog?",
    answer:
      "Open the Bloggo app on your phone, tap the create button, and add your photos and text. Your blog is saved locally on your device and ready to view, edit, or share whenever you like.",
  },
  {
    id: "export",
    question: "Can I export my blogs?",
    answer:
      "You must create an account to export your blogs freely. Once signed in, you can download your blogs onto your phone.",
  },
  {
    id: "desktop",
    question: "How do I edit my blog on the desktop?",
    answer:
      "Upload your blog to the cloud from the Bloggo app, then sign into the same account on the Bloggo website. From there you can edit your blogs directly in the browser.",
  },
  {
    id: "privacy",
    question: "Can others see my blogs?",
    answer:
      "Your blogs stay on your phone, private to you. However, you can share, export, and upload them to the cloud for easier sharing capabilities and a big screen blogging experience.",
  },
  {
    id: "sharing",
    question: "How do I share my blog with others?",
    answer:
      "You can share your blog from both the phone and the desktop. Simply copy your blog link and forward it to your friends and family through text, email, or social media.",
  },
  {
    id: "images",
    question: "What image formats are supported?",
    answer:
      "Bloggo supports JPEG, PNG, WebP, GIF, and SVG. Images are automatically optimized and served via CDN. Maximum file size is 10 MB per image.",
  },
];

export default function SupportPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setLoading(true);
    const result = await submitSupportContact({
      name: formState.name.trim(),
      email: formState.email.trim(),
      subject: formState.subject.trim(),
      message: formState.message.trim(),
      source: "bloggo",
    });
    setLoading(false);
    if (result.ok) setSubmitted(true);
    else setSubmitError(result.message);
  };

  return (
    <>
      <section className="pt-20 pb-16 border-b border-[var(--bloggo-border)]">
        <Container className="flex flex-col items-center text-center gap-6">
          <Badge variant="violet">Support</Badge>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight">
            How can we <span className="gradient-text">help you?</span>
          </h1>
          <p className="text-lg text-[var(--bloggo-text-secondary)] max-w-xl">
            Browse our FAQ or send us a message. We typically respond within 24
            hours on business days.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors text-sm font-medium"
          >
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {SUPPORT_EMAIL}
          </a>
        </Container>
      </section>

      <section className="py-16 bg-[var(--bloggo-bg-secondary)]/30 border-b border-[var(--bloggo-border)]">
        <Container className="flex flex-col items-center text-center gap-4">
          <h2 className="text-2xl font-bold text-[var(--bloggo-text-primary)]">
            About Bloggo
          </h2>
          <p className="text-[var(--bloggo-text-secondary)] max-w-2xl leading-relaxed">
            Bloggo helps you save places you&apos;ve visited by turning photos
            into a meaningful travel blog.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="flex flex-col gap-8">
            <SectionHeader
              eyebrow="FAQ"
              title="Common questions"
              align="left"
            />
            <Accordion items={faqItems} />
          </div>

          <div className="flex flex-col gap-8">
            <SectionHeader
              eyebrow="Contact"
              title="Send us a message"
              align="left"
            />

            {submitted ? (
              <Card
                padding="lg"
                className="flex flex-col items-center text-center gap-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
                  <svg
                    className="w-7 h-7 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--bloggo-text-primary)]">
                  Message sent!
                </h3>
                <p className="text-sm text-[var(--bloggo-text-secondary)]">
                  Thanks for reaching out. We&apos;ll get back to you at{" "}
                  <strong className="text-[var(--bloggo-text-primary)]">
                    {formState.email}
                  </strong>{" "}
                  within 24 hours.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSubmitted(false);
                    setSubmitError(null);
                    setFormState({
                      name: "",
                      email: "",
                      subject: "",
                      message: "",
                    });
                  }}
                >
                  Send another message
                </Button>
              </Card>
            ) : (
              <Card padding="lg">
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col gap-5"
                  aria-busy={loading ? true : undefined}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Your Name"
                      id="support-name"
                      type="text"
                      required
                      placeholder="Alex Rivera"
                      value={formState.name}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, name: e.target.value }))
                      }
                    />
                    <Input
                      label="Email Address"
                      id="support-email"
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, email: e.target.value }))
                      }
                    />
                  </div>
                  <Input
                    label="Subject"
                    id="support-subject"
                    type="text"
                    required
                    placeholder="What can we help with?"
                    value={formState.subject}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, subject: e.target.value }))
                    }
                  />
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="support-message"
                      className="text-sm font-medium text-[var(--bloggo-text-secondary)]"
                    >
                      Message{" "}
                      <span className="text-red-400" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <textarea
                      id="support-message"
                      required
                      rows={5}
                      placeholder="Describe your issue or question in detail..."
                      value={formState.message}
                      onChange={(e) =>
                        setFormState((s) => ({
                          ...s,
                          message: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--bloggo-bg-card)] border border-[var(--bloggo-border)] text-[var(--bloggo-text-primary)] placeholder:text-[var(--bloggo-text-muted)] transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500/50 hover:border-sky-500/30 resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    loadingLabel="Sending…"
                    disabled={
                      !formState.name ||
                      !formState.email ||
                      !formState.subject ||
                      !formState.message
                    }
                  >
                    Send Message
                  </Button>
                  <FormSubmittingIndicator active={loading} />
                  {submitError ? (
                    <p
                      className="text-sm text-red-400 text-center"
                      role="alert"
                    >
                      {submitError}
                    </p>
                  ) : null}
                  <p className="text-xs text-[var(--bloggo-text-muted)] text-center">
                    Or email us directly at{" "}
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </p>
                </form>
              </Card>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
