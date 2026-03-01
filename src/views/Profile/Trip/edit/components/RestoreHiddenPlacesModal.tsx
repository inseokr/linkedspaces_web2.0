import React from "react";
import { X } from "lucide-react";

import type { PlaceDraft } from "@/views/Profile/Trip/edit/types/editTypes";

interface RestoreHiddenPlacesModalProps {
  hiddenPlaces: PlaceDraft[];
  onRestorePlace: (placeId: string) => void;
  onRestoreAll: () => void;
  onClose: () => void;
}

export default function RestoreHiddenPlacesModal({
  hiddenPlaces,
  onRestorePlace,
  onRestoreAll,
  onClose,
}: RestoreHiddenPlacesModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 sm:p-6">
      <div className="w-full max-w-[520px] bg-slate-50 rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[85vh]">
        <div className="relative flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 sm:px-6 shadow-sm z-30">
          {/* Top Left: X Button */}
          <button
            type="button"
            onClick={onClose}
            className="z-10 rounded-full p-2 text-black/50 hover:bg-black/5 hover:text-black transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Middle: Title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2 className="text-[18px] font-extrabold text-black tracking-tight pointer-events-auto">
              Hidden Places
            </h2>
          </div>

          {/* Top Right: Restore All */}
          <div className="z-10 flex items-center min-w-[80px] justify-end">
            {hiddenPlaces.length > 0 && (
              <button
                type="button"
                onClick={onRestoreAll}
                className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
              >
                Restore All
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-[15px] bg-slate-50 relative z-20">
          <div className="w-full space-y-[15px]">
            {hiddenPlaces.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <p>No hidden places found.</p>
              </div>
            ) : (
              hiddenPlaces.map((place) => {
                const photoUrl = place.photos?.[0];
                const timeRangeText = place.timeRangeText ?? "";

                return (
                  <div
                    key={place.id}
                    className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-black/5"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center relative">
                      {photoUrl ? (
                        <img
                          src={photoUrl.startsWith("idb:") ? "" : photoUrl}
                          alt={place.placeName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-black/20 font-bold text-xs">
                          No img
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="truncate font-bold text-black text-[16px]">
                        {place.placeName || "Unnamed Place"}
                      </h3>
                      {timeRangeText && (
                        <p className="truncate text-sm font-medium text-black/50">
                          {timeRangeText}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onRestorePlace(place.id);
                        if (hiddenPlaces.length === 1) {
                          onClose();
                        }
                      }}
                      className="shrink-0 rounded-full bg-blue-500 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-600 transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
