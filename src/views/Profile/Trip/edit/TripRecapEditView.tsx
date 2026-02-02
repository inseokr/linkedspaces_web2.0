"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiFetch } from "@/api/client";
import { updateTripCoverPhoto, type TripRecapResponse } from "@/api/trips";
import { mapTripRecapToPageModel } from "@/views/Profile/Trip/utils/mapTripRecap";

import RecapBlogTopBar from "@/views/Profile/Trip/section/RecapBlogTopBar";
import type { DayTab } from "@/views/Profile/Trip/component/RecapDayTabs";

import type { RecapEditDraft, PlaceDraft } from "./types/editTypes";
import { draftFromPageModel } from "./utils/editMappers";
import { loadDraft, saveDraft, clearDraft } from "./utils/draftStorage";
import { updatePlaceVisitHistoryStory } from "@/api/user";

import ImageFieldEditor from "./components/ImageFieldEditor";
import TextRow from "./components/TextRow";
import deleteIcon from "@/assets/icons/delete.svg";
import { RecapBlogDaySection } from "@/views/Profile/Trip/component/RecapBlogPlace";
import PhotoLightbox from "@/components/ui/PhotoLightbox";
import {
  idbPutBlob,
  makeImageKey,
} from "@/views/Profile/Trip/edit/utils/imageIdb";

export default function TripRecapEditView({
  userId,
  tripId,
}: {
  userId: string;
  tripId: string;
}) {
  const router = useRouter();

  const TOPBAR_OFFSET_PX = 120; // sticky topbar 높이에 맞춰 조절

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recapData, setRecapData] = useState<TripRecapResponse | null>(null);
  const [openRemoveBlog, setOpenRemoveBlog] = useState(false);
  const [coverGalleryOpen, setCoverGalleryOpen] = useState(false);
  // draft
  const [draft, setDraft] = useState<RecapEditDraft | null>(null);
  const draftRef = useRef<RecapEditDraft | null>(null);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // Baseline captions keyed by placeKey -> photoUrl -> caption.
  // We diff against this on "Update" so we only call the caption API for changed photos.
  const baselineCaptionsRef = useRef<Map<string, Map<string, string>> | null>(
    null,
  );
  const baselineInitializedRef = useRef(false);

  // day scroll refs
  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const buildBaselineCaptions = (d: RecapEditDraft) => {
    const placeMap = new Map<string, Map<string, string>>();
    for (const day of d.days ?? []) {
      for (const place of day.places ?? []) {
        const placeKey = place.placeKey;
        if (!placeKey) continue;

        const photoToCaption = new Map<string, string>();
        const photos = place.photos ?? [];
        const captions = (place as any).captions ?? [];
        for (let i = 0; i < photos.length; i++) {
          const photoUrl = photos[i];
          if (!photoUrl) continue;

          const caption =
            typeof captions?.[i] === "string"
              ? captions[i]
              : i === 0 && typeof (place as any).caption === "string"
                ? (place as any).caption
                : "";

          // If duplicate URIs exist, keep the first baseline value (stable).
          if (!photoToCaption.has(photoUrl)) {
            photoToCaption.set(photoUrl, caption);
          }
        }
        placeMap.set(placeKey, photoToCaption);
      }
    }
    return placeMap;
  };

  /** 1) Fetch */
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!userId || !tripId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<TripRecapResponse>(
          `/ls-beta-test/trip-recap/${userId}/${tripId}`,
        );
        if (cancelled) return;
        setRecapData(data);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Failed to load recap");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [userId, tripId]);

  const pageModel = useMemo(() => {
    if (!recapData) return null;
    return mapTripRecapToPageModel(recapData);
  }, [recapData]);

  /** 2) init draft */
  useEffect(() => {
    if (!pageModel) return;

    const saved = loadDraft(userId, tripId);
    if (saved) {
      setDraft(saved);
      return;
    }

    const base = draftFromPageModel(pageModel);
    setDraft(base);
  }, [pageModel, userId, tripId]);

  // Initialize baseline captions once (first time draft becomes available).
  useEffect(() => {
    if (!draft) return;
    if (baselineInitializedRef.current) return;
    baselineCaptionsRef.current = buildBaselineCaptions(draft);
    baselineInitializedRef.current = true;
  }, [draft]);

  /** 3) tabs / breadcrumb */
  const dayTabs: DayTab[] = useMemo(() => {
    return (
      draft?.days.map((d) => ({ id: d.id, label: `Day ${d.dayIndex}` })) ?? []
    );
  }, [draft?.days]);

  /** 4) scroll to day */
  const scrollToDay = (dayId: string) => {
    const el = daySectionRefs.current[dayId];
    if (!el) return;

    const y =
      el.getBoundingClientRect().top + window.scrollY - TOPBAR_OFFSET_PX - 12;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  /** 5) save/close/discard */
  const handleUpdate = async () => {
    if (!draft) return;

    // Diff captions by photo URI (not by index) so index shifts don't trigger "update all".
    const baseline = baselineCaptionsRef.current ?? new Map();
    const updates: Array<{
      placeKey: string;
      photoIndex: number;
      storyText: string;
    }> = [];

    for (const day of draft.days ?? []) {
      for (const place of day.places ?? []) {
        const placeKey = place.placeKey;
        if (!placeKey) continue;

        const baselineByPhoto =
          baseline.get(placeKey) ?? new Map<string, string>();
        const photos = place.photos ?? [];
        const captions = (place as any).captions ?? [];

        for (let i = 0; i < photos.length; i++) {
          const photoUrl = photos[i];
          if (!photoUrl) continue;
          // Local-only (idb) photos can't be updated server-side with this endpoint.
          if (photoUrl.startsWith("idb:")) continue;

          const nextCaption =
            typeof captions?.[i] === "string"
              ? captions[i]
              : i === 0 && typeof (place as any).caption === "string"
                ? (place as any).caption
                : "";

          const prevCaption = baselineByPhoto.get(photoUrl) ?? "";
          if (nextCaption !== prevCaption) {
            updates.push({ placeKey, photoIndex: i, storyText: nextCaption });
          }
        }
      }
    }

    setLoading(true);
    setError(null);
    try {
      // Execute updates; keep going even if some fail.
      const results = await Promise.allSettled(
        updates.map((u) =>
          updatePlaceVisitHistoryStory({
            placeKey: u.placeKey,
            photoIndex: u.photoIndex,
            storyText: u.storyText,
          }),
        ),
      );

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        throw new Error(`Failed to update ${failed.length} caption(s).`);
      }

      // Refresh baseline with the saved captions so repeated "Update" doesn't resend.
      baselineCaptionsRef.current = buildBaselineCaptions(draft);

      saveDraft(userId, tripId, { ...draft, updatedAt: Date.now() });
      router.back();
    } catch (e: any) {
      setError(e?.message ?? "Failed to update captions");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleDiscardLocal = () => {
    clearDraft(userId, tripId);
    router.back();
  };

  const handleRemoveBlog = async () => {
    // 1) 로컬 드래프트 삭제
    clearDraft(userId, tripId);

    // 2) 서버 삭제 API가 있으면 여기서 호출
    // await apiFetch(`/ls-beta-test/trip-recap/${userId}/${tripId}`, { method: "DELETE" });
    router.back();
  };

  /** 6) draft update helpers */
  const setRecapTitle = (recapTitle: string) => {
    setDraft((prev) =>
      prev ? { ...prev, updatedAt: Date.now(), recapTitle } : prev,
    );
  };
  const setSharedWithFriends = (sharedWithFriends: boolean) => {
    setDraft((prev) =>
      prev ? { ...prev, updatedAt: Date.now(), sharedWithFriends } : prev,
    );
  };

  const setDayTitle = (dayId: string, title: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updatedAt: Date.now(),
        days: prev.days.map((d) => (d.id === dayId ? { ...d, title } : d)),
      };
    });
  };

  const updatePlaceInDay = (
    dayId: string,
    placeId: string,
    updater: (p: PlaceDraft) => PlaceDraft,
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updatedAt: Date.now(),
        days: prev.days.map((d) => {
          if (d.id !== dayId) return d;
          return {
            ...d,
            places: d.places.map((p) => (p.id === placeId ? updater(p) : p)),
          };
        }),
      };
    });
  };

  const onCaptionChange = (
    dayId: string,
    placeId: string,
    photoIndex: number,
    next: string,
  ) => {
    updatePlaceInDay(dayId, placeId, (p) => {
      const photosLen = (p.photos ?? []).length;
      const captions = Array.from(
        { length: photosLen },
        (_, i) => (p as any).captions?.[i] ?? "",
      );
      captions[photoIndex] = next;

      return {
        ...p,
        captions,
        // 호환용: 첫 번째 캡션을 caption에 넣어두기
        caption: captions[0] ?? (p as any).caption ?? "",
      } as any;
    });
  };

  const onRemovePhoto = (
    dayId: string,
    placeId: string,
    photoIndex: number,
  ) => {
    updatePlaceInDay(dayId, placeId, (p) => {
      const photos = (p.photos ?? []).filter((_, i) => i !== photoIndex);
      const captions = ((p as any).captions ?? []).filter(
        (_: any, i: number) => i !== photoIndex,
      );

      return {
        ...p,
        photos,
        captions,
        caption: captions?.[0] ?? "",
      } as any;
    });
  };

  const onReplacePhoto = async (
    dayId: string,
    placeId: string,
    photoIndex: number,
    file: File,
  ) => {
    // ✅ idb 저장 -> photos[photoIndex] = "idb:<key>"
    const key = makeImageKey(`place:${placeId}:${photoIndex}`);
    await idbPutBlob(key, file);

    updatePlaceInDay(dayId, placeId, (p) => {
      const photos = [...(p.photos ?? [])];
      photos[photoIndex] = `idb:${key}`;

      return { ...(p as any), photos } as any;
    });
  };

  const tripPhotos = useMemo(() => {
    if (!draft) return [];
    const raw = draft.days.flatMap((d) =>
      d.places.flatMap((p) => (p.photos ?? []).filter(Boolean)),
    );

    // Dedupe (preserve order)
    const seen = new Set<string>();
    const out: string[] = [];
    for (const url of raw) {
      if (seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    }
    return out;
  }, [draft]);

  const coverInitialIndex = useMemo(() => {
    if (!draft) return 0;
    const v = draft.coverPhoto;
    if (v.kind === "keep") return Math.max(0, tripPhotos.indexOf(v.url));
    if (v.kind === "local" && v.previewKey)
      return Math.max(0, tripPhotos.indexOf(`idb:${v.previewKey}`));
    return 0;
  }, [draft, tripPhotos]);

  const persistCoverPhoto = async (photoUri: string | null) => {
    const blogKey = Number(tripId);
    if (!Number.isFinite(blogKey)) return;
    try {
      await updateTripCoverPhoto({ blogKey, photoUri });
    } catch (err) {
      console.warn("Failed to update cover photo:", err);
    }
  };

  const applyCoverFromTripPhoto = (photoUrl: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const nextCover = photoUrl.startsWith("idb:")
        ? ({
            kind: "local",
            previewKey: photoUrl.replace(/^idb:/, ""),
          } as const)
        : ({ kind: "keep", url: photoUrl } as const);
      return { ...prev, updatedAt: Date.now(), coverPhoto: nextCover };
    });

    // Only persist server-side when the selected photo is already a server URI.
    if (!photoUrl.startsWith("idb:")) {
      void persistCoverPhoto(photoUrl);
    }

    setCoverGalleryOpen(false);
  };

  /** render states */
  if (loading) return <div className="p-6">Loading…</div>;

  if (error) {
    return (
      <div className="p-6">
        <div className="font-semibold">Failed to load recap</div>
        <div className="mt-2 text-sm opacity-70">{error}</div>
      </div>
    );
  }

  if (!pageModel || !draft) return <div className="p-6">No data</div>;

  return (
    <div className="min-h-screen bg-white">
      <RecapBlogTopBar
        mode="edit"
        title="Recap Blog"
        dayTabs={dayTabs}
        activeDayId={dayTabs[0]?.id ?? "day-1"} // edit에선 단순 표시용
        onDayChange={(id: string) => scrollToDay(id)}
        onGoBack={() => window.history.back()}
        onCloseEdit={handleClose}
        onUpdate={handleUpdate}
        className="sticky top-0 z-50 border-b border-black/10"
      />

      <div className="mx-auto max-w-[1200px] p-6">
        {/* Settings header */}
        <div className="flex justify-between">
          <div className="text-3xl font-bold">Recap Blog Settings</div>
          <div className="flex items-center text-[var(--color-warning)]">
            <div className="text-2xl font-bold ">Remove Blog</div>
            <button className="ml-3">
              <Image src={deleteIcon} alt="Delete" width={32} height={32} />
            </button>
          </div>
        </div>
        <div className="mt-6 flex gap-10 pl-0 p-4">
          <div className="font-bold text-2xl">Shared with friends</div>
          <label className="relative inline-flex cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={draft.sharedWithFriends}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  updatedAt: Date.now(),
                  sharedWithFriends: e.target.checked,
                })
              }
            />
            <span
              className={[
                "h-[29px] w-[56px] rounded-full transition-colors",
                draft.sharedWithFriends ? "bg-[#0798FF]" : "bg-black/20",
              ].join(" ")}
            />
            <span
              className={[
                "absolute left-[3px] top-[3px] h-[23px] w-[23px] rounded-full bg-white shadow-sm transition-transform",
                draft.sharedWithFriends
                  ? "translate-x-[27px]"
                  : "translate-x-0",
              ].join(" ")}
            />
          </label>
        </div>

        {/* Cover photo */}
        <div className="mt-8">
          <div className="mb-3 text-2xl font-semibold">Cover Photo</div>
          <ImageFieldEditor
            value={draft.coverPhoto}
            userId={userId}
            tripId={tripId}
            onOpenGallery={() => setCoverGalleryOpen(true)}
            onChange={(coverPhoto) => {
              setDraft({ ...draft, updatedAt: Date.now(), coverPhoto });
              if (coverPhoto.kind === "keep") {
                void persistCoverPhoto(coverPhoto.url);
              } else if (coverPhoto.kind === "remove") {
                void persistCoverPhoto(null);
              }
              // Note: "local" cover uploads are currently local-only (idb) and not persisted server-side.
            }}
          />
        </div>

        {/* Recap title (큰 필드) */}
        <div className="mt-10">
          <TextRow
            label="Recap Blog Title"
            value={draft.recapTitle}
            variant="title"
            placeholder="Write a title"
            onChange={setRecapTitle}
          />
        </div>

        {/* ✅ 모든 day를 한 페이지에 쭉 */}
        <div className="mt-14 space-y-16">
          {draft.days.map((d) => (
            <div
              key={d.id}
              ref={(el) => {
                daySectionRefs.current[d.id] = el;
              }}
              style={{ scrollMarginTop: TOPBAR_OFFSET_PX + 12 }}
            >
              {/* Day 헤더는 RecapBlogDaySection 안에서 "Day X: {title}"로 표시됨 */}

              <RecapBlogDaySection
                dayIndex={d.dayIndex}
                title={d.title}
                mode="edit"
                entries={d.places.map((p) => ({
                  id: p.id,
                  placeKey: p.placeKey,
                  placeName: p.placeName,
                  timeRangeText: p.timeRangeText ?? "",
                  categoryLabel: p.categoryLabel ?? undefined,
                  liked: false,
                  likeCount: 0,
                  commentCount: 0,
                  photos: p.photos ?? [],
                  captions: p.captions ?? [],
                  caption: p.caption ?? "",
                  coordinate: p.coordinate,
                }))}
                onCaptionChange={(entryId, photoIndex, next) =>
                  onCaptionChange(d.id, entryId, photoIndex, next)
                }
                onReplacePhoto={(entryId, photoIndex, file) =>
                  onReplacePhoto(d.id, entryId, photoIndex, file)
                }
                onRemovePhoto={(entryId, photoIndex) =>
                  onRemovePhoto(d.id, entryId, photoIndex)
                }
              />
            </div>
          ))}
        </div>

        {/* Local discard */}
        <div className="mt-12 flex justify-end">
          <button
            type="button"
            className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600"
            onClick={handleDiscardLocal}
          >
            Discard local changes
          </button>
        </div>
      </div>

      {coverGalleryOpen && (
        <PhotoLightbox
          photos={tripPhotos}
          initialIndex={coverInitialIndex}
          title="Trip photos"
          selectLabel="Use as cover"
          onSelect={(photo) => applyCoverFromTripPhoto(photo)}
          onClose={() => setCoverGalleryOpen(false)}
        />
      )}
    </div>
  );
}
