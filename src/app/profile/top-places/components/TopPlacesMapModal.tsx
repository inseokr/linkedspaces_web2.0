"use client";

import * as React from "react";
import type { TopPlaceCardModel } from "../types";
import type { CountryWithCount } from "../mockData";
import type { CategoryWithCount } from "./FiltersPopover";
import CountryChipsRow from "./CountryChipsRow";
import CategoryChipsRow from "./CategoryChipsRow";
import TopPlacesMapView from "./TopPlacesMapView";
import { X } from "lucide-react";

export interface TopPlacesMapModalProps {
  open: boolean;
  onClose: () => void;
  /** Filtered places (same as grid); map will use those with valid lat/lng */
  places: TopPlaceCardModel[];
  countryPills: CountryWithCount[];
  categoryPills: CategoryWithCount[];
  activeCountryId: string | null;
  activeCategory: string | "All";
  onCountrySelect: (id: string | null) => void;
  onCategorySelect: (category: string | "All") => void;
}

export default function TopPlacesMapModal({
  open,
  onClose,
  places,
  countryPills,
  categoryPills,
  activeCountryId,
  activeCategory,
  onCountrySelect,
  onCategorySelect,
}: TopPlacesMapModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-white"
      role="dialog"
      aria-modal="true"
      aria-label="Top Places map"
    >
      {/* Top bar: filters span full width under countries; no horizontal scroll */}
      <div className="absolute left-0 top-0 z-10 flex w-full items-start justify-between gap-4 p-3 md:p-4 pr-14 md:pr-14">
        {/* Full-width filter area: countries then categories wrap across the top */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden max-h-[40vh]">
          <CountryChipsRow
            countries={countryPills}
            selectedId={activeCountryId}
            onSelect={onCountrySelect}
            maxVisible={8}
          />
          <CategoryChipsRow
            categories={categoryPills}
            selectedCategory={activeCategory}
            onSelect={onCategorySelect}
            maxVisible={99}
            hideLabel
          />
        </div>

        {/* Close button - top right */}
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white/95 shadow-md transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label="Close map"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Full screen map */}
      <div className="absolute inset-0">
        <TopPlacesMapView
          places={places}
          activeCountryId={activeCountryId}
          activeCategory={activeCategory}
        />
      </div>
    </div>
  );
}
