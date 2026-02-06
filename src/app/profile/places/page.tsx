"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCachedUser } from "@/api/user";
import { getViewAllPlacesFromUser } from "./realData";
import type { PlaceWithSavedAt, PlaceCategory } from "./mockData";
import YearPills from "./components/YearPills";
import CountryFilterRow from "./components/CountryFilterRow";
import CategoriesFilterRow from "./components/CategoriesFilterRow";
import PlacesByMonth from "./components/PlacesByMonth";

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

function groupPlacesByMonth(
  places: PlaceWithSavedAt[],
): { monthLabel: string; places: PlaceWithSavedAt[] }[] {
  const byKey = new Map<string, PlaceWithSavedAt[]>();
  for (const p of places) {
    const month = p.savedAt.getMonth();
    const year = p.savedAt.getFullYear();
    const label = `${MONTH_LABELS[month]} ${year}`;
    if (!byKey.has(label)) byKey.set(label, []);
    byKey.get(label)!.push(p);
  }
  const sorted = Array.from(byKey.entries()).sort((a, b) => {
    const placesA = a[1][0]?.savedAt.getTime() ?? 0;
    const placesB = b[1][0]?.savedAt.getTime() ?? 0;
    return placesB - placesA;
  });
  return sorted.map(([monthLabel, places]) => ({ monthLabel, places }));
}

function countryId(place: PlaceWithSavedAt): string {
  return place.country.replace(/\s+/g, "-").toLowerCase() || "unknown";
}

export default function ViewAllPlacesPage() {
  const router = useRouter();
  const user = getCachedUser();
  const { places: allPlaces, years, countries, categories } = React.useMemo(
    () => getViewAllPlacesFromUser(user),
    [user],
  );

  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [selectedCountryId, setSelectedCountryId] = React.useState<string | null>("all");
  const [selectedCategory, setSelectedCategory] = React.useState<
    PlaceCategory | "All"
  >("All");

  React.useEffect(() => {
    if (years.length > 0 && selectedYear === null) {
      setSelectedYear(years[0]);
    } else if (years.length > 0 && selectedYear !== null && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  const effectiveYear = selectedYear ?? years[0] ?? new Date().getFullYear();

  const filtered = React.useMemo(() => {
    return allPlaces.filter((p) => {
      if (p.savedAt.getFullYear() !== effectiveYear) return false;
      if (selectedCountryId && selectedCountryId !== "all" && countryId(p) !== selectedCountryId) return false;
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      return true;
    });
  }, [allPlaces, effectiveYear, selectedCountryId, selectedCategory]);

  const groups = React.useMemo(
    () => groupPlacesByMonth(filtered),
    [filtered],
  );

  if (!user) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
        <p className="text-center text-gray-600">Sign in to view all your places.</p>
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
        <p className="mt-6 text-gray-500">No places yet. Your saved places will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Top row: year pills + Go Back */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-4 md:px-6 lg:px-8">
        <YearPills
          years={years}
          selectedYear={effectiveYear}
          onSelect={setSelectedYear}
        />
        <button
          type="button"
          onClick={() => router.back()}
          className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label="Go back"
        >
          Go Back
        </button>
      </div>

      {/* Country filter row */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 md:px-6 lg:px-8">
        <CountryFilterRow
          countries={countries}
          selectedId={selectedCountryId}
          onSelect={setSelectedCountryId}
          maxFirstRow={4}
        />
      </div>

      {/* Categories filter row */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 md:px-6 lg:px-8">
        <CategoriesFilterRow
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
          maxFirstRow={9}
        />
      </div>

      {/* Place feed by month */}
      <div className="flex-1 px-4 py-6 md:px-6 lg:px-8">
        <PlacesByMonth groups={groups} />
      </div>
    </div>
  );
}
