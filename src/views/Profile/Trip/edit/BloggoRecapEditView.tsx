"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/api/client";
import {
  updateTripCoverPhoto,
  updateTripTitle,
  updateDayStory,
  type TripRecapResponse,
} from "@/api/trips";
import { mapTripRecapToPageModel } from "@/views/Profile/Trip/utils/mapTripRecap";

import RecapBlogTopBar from "@/views/Profile/Trip/section/RecapBlogTopBar";
import type { DayTab } from "@/views/Profile/Trip/component/RecapDayTabs";

import type { RecapEditDraft, PlaceDraft } from "./types/editTypes";
import { draftFromPageModel } from "./utils/editMappers";
import {
  updatePlaceVisitHistoryStory,
  updatePlaceInfo,
  updatePlaceStatus,
} from "@/api/user";

import ImageFieldEditor from "./components/ImageFieldEditor";
import TextRow from "./components/TextRow";
import { RecapBlogDaySection } from "@/views/Profile/Trip/component/RecapBlogPlace";
import type { RecapEntry } from "@/views/Profile/Trip/component/RecapBlogPlace";
import PhotoLightbox from "@/components/ui/PhotoLightbox";
import PlaceMapEditorModal from "@/views/Profile/Trip/component/PlaceMapEditorModal";
import type { PoiInfo } from "@/views/Profile/travel-stats/components/MapBoxMap";
import RestoreHiddenPlacesModal from "./components/RestoreHiddenPlacesModal";

export default function BloggoRecapEditView({
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
  const [coverGalleryOpen, setCoverGalleryOpen] = useState(false);
  // Keep the loading screen visible while navigating away after save,
  // to avoid a brief overlap/flicker between edit/view pages.
  const didNavigateAwayRef = useRef(false);
  // draft
  const [draft, setDraft] = useState<RecapEditDraft | null>(null);
  const draftRef = useRef<RecapEditDraft | null>(null);
  // Place map editor modal
  const [editorOpen, setEditorOpen] = useState<{
    entryId: string;
    dayId: string;
  } | null>(null);

  // Restore hidden places modal
  const [restoreDayId, setRestoreDayId] = useState<string | null>(null);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // Baseline captions keyed by placeKey -> photoUrl -> caption.
  // We diff against this on "Update" so we only call the caption API for changed photos.
  const baselineCaptionsRef = useRef<Map<string, Map<string, string>> | null>(
    null,
  );
  // Baseline place stories keyed by placeKey -> story.
  const baselinePlaceStoriesRef = useRef<Map<string, string> | null>(null);
  const baselinePlaceMetaRef = useRef<Map<
    string,
    { name: string; status: string }
  > | null>(null);
  const baselineDayStoriesRef = useRef<Map<string, string>>(new Map());
  const baselineInitializedRef = useRef(false);
  const baselineDraftFingerprintRef = useRef<string | null>(null);
  const baselineTitleRef = useRef<string | null>(null);

  // day scroll refs
  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const entryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Tracks the last individually-restored place so we can scroll to it on modal close
  const pendingScrollToPlaceIdRef = useRef<string | null>(null);

  const draftFingerprint = (d: RecapEditDraft) => {
    // Exclude `updatedAt` (it changes on every keystroke), but include actual editable fields.
    // Use JSON to keep it simple and stable.
    return JSON.stringify({
      sharedWithFriends: d.sharedWithFriends,
      recapTitle: d.recapTitle,
      coverPhoto: d.coverPhoto,
      days: (d.days ?? []).map((day) => ({
        id: day.id,
        dayIndex: day.dayIndex,
        title: day.title,
        dayStory: day.dayStory ?? "",
        places: (day.places ?? []).map((p) => ({
          id: p.id,
          placeKey: p.placeKey,
          // Include photos/captions so changing them toggles "dirty".
          photos: p.photos ?? [],
          captions: (p as any).captions ?? [],
          caption: (p as any).caption ?? "",
          placeStory: p.placeStory ?? "",
          // Include these too, in case they become editable later.
          placeName: p.placeName,
          status: p.status ?? "saved",
          timeRangeText: p.timeRangeText ?? "",
          categoryLabel: p.categoryLabel ?? "",
        })),
      })),
    });
  };

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

  const buildBaselinePlaceStories = (d: RecapEditDraft) => {
    const placeToStory = new Map<string, string>();
    for (const day of d.days ?? []) {
      for (const place of day.places ?? []) {
        const placeKey = place.placeKey;
        if (!placeKey) continue;
        placeToStory.set(placeKey, place.placeStory ?? "");
      }
    }
    return placeToStory;
  };

  const buildBaselinePlaceMeta = (d: RecapEditDraft) => {
    const metaMap = new Map<string, { name: string; status: string }>();
    for (const day of d.days ?? []) {
      for (const place of day.places ?? []) {
        const placeKey = place.placeKey;
        if (!placeKey) continue;
        metaMap.set(placeKey, {
          name: place.placeName,
          status: place.status ?? "saved",
        });
      }
    }
    return metaMap;
  };

  const buildBaselineDayStories = (d: RecapEditDraft) => {
    const map = new Map<string, string>();
    for (const day of d.days ?? []) {
      map.set(day.id, day.dayStory ?? "");
    }
    return map;
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
          { cache: "no-store" },
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

    const base = draftFromPageModel(pageModel);
    setDraft(base);
  }, [pageModel, userId, tripId]);

  /** 2.1) auto-scroll to entry if requested */
  const searchParams = useSearchParams();
  const scrollToTarget = searchParams.get("scrollTo");
  const scrolledToTargetRef = useRef(false);

  useEffect(() => {
    if (!scrollToTarget || scrolledToTargetRef.current || loading) return;
    const el = entryRefs.current[scrollToTarget];
    if (!el) return;

    scrolledToTargetRef.current = true;
    const y =
      el.getBoundingClientRect().top + window.scrollY - TOPBAR_OFFSET_PX - 12;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, [scrollToTarget, loading, draft]);

  // Initialize baseline captions once (first time draft becomes available).
  useEffect(() => {
    if (!draft) return;
    if (baselineInitializedRef.current) return;
    baselineCaptionsRef.current = buildBaselineCaptions(draft);
    baselinePlaceStoriesRef.current = buildBaselinePlaceStories(draft);
    baselinePlaceMetaRef.current = buildBaselinePlaceMeta(draft);
    baselineDayStoriesRef.current = buildBaselineDayStories(draft);
    baselineDraftFingerprintRef.current = draftFingerprint(draft);
    baselineTitleRef.current = draft.recapTitle;
    baselineInitializedRef.current = true;
  }, [draft]);

  const hasLocalChanges = useMemo(() => {
    if (!draft) return false;
    const baseline = baselineDraftFingerprintRef.current;
    if (!baseline) return false;
    return draftFingerprint(draft) !== baseline;
  }, [draft]);

  /** 3) tabs / breadcrumb */
  const dayTabs: DayTab[] = useMemo(() => {
    return (
      draft?.days.map((d) => ({ id: d.id, label: `Day ${d.dayIndex}` })) ?? []
    );
  }, [draft?.days]);

  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  // Keep activeDayId in sync when tabs first load
  useEffect(() => {
    if (!activeDayId && dayTabs.length > 0) {
      setActiveDayId(dayTabs[0].id);
    }
  }, [dayTabs, activeDayId]);

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

    const blogKey = Number(tripId);
    const baselineTitle = baselineTitleRef.current;
    const titleChanged =
      baselineTitle != null && draft.recapTitle !== baselineTitle;

    // Diff captions by photo URI (not by index) so index shifts don't trigger "update all".
    const baseline = baselineCaptionsRef.current ?? new Map();
    const baselinePlaceStories = baselinePlaceStoriesRef.current ?? new Map();
    const updates: Array<{
      placeKey: string;
      photoIndex: number;
      storyText: string;
    }> = [];
    const placeStoryUpdates: Array<{ placeKey: string; storyText: string }> =
      [];
    const dayStoryUpdates: Array<{ dateKey: number; story: string }> = [];
    const baselineDayStories = baselineDayStoriesRef.current ?? new Map();
    for (const day of draft.days ?? []) {
      const prev = baselineDayStories.get(day.id) ?? "";
      const next = day.dayStory ?? "";
      if (next !== prev) {
        dayStoryUpdates.push({
          dateKey: day.dayIndex - 1,
          story: next,
        });
      }
    }
    const placeMetaUpdates: Array<{
      placeKey: string;
      name?: string;
      status?: string;
    }> = [];

    for (const day of draft.days ?? []) {
      for (const place of day.places ?? []) {
        const placeKey = place.placeKey;
        if (!placeKey) continue;

        const nextPlaceStory = place.placeStory ?? "";
        const prevPlaceStory = baselinePlaceStories.get(placeKey) ?? "";
        if (nextPlaceStory !== prevPlaceStory) {
          placeStoryUpdates.push({ placeKey, storyText: nextPlaceStory });
        }

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

        const prevMeta = (baselinePlaceMetaRef.current ?? new Map()).get(
          placeKey,
        );
        const nextName = place.placeName;
        const nextStatus = place.status ?? "saved";

        if (
          prevMeta &&
          (nextName !== prevMeta.name || nextStatus !== prevMeta.status)
        ) {
          placeMetaUpdates.push({
            placeKey,
            name: nextName !== prevMeta.name ? nextName : undefined,
            status: nextStatus !== prevMeta.status ? nextStatus : undefined,
          });
        }
      }
    }

    setLoading(true);
    setError(null);
    try {
      const tasks: Array<{
        kind:
          | "title"
          | "caption"
          | "placeStory"
          | "placeMeta"
          | "placeStatus"
          | "dayStory";
        promise: Promise<any>;
      }> = [];

      if (titleChanged && Number.isFinite(blogKey)) {
        tasks.push({
          kind: "title",
          promise: updateTripTitle({ blogKey, title: draft.recapTitle }),
        });
      }

      for (const u of updates) {
        tasks.push({
          kind: "caption",
          promise: updatePlaceVisitHistoryStory({
            placeKey: u.placeKey,
            photoIndex: u.photoIndex,
            storyText: u.storyText,
            photoIndexType: "filtered",
          }),
        });
      }

      for (const u of placeStoryUpdates) {
        tasks.push({
          kind: "placeStory",
          // Place-level story: omit photoIndex (or null/-1) to target the place, not a photo.
          promise: updatePlaceVisitHistoryStory({
            placeKey: u.placeKey,
            storyText: u.storyText,
            photoIndexType: "filtered",
          }),
        });
      }

      for (const u of dayStoryUpdates) {
        tasks.push({
          kind: "dayStory",
          promise: updateDayStory({
            blogKey,
            dateKey: u.dateKey,
            story: u.story,
          }),
        });
      }

      for (const u of placeMetaUpdates) {
        if (u.name) {
          tasks.push({
            kind: "placeMeta",
            promise: updatePlaceInfo({
              placeKey: u.placeKey,
              placeName: u.name,
              // Backend might require existing coords if not changed, but we only send what's needed or
              // we can pull them from the draft.
              coordinate: draft.days
                .flatMap((d) => d.places)
                .find((p) => p.placeKey === u.placeKey)?.coordinate ?? {
                latitude: 0,
                longitude: 0,
              },
            }),
          });
        }
        if (u.status) {
          tasks.push({
            kind: "placeStatus",
            promise: updatePlaceStatus({
              placeKey: u.placeKey,
              status: u.status,
            }),
          });
        }
      }

      const results = await Promise.allSettled(tasks.map((t) => t.promise));

      const failedKinds = tasks
        .map((t, i) => ({
          kind: t.kind,
          ok: results[i].status === "fulfilled",
        }))
        .filter((x) => !x.ok)
        .map((x) => x.kind);

      if (failedKinds.length > 0) {
        const titleFailed = failedKinds.includes("title");
        const dayStoryFailedCount = failedKinds.filter(
          (k) => k === "dayStory",
        ).length;
        const captionFailedCount = failedKinds.filter(
          (k) => k === "caption",
        ).length;
        const placeStoryFailedCount = failedKinds.filter(
          (k) => k === "placeStory",
        ).length;

        if (
          titleFailed &&
          (dayStoryFailedCount > 0 ||
            captionFailedCount > 0 ||
            placeStoryFailedCount > 0)
        ) {
          throw new Error(
            `Failed to update title and ${dayStoryFailedCount} day story(ies), ${captionFailedCount} caption(s), ${placeStoryFailedCount} place story(ies).`,
          );
        }
        if (titleFailed) {
          throw new Error("Failed to update title.");
        }
        if (dayStoryFailedCount > 0) {
          throw new Error(
            `Failed to update ${dayStoryFailedCount} day story(ies).`,
          );
        }
        if (captionFailedCount > 0 && placeStoryFailedCount > 0) {
          throw new Error(
            `Failed to update ${captionFailedCount} caption(s) and ${placeStoryFailedCount} place story(ies).`,
          );
        }
        if (captionFailedCount > 0) {
          throw new Error(`Failed to update ${captionFailedCount} caption(s).`);
        }
        throw new Error(
          `Failed to update ${placeStoryFailedCount} place story(ies).`,
        );
      }

      // Refresh baseline with the saved captions so repeated "Update" doesn't resend.
      baselineCaptionsRef.current = buildBaselineCaptions(draft);
      baselinePlaceStoriesRef.current = buildBaselinePlaceStories(draft);
      baselinePlaceMetaRef.current = buildBaselinePlaceMeta(draft);
      baselineDayStoriesRef.current = buildBaselineDayStories(draft);
      baselineDraftFingerprintRef.current = draftFingerprint(draft);
      baselineTitleRef.current = draft.recapTitle;

      didNavigateAwayRef.current = true;
      router.replace(
        `/bloggo/trip/${encodeURIComponent(userId)}/${encodeURIComponent(tripId)}`,
      );
    } catch (e: any) {
      setError(e?.message ?? "Failed to update recap");
    } finally {
      if (!didNavigateAwayRef.current) setLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleDiscardLocal = () => {
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

  const setDayStory = (dayId: string, story: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updatedAt: Date.now(),
        days: prev.days.map((d) =>
          d.id === dayId ? { ...d, dayStory: story } : d,
        ),
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

  const onPlaceStoryChange = (dayId: string, placeId: string, next: string) => {
    updatePlaceInDay(dayId, placeId, (p) => {
      return { ...p, placeStory: next };
    });
  };

  const onPlaceNameChange = (dayId: string, placeId: string, next: string) => {
    updatePlaceInDay(dayId, placeId, (p) => {
      return { ...p, placeName: next };
    });
  };

  const onTogglePlaceHide = (dayId: string, placeId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updatedAt: Date.now(),
        days: prev.days.map((d) => {
          if (d.id !== dayId) return d;

          const index = d.places.findIndex((p) => p.id === placeId);
          if (index === -1) return d;

          const place = d.places[index];
          const isCurrentlyHidden = place.status === "hidden";

          const newPlaces = [...d.places];

          if (!isCurrentlyHidden) {
            // Hiding
            let beforeId: string | undefined;
            for (let i = index - 1; i >= 0; i--) {
              if (d.places[i].status !== "hidden") {
                beforeId = d.places[i].id;
                break;
              }
            }
            let afterId: string | undefined;
            for (let i = index + 1; i < d.places.length; i++) {
              if (d.places[i].status !== "hidden") {
                afterId = d.places[i].id;
                break;
              }
            }

            newPlaces[index] = {
              ...place,
              status: "hidden",
              originalIndex: index,
              isHidden: true,
              hiddenAt: Date.now(),
              anchorBeforeId: beforeId,
              anchorAfterId: afterId,
            };
            return { ...d, places: newPlaces };
          } else {
            // Restoring
            const toRestore = {
              ...place,
              status: "saved",
              isHidden: false,
              hiddenAt: undefined,
            };

            newPlaces.splice(index, 1);

            let insertIndex = newPlaces.length;
            const bIdx = toRestore.anchorBeforeId
              ? newPlaces.findIndex(
                  (p) =>
                    p.id === toRestore.anchorBeforeId && p.status !== "hidden",
                )
              : -1;
            const aIdx = toRestore.anchorAfterId
              ? newPlaces.findIndex(
                  (p) =>
                    p.id === toRestore.anchorAfterId && p.status !== "hidden",
                )
              : -1;

            if (bIdx !== -1) {
              insertIndex = bIdx + 1;
            } else if (aIdx !== -1) {
              insertIndex = aIdx;
            } else if (toRestore.originalIndex !== undefined) {
              insertIndex = Math.min(toRestore.originalIndex, newPlaces.length);
            }

            newPlaces.splice(insertIndex, 0, toRestore);
            return { ...d, places: newPlaces };
          }
        }),
      };
    });
  };

  const onHidePhoto = (dayId: string, placeId: string, photoIndex: number) => {
    updatePlaceInDay(dayId, placeId, (p) => {
      const hidden = Array.from(
        new Set([...(p.hiddenPhotoIndices ?? []), photoIndex]),
      );
      return { ...p, hiddenPhotoIndices: hidden } as any;
    });
  };

  const onRestorePhoto = (
    dayId: string,
    placeId: string,
    originalPhotoIndex: number,
  ) => {
    updatePlaceInDay(dayId, placeId, (p) => {
      const hidden = (p.hiddenPhotoIndices ?? []).filter(
        (i) => i !== originalPhotoIndex,
      );
      return { ...p, hiddenPhotoIndices: hidden } as any;
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

  /** Flat list of all RecapEntry-shaped objects across all days (for map context) */
  const allEntries = useMemo((): RecapEntry[] => {
    if (!draft) return [];
    return draft.days.flatMap((d) =>
      d.places.map(
        (p) =>
          ({
            id: p.id,
            placeKey: p.placeKey,
            placeName: p.placeName,
            originalPlaceName: p.originalPlaceName,
            timeRangeText: p.timeRangeText ?? "",
            categoryLabel: p.categoryLabel ?? undefined,
            liked: false,
            likeCount: 0,
            commentCount: 0,
            placeStory: p.placeStory ?? "",
            photos: p.photos ?? [],
            captions: (p as any).captions ?? [],
            caption: (p as any).caption ?? "",
            coordinate: p.coordinate,
            markerRole: (p as any).markerRole,
            visitIndex: (p as any).visitIndex,
            status: p.status,
          }) as RecapEntry,
      ),
    );
  }, [draft]);

  /** Active entry for the editor modal */
  const editorEntry = useMemo((): RecapEntry | null => {
    if (!editorOpen) return null;
    return allEntries.find((e) => e.id === editorOpen.entryId) ?? null;
  }, [editorOpen, allEntries]);

  /** POI confirm from the map editor modal */
  const handlePoiConfirmFromModal = async (poi: PoiInfo, entryId: string) => {
    if (!editorOpen || !draft) return;
    const { dayId } = editorOpen;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${poi.name} ${poi.lat},${poi.lng}`)}`;

    // 1) Update draft optimistically — preserve original GPS coordinate, update name only
    updatePlaceInDay(
      dayId,
      entryId,
      (p) =>
        ({
          ...p,
          placeName: poi.name,
          // Keep the original GPS coordinate — do NOT move it to the POI center
          externalUrl: mapsUrl,
        }) as any,
    );

    // 2) Persist to server — send original coordinate, not POI center
    const place = draft.days
      .find((d) => d.id === dayId)
      ?.places.find((p) => p.id === entryId);
    const placeKey = place?.placeKey;
    if (placeKey) {
      try {
        await updatePlaceInfo({
          placeKey,
          placeName: poi.name,
          coordinate: {
            latitude: place.coordinate?.latitude ?? 0,
            longitude: place.coordinate?.longitude ?? 0,
          },
          categories: poi.category ? [poi.category] : undefined,
          externalUrl: mapsUrl,
        });
      } catch (err) {
        console.error("[PlaceMapEditor] POI update failed", err);
      }
    }
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
    <div className="min-h-screen bg-slate-50">
      <RecapBlogTopBar
        mode="edit"
        brand="bloggo"
        title="Recap Blog"
        dayTabs={dayTabs}
        activeDayId={activeDayId ?? dayTabs[0]?.id ?? "day-1"}
        onDayChange={(id: string) => {
          setActiveDayId(id);
          scrollToDay(id);
        }}
        onGoBack={() => window.history.back()}
        onCloseEdit={handleClose}
        onDiscardLocal={handleDiscardLocal}
        discardDisabled={!hasLocalChanges || loading}
        onUpdate={handleUpdate}
        updateDisabled={!hasLocalChanges || loading}
        className="sticky top-[64px] z-50 border-b border-black/10"
      />

      {/* Edit mode banner */}
      <div className="sticky top-[132px] z-[45] flex items-center justify-center gap-2 bg-sky-500/10 border-b border-sky-500/20 px-4 py-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-[12px] font-bold text-sky-700">
          ✏️ Edit Mode — make sure to update your changes
        </span>
      </div>

      {/* ── Hero Zone: Cover + Title ─────────────────────────── */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-6 pb-2">
        {/* Cover photo — full-width hero */}
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
          }}
        />

        {/* Blog title — transparent, centered, hero-sized */}
        <div className="mt-6 pb-6 border-b border-slate-200">
          <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-3 text-center">
            Blog Title
          </p>
          <TextRow
            value={draft.recapTitle}
            variant="title"
            placeholder="Untitled trip..."
            onChange={setRecapTitle}
          />
        </div>

        {/* ── Settings row (compact) ───────────────────────────── */}
        <div className="hidden items-center justify-end gap-4 py-3">
          <span className="text-sm font-semibold text-slate-500">
            Shared with friends
          </span>
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
      </div>

      {/* ── Itinerary Content ────────────────────────────────── */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pb-24">
        <div className="mt-10 space-y-20">
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
                story={d.dayStory ?? ""}
                mode="edit"
                onDayStoryChange={(next) => setDayStory(d.id, next)}
                hiddenCount={
                  d.places.filter((p) => p.status === "hidden").length
                }
                onOpenHiddenPlaces={() => setRestoreDayId(d.id)}
                entries={d.places
                  .filter((p) => p.status !== "hidden")
                  .map((p) => {
                    const hiddenIndices = p.hiddenPhotoIndices ?? [];
                    const hiddenPhotos = hiddenIndices
                      .map((origIdx) => ({
                        url: p.photos?.[origIdx] ?? "",
                        caption:
                          p.captions?.[origIdx] ??
                          (origIdx === 0 ? (p.caption ?? "") : ""),
                        originalIndex: origIdx,
                      }))
                      .filter((h) => !!h.url);
                    return {
                      id: p.id,
                      placeKey: p.placeKey,
                      placeName: p.placeName,
                      originalPlaceName: p.originalPlaceName,
                      timeRangeText: p.timeRangeText ?? "",
                      categoryLabel: p.categoryLabel ?? undefined,
                      liked: false,
                      likeCount: 0,
                      commentCount: 0,
                      placeStory: p.placeStory ?? "",
                      // Visible photos only (those not hidden)
                      photos: (p.photos ?? []).filter(
                        (_, i) => !hiddenIndices.includes(i),
                      ),
                      captions: (p.captions ?? []).filter(
                        (_, i) => !hiddenIndices.includes(i),
                      ),
                      caption: p.caption ?? "",
                      coordinate: p.coordinate,
                      status: p.status,
                      hiddenPhotos,
                    };
                  })}
                onPlaceStoryChange={(entryId, next) =>
                  onPlaceStoryChange(d.id, entryId, next)
                }
                onPlaceNameChange={(pid, next) =>
                  onPlaceNameChange(d.id, pid, next)
                }
                onTogglePlaceHide={(pid) => onTogglePlaceHide(d.id, pid)}
                onCaptionChange={(entryId, photoIndex, next) =>
                  onCaptionChange(d.id, entryId, photoIndex, next)
                }
                onRemovePhoto={(entryId, photoIndex) =>
                  onRemovePhoto(d.id, entryId, photoIndex)
                }
                onHidePhoto={(entryId, photoIndex) =>
                  onHidePhoto(d.id, entryId, photoIndex)
                }
                onRestorePhoto={(entryId, originalPhotoIndex) =>
                  onRestorePhoto(d.id, entryId, originalPhotoIndex)
                }
                onOpenPlaceMapEditor={(entryId) =>
                  setEditorOpen({ entryId, dayId: d.id })
                }
                onEntryMount={(entryId, el) => {
                  entryRefs.current[entryId] = el;
                }}
              />
            </div>
          ))}
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

      {/* Place map editor modal */}
      {editorOpen && editorEntry && (
        <PlaceMapEditorModal
          entry={editorEntry}
          allEntries={allEntries}
          onPlaceNameChange={(next) =>
            onPlaceNameChange(editorOpen.dayId, editorOpen.entryId, next)
          }
          onPoiConfirm={handlePoiConfirmFromModal}
          onClose={() => setEditorOpen(null)}
        />
      )}

      {/* Restore hidden places modal */}
      {restoreDayId && draft?.days.find((d) => d.id === restoreDayId) && (
        <RestoreHiddenPlacesModal
          hiddenPlaces={draft.days
            .find((d) => d.id === restoreDayId)!
            .places.filter((p) => p.status === "hidden")}
          onRestorePlace={(placeId) => {
            pendingScrollToPlaceIdRef.current = placeId;
            onTogglePlaceHide(restoreDayId, placeId);
          }}
          onRestoreAll={() => {
            pendingScrollToPlaceIdRef.current = null;
            const hidden = draft.days
              .find((d) => d.id === restoreDayId)!
              .places.filter((p) => p.status === "hidden");
            hidden.forEach((p) => onTogglePlaceHide(restoreDayId, p.id));
            setRestoreDayId(null);
          }}
          onClose={() => {
            const targetId = pendingScrollToPlaceIdRef.current;
            pendingScrollToPlaceIdRef.current = null;
            setRestoreDayId(null);
            if (targetId) {
              requestAnimationFrame(() => {
                const el = entryRefs.current[targetId];
                if (!el) return;
                const y =
                  el.getBoundingClientRect().top +
                  window.scrollY -
                  TOPBAR_OFFSET_PX -
                  12;
                window.scrollTo({ top: y, behavior: "smooth" });
              });
            }
          }}
        />
      )}
    </div>
  );
}
