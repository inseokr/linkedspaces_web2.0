"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { getCachedUser } from "@/api/user";
import {
  getViewAllPlacesFromUser,
  countryToId,
  deriveCountries,
  deriveCategories,
} from "./realData";
import type { PlaceWithSavedAt, PlaceCategory } from "./mockData";
import YearPills from "./components/YearPills";
import CountryFilterRow from "./components/CountryFilterRow";
import CategoriesFilterRow from "./components/CategoriesFilterRow";
import PlacesByMonth from "./components/PlacesByMonth";
import PlaceLightboxModal, {
  type LightboxImage,
} from "../top-places/components/PlaceLightboxModal";

const UNKNOWN_DATE_LABEL = "Date unknown";

/** Parse date/time: ISO, YYYY-MM-DD, or "YYYY:MM:DD HH:mm:ss" (digitizedTime). */
function parseDateTime(s: string): Date | null {
  const raw = String(s).trim();
  if (!raw) return null;
  let d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d;
  const withTime =
    /^(\d{4})[-:](\d{2})[-:](\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(raw);
  if (withTime) {
    const y = Number(withTime[1]),
      m = Number(withTime[2]) - 1,
      day = Number(withTime[3]);
    const h = Number(withTime[4]),
      min = Number(withTime[5]),
      sec = Number(withTime[6] ?? 0);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(day))
      return new Date(y, m, day, h, min, sec);
  }
  const dateOnly = /^(\d{4})[-:](\d{2})[-:](\d{2})/.exec(raw);
  if (dateOnly) {
    const y = Number(dateOnly[1]),
      m = Number(dateOnly[2]) - 1,
      day = Number(dateOnly[3]);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(day))
      return new Date(y, m, day);
  }
  return null;
}

/** Format place visit date/time for lightbox with actual hours and minutes. */
function formatVisitDateForLightbox(place: PlaceWithSavedAt): string {
  let d: Date | null = null;
  if (place.visitedTimeRaw?.trim()) d = parseDateTime(place.visitedTimeRaw);
  if (!d || Number.isNaN(d.getTime())) {
    if (place.savedAt && place.savedAt.getTime() > 0) d = place.savedAt;
    else return UNKNOWN_DATE_LABEL;
  }
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "long" });
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const h12 = hours % 12 || 12;
  const ampm = hours < 12 ? "AM" : "PM";
  const timeStr = `${h12}:${String(minutes).padStart(2, "0")} ${ampm}`;
  return `${day} ${month} ${d.getFullYear()} at ${timeStr}`;
}

const MONTH_LABELS: Record<number, string> = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

/** Date for year/month: use savedAt, or parse visitedTimeRaw when savedAt is epoch. Keeps filtering and grouping consistent. */
function getEffectiveDate(place: PlaceWithSavedAt): Date {
  const fromSavedAt = place.savedAt?.getTime();
  if (fromSavedAt != null && fromSavedAt > 0) {
    const y = place.savedAt.getFullYear();
    if (Number.isFinite(y) && y >= 1970 && y <= 2100) return place.savedAt;
  }
  if (place.visitedTimeRaw?.trim()) {
    const d = parseDateTime(place.visitedTimeRaw);
    if (d && !Number.isNaN(d.getTime())) return d;
  }
  return place.savedAt ?? new Date(0);
}

/** Year for filtering: same as getEffectiveDate(...).getFullYear(). Ensures country count and list stay in sync. */
function getEffectiveYear(place: PlaceWithSavedAt): number {
  return getEffectiveDate(place).getFullYear();
}

function groupPlacesByMonth(
  places: PlaceWithSavedAt[],
): { monthLabel: string; places: PlaceWithSavedAt[] }[] {
  const byKey = new Map<string, PlaceWithSavedAt[]>();
  for (const p of places) {
    const d = getEffectiveDate(p);
    const month = d.getMonth();
    const year = d.getFullYear();
    const label = `${MONTH_LABELS[month]} ${year}`;
    if (!byKey.has(label)) byKey.set(label, []);
    byKey.get(label)!.push(p);
  }
  const sorted = Array.from(byKey.entries()).sort((a, b) => {
    const placesA = a[1][0] ? getEffectiveDate(a[1][0]).getTime() : 0;
    const placesB = b[1][0] ? getEffectiveDate(b[1][0]).getTime() : 0;
    return placesB - placesA;
  });
  return sorted.map(([monthLabel, places]) => ({ monthLabel, places }));
}

function ViewAllPlacesPage() {
  const router = useRouter();
  const user = getCachedUser();
  const { places: allPlaces } = React.useMemo(
    () => getViewAllPlacesFromUser(user),
    [user],
  );
  /** Years derived from effective year (savedAt or visitedTimeRaw) so pills and counts match the list. */
  const years = React.useMemo(() => {
    const set = new Set(
      allPlaces
        .map((p) => getEffectiveYear(p))
        .filter((y) => Number.isFinite(y) && y > 0),
    );
    return Array.from(set).sort((a, b) => b - a);
  }, [allPlaces]);

  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [selectedCountryId, setSelectedCountryId] = React.useState<
    string | null
  >("all");
  const [selectedCategory, setSelectedCategory] = React.useState<
    PlaceCategory | "All"
  >("All");
  const [selectedPlace, setSelectedPlace] =
    React.useState<PlaceWithSavedAt | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (years.length > 0 && selectedYear === null) {
      setSelectedYear(years[0]);
    } else if (
      years.length > 0 &&
      selectedYear !== null &&
      !years.includes(selectedYear)
    ) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  const effectiveYear = selectedYear ?? years[0] ?? new Date().getFullYear();

  /** Places in the selected year (for country pills) — use effective year so count matches list. */
  const placesInSelectedYear = React.useMemo(
    () => allPlaces.filter((p) => getEffectiveYear(p) === effectiveYear),
    [allPlaces, effectiveYear],
  );
  const countriesForYear = React.useMemo(
    () => deriveCountries(placesInSelectedYear),
    [placesInSelectedYear],
  );

  /** Places in selected year + country (for category pills: only show categories that exist in this set) */
  const placesForYearAndCountry = React.useMemo(() => {
    return allPlaces.filter((p) => {
      if (getEffectiveYear(p) !== effectiveYear) return false;
      if (
        selectedCountryId &&
        selectedCountryId !== "all" &&
        countryToId(p.country) !== selectedCountryId
      )
        return false;
      return true;
    });
  }, [allPlaces, effectiveYear, selectedCountryId]);

  const categoriesForFilters = React.useMemo(
    () => deriveCategories(placesForYearAndCountry),
    [placesForYearAndCountry],
  );

  React.useEffect(() => {
    if (selectedCountryId && selectedCountryId !== "all") {
      const available = countriesForYear.some(
        (c) => c.id === selectedCountryId,
      );
      if (!available) setSelectedCountryId("all");
    }
  }, [effectiveYear, countriesForYear, selectedCountryId]);

  React.useEffect(() => {
    if (
      selectedCategory !== "All" &&
      !categoriesForFilters.includes(selectedCategory)
    ) {
      setSelectedCategory("All");
    }
  }, [categoriesForFilters, selectedCategory]);

  const filtered = React.useMemo(() => {
    return allPlaces.filter((p) => {
      if (getEffectiveYear(p) !== effectiveYear) return false;
      if (
        selectedCountryId &&
        selectedCountryId !== "all" &&
        countryToId(p.country) !== selectedCountryId
      )
        return false;
      if (selectedCategory !== "All" && p.category !== selectedCategory)
        return false;
      if (
        searchQuery.trim() &&
        !p.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
        return false;
      return true;
    });
  }, [
    allPlaces,
    effectiveYear,
    selectedCountryId,
    selectedCategory,
    searchQuery,
  ]);

  const groups = React.useMemo(() => groupPlacesByMonth(filtered), [filtered]);

  const lightboxImages: LightboxImage[] = React.useMemo(() => {
    if (!selectedPlace) return [];
    const uris = selectedPlace.photoListUris?.length
      ? selectedPlace.photoListUris
      : selectedPlace.imageUrl
        ? [selectedPlace.imageUrl]
        : [];
    const dateTime = formatVisitDateForLightbox(selectedPlace);
    const caption = selectedPlace.caption ?? undefined;
    const base = {
      placeId: selectedPlace.id,
      placeName: selectedPlace.title,
      dateTime,
      ...(caption ? { caption } : {}),
      ...(selectedPlace.sentiment
        ? { sentiment: selectedPlace.sentiment }
        : {}),
    };
    return uris.length > 0
      ? uris.map((src) => ({ src, ...base }))
      : [{ src: "https://picsum.photos/400/600?random=placeholder", ...base }];
  }, [selectedPlace]);

  if (!user) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
        <p className="text-center text-gray-600">
          Sign in to view all your places.
        </p>
        <Link
          href="/sign-in"
          className="mt-4 rounded-lg bg-[var(--color-main)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (allPlaces.length === 0) {
    return (
      <div className="flex min-h-full flex-col px-4 py-8 md:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="self-start rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Go Back
        </button>
        <p className="mt-6 text-gray-500">
          No places yet. Your saved places will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* My Places title + search bar + Go Back (same layout as My Places page) */}
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 pt-6 pb-4 md:px-6 md:pt-8 md:pb-5 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            My Places
          </h1>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border-2 border-gray-300 bg-transparent px-4 py-2 text-gray-500 transition-colors focus-within:border-[var(--color-main)] focus-within:ring-2 focus-within:ring-[var(--color-main)] focus-within:ring-offset-2 sm:max-w-md">
            <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places"
              className="min-w-0 flex-1 bg-transparent text-gray-900 placeholder:text-gray-500 focus:outline-none"
              aria-label="Search places"
            />
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
            aria-label="Go back"
          >
            Go Back
          </button>
        </div>
      </header>

      {/* Year pills row */}
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-white px-4 py-4 md:px-6 lg:px-8">
        <YearPills
          years={years}
          selectedYear={effectiveYear}
          onSelect={setSelectedYear}
        />
      </div>

      {/* Country filter row */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 md:px-6 lg:px-8">
        <CountryFilterRow
          countries={countriesForYear}
          selectedId={selectedCountryId}
          onSelect={setSelectedCountryId}
          maxFirstRow={4}
        />
      </div>

      {/* Categories filter row */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 md:px-6 lg:px-8">
        <CategoriesFilterRow
          categories={categoriesForFilters}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
          maxFirstRow={9}
        />
      </div>

      {/* Place feed by month */}
      <div className="flex-1 px-4 py-6 md:px-6 lg:px-8">
        <PlacesByMonth groups={groups} onPlaceClick={setSelectedPlace} />
      </div>

      <PlaceLightboxModal
        isOpen={!!selectedPlace}
        onClose={() => setSelectedPlace(null)}
        images={lightboxImages}
        startIndex={0}
      />
    </div>
  );
}

export default ViewAllPlacesPage;
