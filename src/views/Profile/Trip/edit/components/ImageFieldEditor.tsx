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
}: {
  value: ImageValue;
  onChange: (v: ImageValue) => void;
  userId: string;
  tripId: string;
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

  const handleRemove = () => {
    revokePickUrl();
    revokeIdbUrl();
    setResolvedSrc(null);
    onChange({ kind: "remove", reason: "user" });
  };

  return (
    <div className="rounded-3xl border border-black/10 p-4">
      <div className="flex flex-wrap items-center gap-12">
        <div className="w-full max-w-[clamp(320px,60vw,780px)]">
          <div className="relative aspect-[780/230] w-full overflow-hidden rounded-2xl bg-black/[0.04]">
            {resolvedSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedSrc}
                alt="cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm opacity-60">
                No image
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            type="button"
            radius="full"
            variant="neutral"
            className="h-10 px-6 text-lg font-bold"
            onClick={handlePick}
          >
            Change
          </Button>

          <Button
            type="button"
            radius="full"
            variant="neutral"
            className="h-10 px-6 text-lg font-bold"
            onClick={handleRemove}
            disabled={!resolvedSrc}
          >
            Remove
          </Button>
        </div>
      </div>

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
