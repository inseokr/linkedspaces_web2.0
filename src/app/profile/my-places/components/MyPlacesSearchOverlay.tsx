"use client";

import * as React from "react";
import { MapPin, ArrowLeft } from "lucide-react";
import {
  MOCK_SEARCH_PLACES,
  SEARCH_CATEGORIES,
  type SearchPlace,
} from "../searchMockData";
import type { SearchCategoryId } from "./SearchCategoryChipRow";
import SearchCategoryChipRow from "./SearchCategoryChipRow";
import SearchResultRow from "./SearchResultRow";

function filterPlaces(
  places: SearchPlace[],
  keyword: string,
  location: string,
  category: SearchCategoryId,
): SearchPlace[] {
  let result = places;

  const kw = keyword.trim().toLowerCase();
  if (kw) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        p.city.toLowerCase().includes(kw) ||
        p.country.toLowerCase().includes(kw) ||
        p.captionKeywords.some((t) => t.toLowerCase().includes(kw)),
    );
  }

  const loc = location.trim().toLowerCase();
  if (loc) {
    result = result.filter(
      (p) =>
        p.city.toLowerCase().includes(loc) ||
        p.country.toLowerCase().includes(loc),
    );
  }

  if (category !== "All") {
    result = result.filter((p) => p.category === category);
  }

  return result;
}

export interface MyPlacesSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /** When user selects a place: e.g. open place detail modal (overlay stays open so user can return to search) */
  onSelectPlace?: (place: SearchPlace) => void;
}

export default function MyPlacesSearchOverlay({
  isOpen,
  onClose,
  onSelectPlace,
}: MyPlacesSearchOverlayProps) {
  const [keyword, setKeyword] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [activeCategory, setActiveCategory] =
    React.useState<SearchCategoryId>("All");
  const keywordInputRef = React.useRef<HTMLInputElement>(null);
  const firstResultRef = React.useRef<HTMLButtonElement>(null);
  const resultsScrollRef = React.useRef<HTMLDivElement>(null);

  const filteredResults = React.useMemo(
    () => filterPlaces(MOCK_SEARCH_PLACES, keyword, location, activeCategory),
    [keyword, location, activeCategory],
  );

  const showResults = filteredResults;
  const showAsEmpty = filteredResults.length === 0;

  // Scroll results to top when keyword, location, or category changes so the list visibly updates
  React.useEffect(() => {
    const el = resultsScrollRef.current;
    if (el) el.scrollTop = 0;
  }, [keyword, location, activeCategory]);

  // Lock background scroll when overlay is open so only the search results list scrolls
  React.useEffect(() => {
    if (!isOpen) return;
    const prevBodyOverflow = document.body.style.overflow;
    const main = document.querySelector<HTMLElement>("main");
    const prevMainOverflow = main?.style.overflow ?? "";
    document.body.style.overflow = "hidden";
    if (main) main.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      if (main) main.style.overflow = prevMainOverflow;
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    setKeyword("");
    setLocation("");
    setActiveCategory("All");
    requestAnimationFrame(() => keywordInputRef.current?.focus());
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (
        e.key === "Enter" &&
        e.target instanceof HTMLInputElement &&
        showResults.length > 0
      ) {
        const first = document.querySelector<HTMLButtonElement>(
          '[data-search-result="0"]',
        );
        if (first) {
          e.preventDefault();
          first.click();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose, showResults.length]);

  const handleSelectPlace = React.useCallback(
    (place: SearchPlace) => {
      onSelectPlace?.(place);
    },
    [onSelectPlace],
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 sm:p-6 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Search places"
    >
      {/* Responsive panel: full bleed on small screens, centered card on web */}
      <div className="flex h-full w-full max-h-[88vh] max-w-2xl flex-col rounded-none bg-[#0f0f0f] shadow-2xl sm:rounded-2xl md:max-h-[85vh] md:w-full">
        {/* Top bar: Go Back at top right */}
        <div className="flex shrink-0 items-center justify-end border-b border-gray-800 px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg border border-gray-600 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-[#0f0f0f]"
            aria-label="Go back to My Places"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Go Back
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-5 md:py-6">
          {/* Input A: Keyword */}
          <input
            ref={keywordInputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Type any keyword"
            className="mb-3 w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-base text-white placeholder-gray-500 focus:border-[var(--color-main)] focus:outline-none focus:ring-1 focus:ring-[var(--color-main)] sm:py-3.5 sm:text-[15px]"
            aria-label="Search by keyword"
          />

          {/* Input B: Location */}
          <div className="relative mb-4">
            <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 sm:h-[18px] sm:w-[18px]" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Current Location"
              className="w-full rounded-xl border border-gray-700 bg-gray-900/80 py-3 pl-11 pr-4 text-base text-white placeholder-gray-500 focus:border-[var(--color-main)] focus:outline-none focus:ring-1 focus:ring-[var(--color-main)] sm:py-3.5 sm:pl-12 sm:text-[15px]"
              aria-label="Filter by location"
            />
          </div>

          {/* Category chips */}
          <div className="mb-4 shrink-0">
            <SearchCategoryChipRow
              categories={SEARCH_CATEGORIES}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
          </div>

          {/* Results: only this area scrolls; overscroll-contain keeps scroll from leaking to background */}
          <div
            ref={resultsScrollRef}
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden -mx-1 px-1 overscroll-contain"
          >
            {showAsEmpty ? (
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-6 py-12 text-center text-gray-500 sm:py-16 sm:text-[15px]">
                No places match your search. Try a different keyword or
                category.
              </div>
            ) : (
              <ul className="list-none space-y-0" role="list">
                {showResults.map((place, index) => (
                  <li key={place.id}>
                    <SearchResultRow
                      place={place}
                      onSelect={handleSelectPlace}
                      ref={index === 0 ? firstResultRef : undefined}
                      data-search-result={index === 0 ? "0" : undefined}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
