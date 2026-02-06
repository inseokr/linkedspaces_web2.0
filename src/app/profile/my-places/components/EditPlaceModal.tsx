"use client";

import * as React from "react";
import { X, Trash2, Mic, ImagePlus, Lock, Globe } from "lucide-react";
import type { SavedPlace, PlaceCategory } from "../mockData";
import { PLACE_CATEGORIES } from "../mockData";

export type PlaceVisibility = "private" | "public";

export interface EditPlaceModalProps {
  isOpen: boolean;
  place: SavedPlace | null;
  onClose: () => void;
  onSave?: (updates: {
    name: string;
    note: string;
    visibility?: PlaceVisibility;
    category?: PlaceCategory;
  }) => void;
  onDelete?: (placeId: string) => void;
  /** Current visibility if known (e.g. from backend). Defaults to "public". */
  initialVisibility?: PlaceVisibility;
  /** Categories for the dropdown; same list as My Places filter / getMyPlacesFromUser. Defaults to PLACE_CATEGORIES. */
  categories?: PlaceCategory[];
}

const NOTE_PLACEHOLDER = "Leave a note for your future self.";

export default function EditPlaceModal({
  isOpen,
  place,
  onClose,
  onSave,
  onDelete,
  initialVisibility = "public",
  categories: categoriesProp,
}: EditPlaceModalProps) {
  const categories = categoriesProp ?? PLACE_CATEGORIES;
  const categoryOptions = React.useMemo(() => {
    const skip = (c: string | undefined) =>
      !c || c === "All" || c === "Null" || String(c).trim() === "";
    const set = new Set(
      [...categories, place?.category].filter((c): c is string => !skip(c)),
    );
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [categories, place?.category]);
  const [name, setName] = React.useState(place?.name ?? "");
  const [note, setNote] = React.useState(
    place?.caption ?? place?.snippet ?? "",
  );
  const [visibility, setVisibility] = React.useState<PlaceVisibility>(
    place?.visibility ?? initialVisibility,
  );
  const normalizeCategory = (c: string | undefined): PlaceCategory =>
    !c || c === "All" || c === "Null" || String(c).trim() === ""
      ? "Others"
      : (c as PlaceCategory);
  const [category, setCategory] = React.useState<PlaceCategory>(
    normalizeCategory(place?.category),
  );

  React.useEffect(() => {
    if (place) {
      setName(place.name ?? "");
      setNote(place.caption ?? place.snippet ?? "");
      setVisibility(place.visibility ?? initialVisibility);
      setCategory(normalizeCategory(place.category));
    }
  }, [
    place?.id,
    place?.name,
    place?.caption,
    place?.snippet,
    place?.visibility,
    place?.category,
    initialVisibility,
    place,
  ]);

  const photos = React.useMemo(() => {
    if (!place) return [];
    const uris = place.photoListUris?.length
      ? place.photoListUris
      : place.thumbnailUrl
        ? [place.thumbnailUrl]
        : [];
    return uris;
  }, [place]);

  const mainImageUrl =
    photos[0] ?? "https://picsum.photos/400/400?random=place";

  const handleSave = () => {
    onSave?.({ name: name.trim(), note: note.trim(), visibility, category });
    onClose();
  };

  const handleDelete = () => {
    if (place && onDelete) {
      if (
        typeof window !== "undefined" &&
        window.confirm("Delete this place? This cannot be undone.")
      ) {
        onDelete(place.id);
        onClose();
      }
    }
  };

  if (!isOpen || !place) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-place-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        aria-hidden
        onClick={onClose}
      />

      {/* Panel - dark grey, rounded */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-gray-800 shadow-2xl overflow-hidden">
        {/* Top bar: Delete (right) and Close (X) */}
        <div className="flex items-center justify-end gap-2 pr-4 pt-4">
          {onDelete && place && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-700 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Delete place"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 px-6 pb-6">
          {/* Left: main image + thumbnails */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="h-40 w-40 sm:h-48 sm:w-48 rounded-full overflow-hidden border-2 border-white/20 bg-gray-700">
              <img
                src={mainImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-white/30 text-white/60 transition-colors hover:border-white/50 hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Add photo"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
              {photos.slice(0, 3).map((src, i) => (
                <div
                  key={i}
                  className="h-12 w-12 rounded-lg overflow-hidden border-2 border-white/20 bg-gray-700 shrink-0"
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: name + note + actions */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <h2 id="edit-place-title" className="sr-only">
              Edit place
            </h2>
            <div>
              <label htmlFor="edit-place-name" className="sr-only">
                Place name
              </label>
              <input
                id="edit-place-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-lg font-medium text-white border-b border-white/30 pb-1 focus:border-white/60 focus:outline-none placeholder:text-gray-500"
                placeholder="Place name"
              />
            </div>
            {/* Visible to your network – then Category */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                Visible to your network:
              </span>
              <div
                className="inline-flex rounded-lg border border-gray-600 bg-gray-700/50 p-0.5"
                role="group"
                aria-label="Place visibility"
              >
                <button
                  type="button"
                  onClick={() => setVisibility("private")}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                    visibility === "private"
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  aria-pressed={visibility === "private"}
                  aria-label="Private – only you"
                >
                  <Lock className="h-4 w-4" />
                  Private
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("public")}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                    visibility === "public"
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  aria-pressed={visibility === "public"}
                  aria-label="Public – visible to your network"
                >
                  <Globe className="h-4 w-4" />
                  Public
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="edit-place-category"
                className="text-sm text-gray-400"
              >
                Category
              </label>
              <select
                id="edit-place-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as PlaceCategory)}
                className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700/80 px-3 py-2 text-sm text-white focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c} className="bg-gray-800 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-h-[120px]">
              <label htmlFor="edit-place-note" className="sr-only">
                Note
              </label>
              <textarea
                id="edit-place-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={NOTE_PLACEHOLDER}
                rows={4}
                className="w-full rounded-xl bg-gray-700/80 px-4 py-3 text-sm text-white placeholder:text-gray-400 border border-gray-600 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 resize-none"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-700/80 px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Use voice to write"
            >
              <Mic className="h-4 w-4" />
              Use Voice To Write
            </button>
          </div>
        </div>

        {/* Bottom: Save */}
        <div className="px-6 pb-6 pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-[var(--color-main)] px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
