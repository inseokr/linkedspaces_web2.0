"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";

export interface SaveForLaterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Place being saved (for context in header/description) */
  placeName?: string;
  placeId?: string;
  /** Callback when place is added to a collection (for future persistence) */
  onAddToCollection?: (collectionId: string) => void;
  /** Callback when "Create a collection" is clicked */
  onCreateCollection?: () => void;
}

/** Mock collections until backend/state exists */
const MOCK_COLLECTIONS = [
  { id: "california", name: "California" },
  { id: "korea", name: "Korea" },
];

export default function SaveForLaterPanel({
  isOpen,
  onClose,
  placeName,
  onAddToCollection,
  onCreateCollection,
}: SaveForLaterPanelProps) {
  const handleAdd = React.useCallback(
    (collectionId: string) => {
      onAddToCollection?.(collectionId);
    },
    [onAddToCollection],
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-stretch justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-for-later-title"
    >
      {/* Backdrop - click to close */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Panel: dark grey, rounded left corners, slide from right */}
      <div
        className="relative flex w-full max-w-sm flex-col rounded-l-2xl bg-gray-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="save-for-later-title"
                className="text-lg font-bold text-gray-100"
              >
                Save for later
              </h2>
              <p className="mt-1.5 text-sm text-gray-400 leading-snug">
                It can be found from saved places. You can add it to a specific
                collection as well.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="my-4 border-t border-gray-600" aria-hidden />

          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-gray-100">Collections</h3>
            <button
              type="button"
              onClick={() => onCreateCollection?.()}
              className="text-sm text-gray-400 transition-colors hover:text-[var(--color-main)] focus:outline-none focus:ring-0"
            >
              Create a collection
            </button>
          </div>

          <ul className="mt-3 space-y-1" role="list">
            {MOCK_COLLECTIONS.map((col) => (
              <li
                key={col.id}
                className="flex items-center justify-between gap-3 rounded-lg py-2 px-2 -mx-2 hover:bg-gray-700/50"
              >
                <span className="text-sm font-medium text-gray-200">
                  {col.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdd(col.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-600 text-white transition-colors hover:bg-[var(--color-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2 focus:ring-offset-gray-800"
                  aria-label={`Add to ${col.name}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          {placeName ? (
            <p className="mt-4 text-xs text-gray-500">
              Saving: <span className="text-gray-400">{placeName}</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
