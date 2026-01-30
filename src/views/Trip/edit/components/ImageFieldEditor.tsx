"use client";

import React, { useRef, useEffect } from "react";
import type { ImageValue } from "../types/editTypes";
import { idbSetBlob } from "@/views/Trip/edit/utils/imageIdb";
import { getBlogImageResolved } from "../utils/blogImageCache";

function getSrc(v: ImageValue): string | null {
  if (v.kind === "keep") {
    const { src } = getBlogImageResolved(v.url);
    return src;
  }
  if (v.kind === "local") return v.previewUrl ?? null;
  return null;
}

export default function ImageFieldEditor({
  value,
  onChange,
  userId,
  tripId,
}: {
  value: ImageValue;
  onChange: (v: ImageValue) => void;
  userId: string;
  tripId: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const src = getSrc(value);
  useEffect(() => {
    return () => {};
  }, [value]);

  const handlePick = () => inputRef.current?.click();
  const coverKey = (userId: string, tripId: string) =>
    `cover:${userId}:${tripId}`;
  const handleFile = async (file: File | null) => {
    if (!file) return;

    // 프리뷰는 blob URL로 (가볍고 빠름)
    const previewUrl = URL.createObjectURL(file);

    // 원본은 IndexedDB에 저장
    const key = coverKey(userId, tripId);
    try {
      await idbSetBlob(key, file);
      console.log("[idb saved]", key);
    } catch (e) {
      console.log("[idb save failed]", e);
    }

    onChange({ kind: "local", previewUrl, previewKey: key });
  };

  const handleRemove = () => {
    if (value.kind === "local" && value.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(value.previewUrl);
    }
    onChange({ kind: "remove", reason: "user" });
  };

  return (
    <div className="rounded-3xl border border-black/10 p-4">
      <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black/[0.04]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="cover" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm opacity-60">
            No image
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="rounded-full bg-black px-4 py-2 text-sm text-white"
          onClick={handlePick}
        >
          Change
        </button>
        <button
          type="button"
          className="rounded-full bg-black/5 px-4 py-2 text-sm"
          onClick={handleRemove}
        >
          Remove
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
