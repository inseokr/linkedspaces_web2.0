"use client";

import * as React from "react";
import type { SearchPlace } from "../searchMockData";

export interface SearchResultRowProps {
  place: SearchPlace;
  onSelect: (place: SearchPlace) => void;
  "data-search-result"?: string;
}

function formatLocation(place: SearchPlace): string {
  if (place.state) return `${place.city}, ${place.state}`;
  return `${place.city}, ${place.country}`;
}

const SearchResultRow = React.forwardRef<
  HTMLButtonElement,
  SearchResultRowProps
>(function SearchResultRow(
  { place, onSelect, "data-search-result": dataAttr },
  ref,
) {
  const detailLine = `${place.category} @ ${formatLocation(place)}`;

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onSelect(place)}
      data-search-result={dataAttr}
      className="w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-[#0f0f0f] sm:px-4 sm:py-3.5"
    >
      <div className="font-semibold text-white sm:text-[15px]">
        {place.name}
      </div>
      <div className="text-sm text-gray-400 sm:text-[15px]">{detailLine}</div>
    </button>
  );
});

export default SearchResultRow;
