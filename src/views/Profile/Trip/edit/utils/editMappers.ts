import type { RecapEditDraft, DayDraft, ImageValue } from "../types/editTypes";

function getHeroTitle(hero: any) {
  return hero?.title ?? hero?.recapTitle ?? "";
}

function getShared(hero: any): boolean {
  const v = hero?.sharedWithFriends;
  return typeof v === "boolean" ? v : true;
}

function normalizeCaptions(e: any) {
  const photos: string[] = Array.isArray(e?.photos) ? e.photos : [];
  const captionsFromArray: string[] = Array.isArray(e?.captions)
    ? e.captions
    : [];

  // photos 길이에 맞춰 captions를 항상 확보
  const captions = Array.from({ length: photos.length }, (_, i) => {
    const c = captionsFromArray[i];
    if (typeof c === "string") return c;
    if (i === 0 && typeof e?.caption === "string") return e.caption; // 단일 caption 호환
    return "";
  });

  return { photos, captions };
}

export function draftFromPageModel(pageModel: any): RecapEditDraft {
  const hero = pageModel?.hero ?? {};
  const coverImageUrl: string = hero.coverImageUrl ?? "";

  const coverPhoto: ImageValue = coverImageUrl
    ? { kind: "keep", url: coverImageUrl }
    : ({ kind: "remove", reason: "system" } as any);

  const days: DayDraft[] = (pageModel?.days ?? []).map((d: any) => {
    const id = `day-${d.dayIndex ?? 1}`;

    return {
      id,
      dayIndex: Number(d.dayIndex ?? 1),
      title: d.title ?? `Day ${d.dayIndex ?? 1}`,
      dayStory: typeof d?.story === "string" ? d.story : (d?.dayStory ?? ""),

      //  여기서 place에 photos/captions까지 넣어줘야 edit UI에 썸네일이 뜸
      places: (d.entries ?? []).map((e: any) => {
        const { photos, captions } = normalizeCaptions(e);

        return {
          id: e.id,
          placeKey: String(e.placeKey ?? e.digitizedTime ?? e.id ?? ""),
          placeName: e.placeName ?? e.label ?? "",
          originalPlaceName:
            e.originalPlaceName ?? e.placeName ?? e.label ?? "",
          timeRangeText: e.timeRangeText ?? e.time ?? "",
          categoryLabel: e.categoryLabel ?? e.category ?? undefined,
          placeStory:
            typeof e?.placeStory === "string"
              ? e.placeStory
              : typeof e?.story === "string"
                ? e.story
                : "",

          photos,
          captions,

          // 호환용: 첫 번째 캡션을 caption으로도 유지
          caption: captions[0] ?? e.caption ?? "",
          coordinate: e.coordinate,
          visitIndex: e.visitIndex,
          markerRole: e.markerRole,
        };
      }),
    };
  });

  return {
    version: 1,
    updatedAt: Date.now(),
    sharedWithFriends: getShared(hero),
    recapTitle: getHeroTitle(hero),
    coverPhoto,
    days,
  };
}

export function applyDraftToPageModel(pageModel: any, draft: RecapEditDraft) {
  const next = structuredCloneSafe(pageModel);

  // hero
  next.hero = next.hero ?? {};
  next.hero.title = draft.recapTitle;
  next.hero.sharedWithFriends = draft.sharedWithFriends;

  if (draft.coverPhoto.kind === "remove") {
    setHeroCover(next.hero, "");
  } else if (draft.coverPhoto.kind === "keep") {
    setHeroCover(next.hero, draft.coverPhoto.url);
  } else if (draft.coverPhoto.kind === "local") {
    // previewUrl은 세션 blob일 수 있어 pageModel에 박아두기 애매함
    // => 화면 표시용은 edit/view 컴포넌트에서 resolvedCoverUrl로 처리하는 게 안전
  }

  // ✅ days and places
  const dayById = new Map(draft.days.map((d) => [d.id, d]));

  (next.days ?? []).forEach((d: any) => {
    const id = `day-${d.dayIndex ?? 1}`;
    const dd = dayById.get(id);
    if (!dd) return;

    // 네가 “day title은 수정 불가”로 갈 거면,
    // 여기 d.title = dd.title 이 라인만 빼면 됨.
    d.title = dd.title;
    if (typeof dd.dayStory === "string") d.story = dd.dayStory;

    const placeById = new Map(dd.places.map((p: any) => [p.id, p]));

    (d.entries ?? []).forEach((e: any) => {
      const p = placeById.get(e.id);
      if (!p) return;

      // ✅ place story (place-level)
      if (typeof p.placeStory === "string") e.placeStory = p.placeStory;

      // ✅ 캡션 (단일 + 배열 둘 다 반영)
      if (Array.isArray(p.captions)) e.captions = p.captions;
      if (typeof p.caption === "string") e.caption = p.caption;

      // ✅ 사진도 draft에서 바뀌었으면 반영 (replacePhoto가 idb:로 바꾸는 구조)
      if (Array.isArray(p.photos)) e.photos = p.photos;

      // (옵션) timeRangeText/categoryLabel도 draft에서 바꾸는 편집이 있으면 여기도 반영 가능
      // e.timeRangeText = p.timeRangeText ?? e.timeRangeText;
      // e.categoryLabel = p.categoryLabel ?? e.categoryLabel;
    });
  });

  return next;
}

function setHeroCover(hero: any, url: string) {
  if ("coverImageUrl" in hero) hero.coverImageUrl = url;
  else if ("coverImage" in hero) hero.coverImage = url;
  else if ("coverUrl" in hero) hero.coverUrl = url;
  else if ("imageUrl" in hero) hero.imageUrl = url;
  else hero.coverImageUrl = url;
}

function structuredCloneSafe<T>(obj: T): T {
  try {
    // @ts-ignore
    if (typeof structuredClone === "function") return structuredClone(obj);
  } catch {}
  return JSON.parse(JSON.stringify(obj));
}
