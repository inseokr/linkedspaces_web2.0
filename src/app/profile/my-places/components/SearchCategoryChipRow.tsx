"use client";

import {
  UtensilsCrossed,
  Coffee,
  Landmark,
  Beer,
  Croissant,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import type { SearchPlaceCategory } from "../searchMockData";

export type SearchCategoryId = SearchPlaceCategory | "All";

const CATEGORY_ICONS: Record<SearchCategoryId, LucideIcon> = {
  All: LayoutGrid,
  Restaurants: UtensilsCrossed,
  Coffee: Coffee,
  Attractions: Landmark,
  Bar: Beer,
  Bakery: Croissant,
};

export interface SearchCategoryChipRowProps {
  categories: { id: SearchCategoryId; label: string }[];
  activeCategory: SearchCategoryId;
  onSelect: (id: SearchCategoryId) => void;
}

export default function SearchCategoryChipRow({
  categories,
  activeCategory,
  onSelect,
}: SearchCategoryChipRowProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 -mb-1"
      role="group"
      aria-label="Filter by category"
    >
      {categories.map((cat) => {
        const Icon = CATEGORY_ICONS[cat.id];
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-[#0f0f0f] sm:px-5 sm:py-3 sm:text-[15px] ${
              isActive
                ? "bg-gray-700 text-white border border-gray-600"
                : "bg-[#0f0f0f] text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-gray-300"
            }`}
            aria-pressed={isActive}
            aria-label={`Filter by ${cat.label}`}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />}
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
