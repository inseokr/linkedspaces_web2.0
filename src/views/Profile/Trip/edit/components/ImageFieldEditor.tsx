"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ImageValue } from "../types/editTypes";
import {
  idbGetBlob,
  idbSetBlob,
} from "@/views/Profile/Trip/edit/utils/imageIdb";
import { getBlogImageResolved } from "../utils/blogImageCache";
import Button from "@/components/ui/Button";

function coverKey(userId: string, tripId: string) {
  return `cover:${userId}:${tripId}`;
}

export default function ImageFieldEditor({
  value,
  onChange,
  userId,
  tripId,
  onOpenGallery,
}: {
  value: ImageValue;
  onChange: (v: ImageValue) => void;
  userId: string;
  tripId: string;
  /** Optional: override "Change" to open a trip photo gallery instead of file picker. */
  onOpenGallery?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  // ✅ 파일 선택으로 만든 blob URL
  const pickUrlRef = useRef<string | null>(null);
  // ✅ idb에서 복원하며 만든 blob URL
  const idbUrlRef = useRef<string | null>(null);

  const revokePickUrl = () => {
    if (pickUrlRef.current?.startsWith("blob:"))
      URL.revokeObjectURL(pickUrlRef.current);
    pickUrlRef.current = null;
  };

  const revokeIdbUrl = () => {
    if (idbUrlRef.current?.startsWith("blob:"))
      URL.revokeObjectURL(idbUrlRef.current);
    idbUrlRef.current = null;
  };

  // ✅ value 바뀔 때 화면 src 결정
  useEffect(() => {
    let cancelled = false;

    async function run() {
      // keep
      if (value.kind === "keep") {
        // idb로 만든 url은 이제 필요 없을 가능성이 높으니 정리
        revokeIdbUrl();

        const { src } = getBlogImageResolved(value.url);
        if (!cancelled) setResolvedSrc(src ?? null);
        return;
      }

      // local
      if (value.kind === "local") {
        // previewUrl이 있으면 그대로 사용 (여기서 revoke하면 안 됨!!)
        if (value.previewUrl) {
          // idbUrl은 다른 루트에서 만들어졌다면 정리 가능
          revokeIdbUrl();
          if (!cancelled) setResolvedSrc(value.previewUrl);
          return;
        }

        // previewUrl 없으면 idb에서 복원
        const key = value.previewKey;
        if (!key) {
          revokeIdbUrl();
          if (!cancelled) setResolvedSrc(null);
          return;
        }

        const blob = await idbGetBlob(key);
        if (!blob) {
          revokeIdbUrl();
          if (!cancelled) setResolvedSrc(null);
          return;
        }

        // 기존 idbUrl 정리 후 새로 생성
        revokeIdbUrl();
        const url = URL.createObjectURL(blob);
        idbUrlRef.current = url;

        if (!cancelled) {
          setResolvedSrc(url);
          // 선택: 다음부터 빠르게 보이도록 previewUrl도 draft에 저장
          onChange({ ...value, previewUrl: url });
        }
        return;
      }

      // remove
      revokeIdbUrl();
      if (!cancelled) setResolvedSrc(null);
    }

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    value.kind,
    (value as any).url,
    (value as any).previewUrl,
    (value as any).previewKey,
  ]);

  // ✅ 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      revokePickUrl();
      revokeIdbUrl();
    };
  }, []);

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (file: File | null) => {
    if (!file) return;

    // 이전 pick url 정리
    revokePickUrl();

    const previewUrl = URL.createObjectURL(file);
    pickUrlRef.current = previewUrl;

    // ✅ 즉시 UI 반영 (부모 state 반영 기다리지 않아도 됨)
    setResolvedSrc(previewUrl);

    const key = coverKey(userId, tripId);
    await idbSetBlob(key, file);

    onChange({ kind: "local", previewUrl, previewKey: key });
  };

  const hasGallery = typeof onOpenGallery === "function";

  return (
    <div
      className={[
        "relative w-full overflow-hidden rounded-2xl transition-all duration-300 group",
        "aspect-[21/7]",
        resolvedSrc
          ? "cursor-pointer"
          : "cursor-pointer border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 flex items-center justify-center",
      ].join(" ")}
      onClick={
        !resolvedSrc ? (hasGallery ? onOpenGallery : handlePick) : undefined
      }
    >
      {resolvedSrc ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedSrc}
            alt="cover"
            className="h-full w-full object-cover"
          />

          {/* Dark hover scrim + Change Cover pill */}
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={hasGallery ? onOpenGallery : handlePick}
          >
            <div className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-md border border-slate-200">
              Change Cover
            </div>
          </div>

          {/* Upload icon top-right (device upload) */}
          {hasGallery && (
            <button
              type="button"
              title="Upload from device"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation();
                handlePick();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-400 select-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-8 w-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
          <span className="text-sm font-semibold">Add Cover Photo</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0] ?? null);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}
