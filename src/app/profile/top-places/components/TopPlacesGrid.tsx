"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { TopPlaceCardModel } from "../types";
import TopPlaceCard from "./TopPlaceCard";
import PlaceLightboxModal, { type LightboxImage } from "./PlaceLightboxModal";
import EditPlaceModal from "../../my-places/components/EditPlaceModal";
import type { SavedPlace } from "../../my-places/mockData";
import { PLACE_CATEGORIES } from "../../my-places/mockData";

const INITIAL_VISIBLE = 12;

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

/** Format visit date/time for lightbox with actual hours and minutes. */
function formatVisitDate(isoOrYmd: string): string {
  const s = String(isoOrYmd).trim();
  if (!s) return "";
  const d = parseDateTime(s);
  if (!d || Number.isNaN(d.getTime())) return s;
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "long" });
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const h12 = hours % 12 || 12;
  const ampm = hours < 12 ? "AM" : "PM";
  const timeStr = `${h12}:${String(minutes).padStart(2, "0")} ${ampm}`;
  return `${day} ${month} ${d.getFullYear()} at ${timeStr}`;
}
const LOAD_MORE_COUNT = 6;

/** Map Top Place to SavedPlace-like for EditPlaceModal (Top Places page). */
function topPlaceToSavedPlace(p: TopPlaceCardModel): SavedPlace {
  const address =
    [p.city, p.country].filter(Boolean).join(", ") || "Address unknown";
  return {
    id: p.id,
    name: p.title,
    category: (p.category || "Others") as SavedPlace["category"],
    visitedDate: p.visitedTime ? formatVisitDate(p.visitedTime) : "Visited",
    snippet: p.caption ?? "",
    thumbnailUrl: p.imageUrl ?? null,
    address,
    city: p.city || undefined,
    lat: p.latitude ?? 0,
    lng: p.longitude ?? 0,
    caption: p.caption,
    photoListUris: p.photoListUris?.length
      ? p.photoListUris
      : p.imageUrl
        ? [p.imageUrl]
        : undefined,
    visitedTimeRaw: p.visitedTime,
    visibility: "public",
  };
}

interface CardInteractionState {
  bookmarked: Set<string>;
  liked: Set<string>;
  /** Override likes count when user toggles heart (delta per place) */
  likeDelta: Record<string, number>;
}

interface TopPlacesGridProps {
  places: TopPlaceCardModel[];
}

export default function TopPlacesGrid({ places }: TopPlacesGridProps) {
  const [selectedPlace, setSelectedPlace] =
    React.useState<TopPlaceCardModel | null>(null);
  const [editPlace, setEditPlace] = React.useState<SavedPlace | null>(null);
  const placeBeforeEditRef = React.useRef<TopPlaceCardModel | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_VISIBLE);
  const [interaction, setInteraction] = React.useState<CardInteractionState>({
    bookmarked: new Set(),
    liked: new Set(),
    likeDelta: {},
  });

  const visiblePlaces = places.slice(0, visibleCount);
  const hasMore = visibleCount < places.length;
  const isExpanded = visibleCount > INITIAL_VISIBLE;

  const onBookmarkToggle = React.useCallback((placeId: string) => {
    setInteraction((prev) => {
      const next = new Set(prev.bookmarked);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return { ...prev, bookmarked: next };
    });
  }, []);

  const onLikeToggle = React.useCallback((placeId: string) => {
    setInteraction((prev) => {
      const nextSet = new Set(prev.liked);
      const nextDelta = { ...prev.likeDelta };
      if (nextSet.has(placeId)) {
        nextSet.delete(placeId);
        nextDelta[placeId] = (nextDelta[placeId] ?? 0) - 1;
      } else {
        nextSet.add(placeId);
        nextDelta[placeId] = (nextDelta[placeId] ?? 0) + 1;
      }
      return { ...prev, liked: nextSet, likeDelta: nextDelta };
    });
  }, []);

  const handleShowMore = () => {
    if (hasMore) {
      setVisibleCount((c) => Math.min(c + LOAD_MORE_COUNT, places.length));
    } else {
      setVisibleCount(INITIAL_VISIBLE);
    }
  };

  const lightboxImages: LightboxImage[] = selectedPlace
    ? (() => {
        const uris = selectedPlace.photoListUris ?? [selectedPlace.imageUrl];
        const dateTime =
          selectedPlace.visitedTime != null &&
          String(selectedPlace.visitedTime).trim()
            ? formatVisitDate(selectedPlace.visitedTime)
            : "Date unknown";
        const caption = selectedPlace.caption;
        const base = {
          placeId: selectedPlace.id,
          placeName: selectedPlace.title,
          dateTime,
          category: selectedPlace.category,
          visibility: "public" as const,
          ...(caption ? { caption } : {}),
          ...(selectedPlace.city ? { placeCity: selectedPlace.city } : {}),
        };
        return uris.length > 0
          ? uris.map((src) => ({ src, ...base }))
          : [{ src: selectedPlace.imageUrl, ...base }];
      })()
    : [];

  const handleEdit = React.useCallback(() => {
    if (!selectedPlace) return;
    placeBeforeEditRef.current = selectedPlace;
    setEditPlace(topPlaceToSavedPlace(selectedPlace));
    setSelectedPlace(null);
  }, [selectedPlace]);

  const handleEditClose = React.useCallback(() => {
    const restore = placeBeforeEditRef.current;
    placeBeforeEditRef.current = null;
    if (restore) setSelectedPlace(restore);
    setEditPlace(null);
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePlaces.map((place) => (
          <TopPlaceCard
            key={place.id}
            place={place}
            displayLikes={
              place.likesCount + (interaction.likeDelta[place.id] ?? 0)
            }
            isBookmarked={interaction.bookmarked.has(place.id)}
            isLiked={interaction.liked.has(place.id)}
            onBookmarkToggle={() => onBookmarkToggle(place.id)}
            onLikeToggle={() => onLikeToggle(place.id)}
            onPlaceClick={setSelectedPlace}
          />
        ))}
      </div>

      <PlaceLightboxModal
        isOpen={!!selectedPlace}
        onClose={() => setSelectedPlace(null)}
        images={lightboxImages}
        startIndex={0}
        onEdit={handleEdit}
      />
      <EditPlaceModal
        isOpen={editPlace !== null}
        place={editPlace}
        categories={PLACE_CATEGORIES}
        onClose={handleEditClose}
        onSave={() => {
          // TODO: persist from Top Places if backend supports
        }}
      />

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={handleShowMore}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
          aria-label={hasMore ? "Show more spaces" : "Show less spaces"}
        >
          {hasMore ? "Show more spaces" : "Show less"}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
