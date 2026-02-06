"use client";

import * as React from "react";
import Link from "next/link";
import { getCachedUser } from "@/api/user";
import {
  getTopPlacesFromUser,
  deriveCountryFilterCounts,
  deriveCategoryFilterCounts,
  getCountryFilterId,
} from "./realData";
import type { TopPlaceCardModel } from "./types";
import FiltersPopover, {
  type FiltersState,
  getDefaultFilters,
} from "./components/FiltersPopover";
import type { CountryWithCount } from "./mockData";
import CountryChipsRow from "./components/CountryChipsRow";
import CategoryChipsRow from "./components/CategoryChipsRow";
import type { CategoryWithCount } from "./components/FiltersPopover";
import TopPlacesGrid from "./components/TopPlacesGrid";
import TopPlacesMapModal from "./components/TopPlacesMapModal";
import { MapIcon } from "lucide-react";

function filterAndSortPlaces(
  places: TopPlaceCardModel[],
  filters: FiltersState,
): TopPlaceCardModel[] {
  let result = places;

  if (filters.countryIds.size > 0) {
    result = result.filter((p) =>
      filters.countryIds.has(getCountryFilterId(p)),
    );
  }

  const categoryAll =
    filters.categoryIds.has("All") || filters.categoryIds.size === 0;
  if (!categoryAll) {
    result = result.filter((p) => filters.categoryIds.has(p.category));
  }

  const sort = filters.sort;
  result = [...result].sort((a, b) => {
    if (sort === "rank") return a.rank - b.rank;
    if (sort === "visits") return b.visitsCount - a.visitsCount;
    if (sort === "photos") return b.photosCount - a.photosCount;
    return b.likesCount - a.likesCount;
  });

  return result.map((p, i) => ({ ...p, rank: i + 1 }));
}

function getActiveCountryId(filters: FiltersState): string | null {
  if (filters.countryIds.size === 0) return "all";
  if (filters.countryIds.size === 1) return [...filters.countryIds][0];
  return null;
}

function getActiveCategory(filters: FiltersState): string | "All" {
  if (filters.categoryIds.has("All")) return "All";
  if (filters.categoryIds.size === 1) return [...filters.categoryIds][0];
  return "All";
}

export default function ProfileTopPlacesPage() {
  const user = React.useMemo(() => getCachedUser(), []);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [mapOpen, setMapOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<FiltersState>(() =>
    getDefaultFilters(),
  );

  const allRankedPlaces = React.useMemo(
    () => getTopPlacesFromUser(user),
    [user],
  );

  const countryPills: CountryWithCount[] = React.useMemo(
    () => deriveCountryFilterCounts(allRankedPlaces),
    [allRankedPlaces],
  );

  /** Places in the currently selected country (for category pills: only show categories that exist here) */
  const placesInSelectedCountry = React.useMemo(() => {
    if (filters.countryIds.size === 0) return allRankedPlaces;
    return allRankedPlaces.filter((p) =>
      filters.countryIds.has(getCountryFilterId(p)),
    );
  }, [allRankedPlaces, filters.countryIds]);

  const categoryPills: CategoryWithCount[] = React.useMemo(
    () => deriveCategoryFilterCounts(placesInSelectedCountry),
    [placesInSelectedCountry],
  );

  React.useEffect(() => {
    setFilters((prev) => {
      const currentCategory = getActiveCategory(prev);
      if (currentCategory === "All") return prev;
      const stillAvailable = categoryPills.some(
        (c) => c.id === currentCategory || c.name === currentCategory,
      );
      if (stillAvailable) return prev;
      return { ...prev, categoryIds: new Set<string>(["All"]) };
    });
  }, [categoryPills]);

  const filteredPlaces = React.useMemo(
    () => filterAndSortPlaces(allRankedPlaces, filters),
    [allRankedPlaces, filters],
  );

  const activeCountryId = getActiveCountryId(filters);
  const activeCategory = getActiveCategory(filters);

  const handleCountryChipSelect = (id: string | null) => {
    if (id === "all" || id === null) {
      setFilters((prev) => ({ ...prev, countryIds: new Set() }));
      return;
    }
    setFilters((prev) => ({
      ...prev,
      countryIds: new Set([id]),
    }));
  };

  const handleCategoryChipSelect = (cat: string | "All") => {
    setFilters((prev) => ({
      ...prev,
      categoryIds: cat === "All" ? new Set<string>(["All"]) : new Set([cat]),
    }));
  };

  const handleFiltersReset = () => {
    setFilters(getDefaultFilters());
  };

  if (!user) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
        <p className="text-center text-gray-600">
          Sign in to see your top places.
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

  if (allRankedPlaces.length === 0) {
    return (
      <div className="flex min-h-full flex-col px-4 py-6 md:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Your Top Spaces
        </h1>
        <p className="mt-4 text-gray-600">
          No places yet. Your top places from your visit history will appear
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Your Top Spaces
            </h1>
            <p className="mt-1 text-gray-600">
              The places that matter most, curated by your journey
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
              aria-label="Open full screen map"
            >
              <MapIcon className="h-4 w-4" />
              Map
            </button>
            <FiltersPopover
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              filters={filters}
              onApply={setFilters}
              onReset={handleFiltersReset}
              countries={countryPills}
              categories={categoryPills}
            />
          </div>
        </div>

        <div className="mt-4">
          <CountryChipsRow
            countries={countryPills}
            selectedId={activeCountryId}
            onSelect={handleCountryChipSelect}
            maxVisible={4}
          />
        </div>

        <div className="mt-3">
          <CategoryChipsRow
            categories={categoryPills}
            selectedCategory={activeCategory}
            onSelect={handleCategoryChipSelect}
            maxVisible={9}
          />
        </div>
      </header>

      <div className="flex-1 px-4 py-6 md:px-6 lg:px-8">
        <section aria-labelledby="top-spaces-globally-heading">
          <h2
            id="top-spaces-globally-heading"
            className="mb-6 text-xl font-semibold text-gray-900"
          >
            Top Spaces Globally
          </h2>
          <TopPlacesGrid places={filteredPlaces} />
        </section>
      </div>
      <TopPlacesMapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        places={filteredPlaces}
        countryPills={countryPills}
        categoryPills={categoryPills}
        activeCountryId={activeCountryId}
        activeCategory={activeCategory}
        onCountrySelect={handleCountryChipSelect}
        onCategorySelect={handleCategoryChipSelect}
      />
    </div>
  );
}
