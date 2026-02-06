"use client";

import { useRef, useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { PlaceCategory } from "../mockData";
import { PLACE_CATEGORIES } from "../mockData";

interface FilterPopoverProps {
  selectedCategories: Set<PlaceCategory>;
  onSelectionChange: (selected: Set<PlaceCategory>) => void;
  /** Categories to show in the filter (default: PLACE_CATEGORIES). Pass from getMyPlacesFromUser to show all categories that exist in the data. */
  categories?: PlaceCategory[];
  /** Optional label next to the button */
  label?: string;
}

export default function FilterPopover({
  selectedCategories,
  onSelectionChange,
  categories: categoriesProp,
  label = "Filter",
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const categories = categoriesProp ?? PLACE_CATEGORIES;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleCategory = (cat: PlaceCategory) => {
    const next = new Set(selectedCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    onSelectionChange(next);
  };

  const toggleAll = () => {
    if (selectedCategories.size === categories.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(categories));
    }
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label="Open filter options"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg"
          role="dialog"
          aria-label="Filter by category"
        >
          <div className="border-b border-gray-100 px-3 pb-2">
            <button
              type="button"
              onClick={toggleAll}
              className="text-left text-sm font-medium text-[var(--color-main)] hover:underline"
            >
              {selectedCategories.size === categories.length
                ? "Clear all"
                : "Select all"}
            </button>
          </div>
          <ul className="max-h-[70vh] overflow-y-auto py-1">
            {categories.map((cat) => (
              <li key={cat}>
                <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="h-4 w-4 rounded border-gray-300 text-[var(--color-main)] focus:ring-[var(--color-main)]"
                  />
                  <span>{cat}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
