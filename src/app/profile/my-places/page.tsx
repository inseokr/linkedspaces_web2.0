"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { getCachedUser } from "@/api/user";
import { getMyPlacesFromUser } from "./realData";
import type { PlaceCategory, SavedPlace } from "./mockData";
import LatestActivityCarousel from "./components/LatestActivityCarousel";
import PlacesList from "./components/PlacesList";
import MyPlacesMap from "./components/MyPlacesMap";
import FilterPopover from "./components/FilterPopover";

export default function ProfileMyPlacesPage() {
  const user = getCachedUser();
  const { latestActivity, savedPlaces, categories } = useMemo(
    () => getMyPlacesFromUser(user),
    [user]
  );

  const ALL_CATEGORIES = useMemo(
    () => new Set<PlaceCategory>(categories),
    [categories]
  );
  const [selectedCategories, setSelectedCategories] =
    useState<Set<PlaceCategory>>(ALL_CATEGORIES);

  const filteredPlaces = useMemo(() => {
    if (selectedCategories.size === 0) return [];
    return savedPlaces.filter((p: SavedPlace) => selectedCategories.has(p.category));
  }, [savedPlaces, selectedCategories]);

  const hasPlaces = savedPlaces.length > 0;

  if (!user) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
        <p className="text-center text-gray-600">
          Sign in to see your saved places and map.
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

  if (!hasPlaces) {
    return (
      <div className="flex min-h-full flex-col">
        <section className="shrink-0 border-b border-gray-200 bg-white px-4 py-6 md:px-6 lg:px-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Latest Activity
            </h2>
            <Link
              href="/profile/places"
              className="text-sm font-medium text-[var(--color-main)] hover:underline"
            >
              View All Places
            </Link>
          </div>
          <p className="text-gray-500">
            No places yet. Your saved places from trips will appear here.
          </p>
        </section>
        <section className="shrink-0 border-t border-gray-200 bg-white px-4 pt-4 pb-6 md:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-gray-900">My Map</h2>
          <p className="mt-4 text-gray-500">
            When you add places from your trip recaps, they’ll show on the map.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Latest Activity: header and carousel share same horizontal layout for a clean stretch */}
      <section
        className="shrink-0 border-b border-gray-200 bg-white px-4 py-6 md:px-6 lg:px-8"
        aria-labelledby="latest-activity-heading"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2
            id="latest-activity-heading"
            className="text-xl font-semibold text-gray-900"
          >
            Latest Activity
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href="/profile/places"
              className="text-sm font-medium text-[var(--color-main)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 rounded"
            >
              View All Places
            </Link>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
        <LatestActivityCarousel places={latestActivity} />
      </section>

      {/* My Map: larger fixed height (5 places visible); header sits flush under main header when scrolled to top */}
      <section
        className="shrink-0 border-t border-gray-200 bg-white px-4 pt-4 pb-6 md:px-6 md:pt-4 lg:px-8"
        aria-labelledby="my-map-heading"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2
            id="my-map-heading"
            className="text-xl font-semibold text-gray-900"
          >
            My Map
          </h2>
          <FilterPopover
            selectedCategories={selectedCategories}
            onSelectionChange={setSelectedCategories}
            label="Filter"
          />
        </div>

        {/* Fixed height (~5 place cards visible in list); list scrolls inside, map stays fixed. Stacked on small screens. */}
        <div className="grid grid-cols-1 grid-rows-[770px_770px] gap-6 lg:h-[770px] lg:grid-cols-[minmax(0,380px)_1fr] lg:grid-rows-none">
          <div className="min-h-0 min-w-0 overflow-y-auto pr-1">
            <PlacesList places={filteredPlaces} />
          </div>
          <div className="relative min-h-0 min-w-0">
            <MyPlacesMap places={filteredPlaces} />
          </div>
        </div>
      </section>
    </div>
  );
}
