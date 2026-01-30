"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import PlaceCaptionList from "./components/PlaceCaptionList";
import Image from "next/image";
import deleteIcon from "@/assets/icons/delete.svg";

export default function TripRecapEditView({
  userId,
  tripId,
}: {
  userId: string;
  tripId: string;
}) {
  const router = useRouter();

  // -----------------------------
  // 1) Fetch recap data (server -> pageModel)
  // -----------------------------
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recapData, setRecapData] = useState<TripRecapResponse | null>(null);

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

  // -----------------------------
  // 2) Local draft state (UI-first edit mode)
  // Priority:
  //  - Use localStorage draft if exists
  //  - Otherwise create draft from the fetched page model
  // -----------------------------
  const [draft, setDraft] = useState<RecapEditDraft | null>(null);
  const [activeDayId, setActiveDayId] = useState("day-1");

  useEffect(() => {
    if (!pageModel) return;

    const saved = loadDraft(userId, tripId);
    const heroCover = pageModel.hero?.coverImageUrl ?? "";
    if (saved) {
      const repaired: RecapEditDraft =
        saved.coverPhoto?.kind === "remove" && heroCover
          ? { ...saved, coverPhoto: { kind: "keep", url: heroCover } }
          : saved;
      setDraft(repaired);

      // Ensure activeDayId is valid for the saved draft
      const firstDayId = repaired.days?.[0]?.id ?? "day-1";
      const nextActive = repaired.days.some((d) => d.id === activeDayId)
        ? activeDayId
        : firstDayId;

      setActiveDayId(nextActive);
      return;
    }

    const base = draftFromPageModel(pageModel);
    setDraft(base);
    setActiveDayId(base.days?.[0]?.id ?? "day-1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageModel, userId, tripId]);

  // -----------------------------
  // 3) Derived UI state
  // -----------------------------
  const activeDay = useMemo(() => {
    if (!draft) return null;
    return (
      draft.days.find((d) => d.id === activeDayId) ?? draft.days[0] ?? null
    );
  }, [draft, activeDayId]);

  const breadcrumbItems: Crumb[] = useMemo(() => {
    const title = draft?.recapTitle || pageModel?.hero?.title || "Trip";

    return [
      { label: "Recap Blogs", href: "/profile/recap-blog" },
      { label: "Map", onClick: () => window.history.go(-2) },
      { label: `(${title})`, onClick: () => window.history.back() },
    ];
  }, [draft?.recapTitle, pageModel?.hero?.title]);

  const dayTabs: DayTab[] = useMemo(() => {
    return (
      draft?.days.map((d) => ({
        id: d.id,
        label: `Day ${d.dayIndex}`,
      })) ?? []
    );
  }, [draft?.days]);

  // When tabs are ready, make sure activeDayId exists
  useEffect(() => {
    if (!dayTabs.length) return;
    if (!dayTabs.some((t) => t.id === activeDayId)) {
      setActiveDayId(dayTabs[0].id);
    }
  }, [dayTabs, activeDayId]);

  const handleDayChange = (id: string) => {
    setActiveDayId(id);
  };

  useEffect(() => {
    if (!pageModel) return;
    console.log("[hero keys]", Object.keys(pageModel.hero || {}));
    console.log("[hero coverImageUrl]", pageModel.hero?.coverImageUrl);
    console.log("[hero coverImageUrl raw hero]", pageModel.hero);
  }, [pageModel]);

  useEffect(() => {
    if (!draft) return;
    console.log("[draft]", draft);
    console.log("[draft.coverPhoto.kind]", draft.coverPhoto?.kind);
    console.log("[draft.coverPhoto.url]", (draft.coverPhoto as any)?.url);
    console.log(
      "[draft.coverPhoto.previewUrl]",
      (draft.coverPhoto as any)?.previewUrl,
    );
  }, [draft]);

  // -----------------------------
  // 4) Draft update helpers
  // -----------------------------
  const setActiveDayTitle = (title: string) => {
    if (!draft) return;

    setDraft({
      ...draft,
      updatedAt: Date.now(),
      days: draft.days.map((d) => (d.id === activeDayId ? { ...d, title } : d)),
    });
  };

  const setActiveDayPlaces = (places: PlaceDraft[]) => {
    if (!draft) return;

    setDraft({
      ...draft,
      updatedAt: Date.now(),
      days: draft.days.map((d) =>
        d.id === activeDayId ? { ...d, places } : d,
      ),
    });
  };

  // -----------------------------
  // 5) Actions (local-only persistence)
  // Update: save draft to localStorage then go back
  // Close: go back without saving
  // Discard: clear local draft then go back
  // -----------------------------
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

  // -----------------------------
  // 6) Render states
  // -----------------------------
  if (loading) return <div className="p-6">Loading…</div>;

  if (error) {
    return (
      <div className="p-6">
        <div className="font-semibold">Failed to load recap</div>
        <div className="mt-2 text-sm opacity-70">{error}</div>
      </div>
    );
  }

  if (!pageModel || !draft || !activeDay)
    return <div className="p-6">No data</div>;

  // -----------------------------
  // 7) UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-white">
      {/* TopBar in edit mode:
          - uses day tabs to switch active day
          - shows Close / Update instead of Edit / Share */}
      <RecapBlogTopBar
        mode="edit"
        title="Recap Blog"
        breadcrumbItems={breadcrumbItems}
        dayTabs={dayTabs}
        activeDayId={activeDayId}
        onDayChange={handleDayChange}
        onGoBack={() => window.history.back()}
        onCloseEdit={handleClose}
        onUpdate={handleUpdate}
        className="sticky top-0 z-50 border-b border-black/10"
      />

      <div className="mx-auto max-w-[1200px] p-6">
        <div className="flex justify-between">
          <div className="text-3xl font-bold">Recap Blog Settings</div>
          <div className="flex items-center text-[var(--color-warning)]">
            <div className="text-2xl font-bold ">Remove Blog</div>
            <button className="ml-3">
              <Image src={deleteIcon} alt="Delete" width={32} height={32} />
            </button>
          </div>
        </div>

        {/* Shared toggle */}
        <div className="mt-6 flex gap-10 pl-0 p-4">
          <div>
            <div className="font-bold text-2xl">Shared with friends</div>
          </div>

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
        <div className="mt-6">
          <div className="mb-2 text-sm font-medium">Cover Photo</div>
          <ImageFieldEditor
            value={draft.coverPhoto}
            onChange={(coverPhoto) =>
              setDraft({ ...draft, updatedAt: Date.now(), coverPhoto })
            }
          />
        </div>

        {/* Recap title */}
        <div className="mt-6">
          <TextRow
            label="Recap Blog Title"
            value={draft.recapTitle}
            onChange={(v) =>
              setDraft({ ...draft, updatedAt: Date.now(), recapTitle: v })
            }
          />
        </div>

        {/* Day settings */}
        <div className="mt-10 rounded-3xl border border-black/10 p-4">
          <div className="text-lg font-semibold">
            Day {activeDay.dayIndex}: Settings
          </div>

          <div className="mt-4">
            <TextRow
              label="Day Title"
              value={activeDay.title}
              onChange={setActiveDayTitle}
            />
          </div>

          <PlaceCaptionList
            places={activeDay.places}
            onChange={setActiveDayPlaces}
          />
        </div>

        {/* Local discard */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="rounded-full bg-red-500/10 px-4 py-2 text-sm text-red-600"
            onClick={handleDiscardLocal}
          >
            Discard local changes
          </button>
        </div>
      </div>
    </div>
  );
}
