"use client";

import * as React from "react";
import type { CategoryWithCount } from "./FiltersPopover";

/** Approximate width per category chip (content + padding) + gap, for responsive count. */
const CHIP_ESTIMATE_PX = 88;
/** Reserved width for "All" button + "+ View more" button + gaps. */
const RESERVED_BASE_PX = 140;
const LABEL_ESTIMATE_PX = 88;

interface CategoryChipsRowProps {
  categories: CategoryWithCount[];
  selectedCategory: string | "All";
  onSelect: (category: string | "All") => void;
  /** Max chips to show before "+ View more" (used when container width unknown or as upper bound). */
  maxVisible?: number;
  /** When true, keep all chips on one line with horizontal scroll (e.g. for map overlay) */
  singleLine?: boolean;
  /** When true, hide the "Categories:" label (e.g. for map overlay) */
  hideLabel?: boolean;
  /** When false, do not show the "All" chip (e.g. for map overlay) */
  showAllButton?: boolean;
  /** Category ids/names to hide until expanded (e.g. ["education","transportation","airport"]). Used in full-screen map. */
  hiddenByDefault?: string[];
  /** When true, derive visible count from container width (fewer chips on narrow screens). Default true. */
  responsive?: boolean;
}

export default function CategoryChipsRow({
  categories,
  selectedCategory,
  onSelect,
  maxVisible = 9,
  singleLine = false,
  hideLabel = false,
  showAllButton = true,
  hiddenByDefault,
  responsive = true,
}: CategoryChipsRowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!responsive || singleLine) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0]?.contentRect ?? { width: 0 };
      setContainerWidth(width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [responsive, singleLine]);

  const reservedPx = RESERVED_BASE_PX + (hideLabel ? 0 : LABEL_ESTIMATE_PX);
  const maxVisibleFromWidth =
    containerWidth > 0
      ? Math.max(
          1,
          Math.floor((containerWidth - reservedPx) / CHIP_ESTIMATE_PX),
        )
      : maxVisible;
  const effectiveMaxVisible =
    responsive && containerWidth > 0
      ? Math.min(maxVisible, maxVisibleFromWidth)
      : maxVisible;

  const mainCategories = categories.filter((c) => {
    const idLower = c.id?.toLowerCase();
    const nameLower = c.name?.toLowerCase();
    return (
      c.id !== "All" &&
      c.name !== "All" &&
      idLower !== "all" &&
      nameLower !== "all"
    );
  });

  const hiddenSet = React.useMemo(
    () =>
      hiddenByDefault == null
        ? null
        : new Set(hiddenByDefault.map((s) => s.toLowerCase())),
    [hiddenByDefault],
  );

  const isHiddenByDefault = React.useCallback(
    (c: CategoryWithCount) => {
      if (hiddenSet == null) return false;
      const id = c.id?.toLowerCase() ?? "";
      const name = c.name?.toLowerCase() ?? "";
      return hiddenSet.has(id) || hiddenSet.has(name);
    },
    [hiddenSet],
  );

  const primaryCategories =
    hiddenSet != null
      ? mainCategories.filter((c) => !isHiddenByDefault(c))
      : mainCategories;

  const primaryWithSelected =
    hiddenSet != null
      ? mainCategories.filter(
          (c) =>
            !isHiddenByDefault(c) ||
            selectedCategory === c.id ||
            selectedCategory === c.name,
        )
      : mainCategories;

  const visibleCategories = singleLine
    ? mainCategories
    : expanded
      ? mainCategories
      : hiddenSet != null
        ? primaryWithSelected.filter(
            (c, i) =>
              i < effectiveMaxVisible ||
              selectedCategory === c.id ||
              selectedCategory === c.name,
          )
        : mainCategories.slice(0, effectiveMaxVisible);

  const hasMoreByCount =
    !singleLine && mainCategories.length > effectiveMaxVisible;
  const hasMoreByHidden =
    hiddenSet != null && mainCategories.some(isHiddenByDefault);
  const hasMoreByPrimaryCount =
    hiddenSet != null && primaryWithSelected.length > effectiveMaxVisible;
  const hasMore = hasMoreByCount || hasMoreByHidden || hasMoreByPrimaryCount;

  const containerClass = singleLine
    ? "flex flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden pb-1 -mb-1"
    : "flex flex-wrap items-center gap-2";
  const chipClass =
    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2";

  return (
    <div
      ref={containerRef}
      className={containerClass}
      role="group"
      aria-label="Filter by category"
    >
      {!hideLabel && (
        <span className="shrink-0 text-sm font-medium text-gray-600">
          Categories:
        </span>
      )}
      {showAllButton && (
        <button
          type="button"
          onClick={() => onSelect("All")}
          className={`${chipClass} ${
            selectedCategory === "All"
              ? "bg-[var(--color-main)] text-white"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          aria-pressed={selectedCategory === "All"}
          aria-label="Show all categories"
        >
          All
        </button>
      )}
      {visibleCategories.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`${chipClass} ${
              isActive
                ? "bg-[var(--color-main)] text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            aria-pressed={isActive}
            aria-label={`Filter by ${cat.name}`}
          >
            {cat.name}
            {cat.count != null ? ` (${cat.count})` : ""}
          </button>
        );
      })}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className={`${chipClass} bg-gray-100 text-gray-700 hover:bg-gray-200`}
          aria-label={
            expanded ? "Show fewer categories" : "View more categories"
          }
        >
          {expanded ? "View less" : "+ View more"}
        </button>
      )}
    </div>
  );
}
