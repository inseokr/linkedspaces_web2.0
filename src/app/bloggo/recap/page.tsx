"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// The layout component from LinkedSpaces
import GuestRecapPage from "@/views/Profile/Trip/GuestModeIndex";

// Not Found / Error State
function BlogUnavailable({
  reason,
}: {
  reason: "not-found" | "error" | "no-id" | "no-username";
}) {
  const messages = {
    "not-found": {
      emoji: "🗺️",
      title: "Blog not found",
      body: "This recap blog may have been removed or hasn't been published yet. Ask the author to share the link again after uploading.",
    },
    error: {
      emoji: "📡",
      title: "Couldn't load blog",
      body: "We had trouble reaching the server. The link may still be valid — try again in a moment.",
    },
    "no-id": {
      emoji: "🔗",
      title: "Invalid link",
      body: "This link is missing a blog ID. Make sure you're using the full link shared from the Bloggo app.",
    },
    "no-username": {
      emoji: "🔗",
      title: "Invalid link",
      body: "This link is missing the author username. Make sure you're using the full link shared from the Bloggo app.",
    },
  };

  const { emoji, title, body } = messages[reason];

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        <div className="text-7xl mb-6">{emoji}</div>
        <h1 className="text-2xl font-bold text-[var(--bloggo-text-primary)] mb-3">
          {title}
        </h1>
        <p className="text-[var(--bloggo-text-secondary)] leading-relaxed mb-8">
          {body}
        </p>

        {/* Download CTA */}
        <div className="rounded-2xl border border-[var(--bloggo-border)] bg-[var(--bloggo-bg-card)] p-6">
          <p className="text-xs uppercase tracking-widest text-[var(--bloggo-text-muted)] mb-3">
            Create your own recap blogs
          </p>
          <p className="font-semibold text-[var(--bloggo-text-primary)] mb-4">
            Bloggo — Turn your travels into beautiful stories
          </p>
          <a
            href="https://apps.apple.com/app/bloggo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--bloggo-accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Download on the App Store
          </a>
        </div>

        <Link
          href="/bloggo"
          className="inline-block mt-6 text-sm text-[var(--bloggo-text-muted)] hover:text-[var(--bloggo-text-secondary)] transition-colors underline underline-offset-2"
        >
          ← Back to Bloggo
        </Link>
      </div>
    </div>
  );
}

function RecapBlogLoader() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const username =
    searchParams.get("username") ||
    searchParams.get("user") ||
    searchParams.get("u");

  if (!id) {
    return <BlogUnavailable reason="no-id" />;
  }

  if (!username) {
    return <BlogUnavailable reason="no-username" />;
  }

  return <GuestRecapPage userId={username} tripId={id} />;
}

export default function RecapBlogPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-sm text-[var(--bloggo-text-muted)]">
          Loading recap...
        </div>
      }
    >
      <RecapBlogLoader />
    </Suspense>
  );
}
