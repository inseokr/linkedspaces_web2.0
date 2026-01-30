"use client";

import React from "react";
import type { PlaceDraft } from "../types/editTypes";
import TextRow from "./TextRow";

export default function PlaceCaptionList({
  places,
  onChange,
}: {
  places: PlaceDraft[];
  onChange: (next: PlaceDraft[]) => void;
}) {
  const updateCaption = (id: string, caption: string) => {
    onChange(places.map((p) => (p.id === id ? { ...p, caption } : p)));
  };

  return (
    <div className="mt-4 space-y-6">
      {places.map((p) => (
        <div key={p.id} className="rounded-3xl border border-black/10 p-4">
          <div className="mb-3 text-sm font-semibold">{p.placeName}</div>
          <TextRow
            label="Caption"
            value={p.caption}
            multiline
            placeholder="Write a caption…"
            onChange={(v) => updateCaption(p.id, v)}
          />
        </div>
      ))}
    </div>
  );
}
