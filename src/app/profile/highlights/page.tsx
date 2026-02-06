"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Toggle to show empty state instead of carousel. */
const IS_EMPTY = false;

type Highlight = { id: string; title: string; imageUrl: string };

const MOCK_HIGHLIGHTS: Highlight[] = [
  {
    id: "1",
    title: "Best Hiking Spots",
    imageUrl: "https://picsum.photos/400/600?random=101",
  },
  {
    id: "2",
    title: "Famous Places",
    imageUrl: "https://picsum.photos/400/600?random=102",
  },
  {
    id: "3",
    title: "Hidden Gems",
    imageUrl: "https://picsum.photos/400/600?random=103",
  },
];

function HighlightCard({
  highlight,
  isActive,
  onClick,
}: {
  highlight: Highlight;
  isActive: boolean;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = imgError;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-shrink-0 flex-col items-center text-left transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-main)] focus-visible:ring-offset-2 rounded-2xl overflow-hidden ${isActive ? "scale-[1.02]" : "scale-100"}`}
      aria-label={`Highlight: ${highlight.title}`}
    >
      <div
        className={`relative w-full overflow-hidden rounded-2xl bg-gray-200 shadow-lg ${isActive ? "ring-1 ring-gray-200/80" : ""}`}
        style={{ aspectRatio: "2/3" }}
      >
        {!showPlaceholder ? (
          <img
            src={highlight.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              background:
                "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
            }}
            aria-hidden
          />
        )}
      </div>
      <p className="mt-2 text-center text-base font-bold text-gray-900 sm:mt-3 sm:text-lg lg:text-xl">
        {highlight.title}
      </p>
    </button>
  );
}

function HighlightsCarousel({ highlights }: { highlights: Highlight[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const n = highlights.length;

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + n) % n);
  }, [n]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % n);
  }, [n]);

  if (n === 0) return null;

  // Show up to 3 cards: current, next, next+1 (indices wrap; no duplicates when n < 3)
  const visibleIndices: number[] = [];
  for (let d = 0; d < 3; d++) {
    const idx = (currentIndex + d) % n;
    if (!visibleIndices.includes(idx)) visibleIndices.push(idx);
  }
  const visibleHighlights = visibleIndices.map((i) => highlights[i]);

  return (
    <div className="flex w-full min-w-0 items-center gap-2 py-8 sm:gap-3">
      <button
        type="button"
        onClick={goPrev}
        aria-label="Previous highlight"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500 shadow-sm transition-colors hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-main)] focus-visible:ring-offset-2 sm:h-12 sm:w-12"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex items-stretch justify-center gap-3">
          {visibleHighlights.map((highlight, i) => (
            <div
              key={`${highlight.id}-${visibleIndices[i]}`}
              className="w-[min(100%,280px)] min-w-[180px] max-w-[320px] flex-shrink-0 sm:min-w-[200px] lg:min-w-[220px]"
            >
              <HighlightCard
                highlight={highlight}
                isActive={i === 0}
                onClick={() => {}}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={goNext}
        aria-label="Next highlight"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-700 text-white shadow-md transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-main)] focus-visible:ring-offset-2 sm:h-12 sm:w-12"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </div>
  );
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h2 className="text-xl font-semibold text-gray-900">No highlights yet</h2>
      <p className="mt-2 max-w-sm text-gray-600">
        Create a highlight to pin your favorite moments.
      </p>
      <button
        type="button"
        onClick={onCreateNew}
        className="mt-6 rounded-lg bg-[var(--color-main)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-main)] focus-visible:ring-offset-2"
      >
        Create New
      </button>
    </div>
  );
}

export default function ProfileHighlightsPage() {
  const highlights = IS_EMPTY ? [] : MOCK_HIGHLIGHTS;

  const handleCreateNew = () => {
    // UI only, no action yet
  };

  return (
    <div className="flex min-h-full flex-col">
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Highlights</h1>
          <button
            type="button"
            onClick={handleCreateNew}
            className="text-sm font-medium text-[var(--color-main)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-main)] focus-visible:ring-offset-2 rounded"
          >
            Create New
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 md:px-6 lg:px-8">
        {highlights.length === 0 ? (
          <EmptyState onCreateNew={handleCreateNew} />
        ) : (
          <HighlightsCarousel highlights={highlights} />
        )}
      </div>
    </div>
  );
}
