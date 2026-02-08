"use client";

import type { LucideIcon } from "lucide-react";
import { Coffee, UtensilsCrossed, Wine, TreePine, MapPin } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  photoUrl: string | null;
  /** When set and no photoUrl, show category icon (Cafe, Restaurant, Bar, Park, etc.) instead of pin. */
  categoryForIcon?: string | null;
  onClick?: () => void;
};

/** Static map: category key → icon component (declared once, no component created during render). */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  cafe: Coffee,
  restaurant: UtensilsCrossed,
  bar: Wine,
  park: TreePine,
  place: MapPin,
};

function getCategoryIconKey(category: string): keyof typeof CATEGORY_ICONS {
  const key = (category ?? "").trim().toLowerCase();
  if (key.includes("cafe") || key.includes("coffee")) return "cafe";
  if (key.includes("restaurant")) return "restaurant";
  if (key.includes("bar") || key.includes("pub")) return "bar";
  if (
    key.includes("park") ||
    key.includes("attraction") ||
    key.includes("sightseeing")
  )
    return "park";
  return "place";
}

export default function HighlightCard({
  title,
  subtitle,
  photoUrl,
  categoryForIcon,
  onClick,
}: Props) {
  const iconKey =
    categoryForIcon != null && categoryForIcon !== ""
      ? getCategoryIconKey(categoryForIcon)
      : null;
  const IconComponent = iconKey ? (CATEGORY_ICONS[iconKey] ?? MapPin) : null;

  const content = (
    <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-24 w-24 shrink-0 bg-gray-100">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : IconComponent ? (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            <IconComponent className="h-10 w-10" aria-hidden />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <span className="text-2xl">📍</span>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center p-3 text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {title}
        </p>
        <p className="truncate text-sm font-semibold text-gray-900">
          {subtitle ?? "—"}
        </p>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 rounded-xl"
      >
        {content}
      </button>
    );
  }
  return content;
}
