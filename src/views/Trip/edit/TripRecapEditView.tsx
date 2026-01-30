"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/api/client";
import type { TripRecapResponse } from "@/api/trips";
import { mapTripRecapToPageModel } from "@/views/Trip/utils/mapTripRecap";

import RecapBlogTopBar from "@/views/Trip/section/RecapBlogTopBar";
import type { Crumb } from "@/views/Trip/component/RecapBlogCrumbBread";
import type { DayTab } from "@/views/Trip/component/RecapDayTabs";

import type { RecapEditDraft, PlaceDraft } from "./types/editTypes";
import { draftFromPageModel } from "./utils/editMappers";
import { loadDraft, saveDraft, clearDraft } from "./utils/draftStorage";

import ImageFieldEditor from "./components/ImageFieldEditor";
import TextRow from "./components/TextRow";

import {
  RecapBlogDaySection,
  type RecapEntry,
} from "@/views/Trip/component/RecapBlogPlace";
import { idbPutBlob, makeImageKey } from "@/views/Trip/edit/utils/imageIdb";

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
  // draft
  const [draft, setDraft] = useState<RecapEditDraft | null>(null);

  // day scroll refs
  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  /** 3) tabs / breadcrumb */
  const dayTabs: DayTab[] = useMemo(() => {
    return (
      draft?.days.map((d) => ({ id: d.id, label: `Day ${d.dayIndex}` })) ?? []
    );
  }, [draft?.days]);

  const breadcrumbItems: Crumb[] = useMemo(() => {
    const title = draft?.recapTitle || pageModel?.hero?.title || "Trip";
    return [
      { label: "Recap Blogs", href: "/profile/recap-blog" },
      { label: "Map", onClick: () => window.history.go(-2) },
      { label: `(${title})`, onClick: () => window.history.back() },
    ];
  }, [draft?.recapTitle, pageModel?.hero?.title]);

  /** 4) scroll to day */
  const scrollToDay = (dayId: string) => {
    const el = daySectionRefs.current[dayId];
    if (!el) return;

    const y =
      el.getBoundingClientRect().top + window.scrollY - TOPBAR_OFFSET_PX - 12;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  /** 5) save/close/discard */
  const handleUpdate = () => {
    if (!draft) return;
    saveDraft(userId, tripId, { ...draft, updatedAt: Date.now() });
    router.back();
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
        breadcrumbItems={breadcrumbItems}
        dayTabs={dayTabs}
        activeDayId={dayTabs[0]?.id ?? "day-1"} // edit에선 단순 표시용
        onDayChange={(id) => scrollToDay(id)}
        onGoBack={() => window.history.back()}
        onCloseEdit={handleClose}
        onUpdate={handleUpdate}
        className="sticky top-0 z-50 border-b border-black/10"
      />

      <div className="mx-auto max-w-[1200px] p-6">
        {/* Settings header */}
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold">Recap Blog Settings</div>
        </div>

        {/* Cover photo */}
        <div className="mt-8">
          <div className="mb-3 text-2xl font-semibold">Cover Photo</div>
          <ImageFieldEditor
            value={draft.coverPhoto}
            userId={userId}
            tripId={tripId}
            onChange={(coverPhoto) =>
              setDraft({ ...draft, updatedAt: Date.now(), coverPhoto })
            }
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
    </div>
  );
}
