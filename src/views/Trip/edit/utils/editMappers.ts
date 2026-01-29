import type { RecapEditDraft, DayDraft, ImageValue } from "../types/editTypes";

function getHeroTitle(hero: any) {
  return hero?.title ?? hero?.recapTitle ?? "";
}

function getHeroCoverUrl(hero: any): string {
  return (
    hero?.coverImage ??
    hero?.coverUrl ??
    hero?.imageUrl ??
    hero?.topImage ??
    hero?.heroImage ??
    ""
  );
}

function getShared(hero: any): boolean {
  // default to true
  const v = hero?.sharedWithFriends;
  return typeof v === "boolean" ? v : true;
}

export function draftFromPageModel(pageModel: any): RecapEditDraft {
  const hero = pageModel?.hero ?? {};
  const coverUrl = getHeroCoverUrl(hero);
  const coverPhoto: ImageValue = coverUrl
    ? { kind: "keep", url: coverUrl }
    : { kind: "remove" };

  const days: DayDraft[] = (pageModel?.days ?? []).map((d: any) => {
    const id = `day-${d.dayIndex ?? 1}`;
    return {
      id,
      dayIndex: Number(d.dayIndex ?? 1),
      title: d.title ?? `Day ${d.dayIndex ?? 1}`,
      places: (d.entries ?? []).map((e: any) => ({
        id: e.id,
        placeName: e.placeName ?? e.label ?? "",
        caption: e.caption ?? "",
      })),
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
    setHeroCover(next.hero, draft.coverPhoto.previewUrl);
  }

  // days and places
  const dayById = new Map(draft.days.map((d) => [d.id, d]));
  (next.days ?? []).forEach((d: any) => {
    const id = `day-${d.dayIndex ?? 1}`;
    const dd = dayById.get(id);
    if (!dd) return;

    const captionByPlaceId = new Map(dd.places.map((p) => [p.id, p.caption]));
    (d.entries ?? []).forEach((e: any) => {
      if (captionByPlaceId.has(e.id)) {
        e.caption = captionByPlaceId.get(e.id);
      }
    });

    // day title
    d.title = dd.title;
  });

  return next;
}

function setHeroCover(hero: any, url: string) {
  // set the cover URL in a best-effort way
  if ("coverImage" in hero) hero.coverImage = url;
  else if ("coverUrl" in hero) hero.coverUrl = url;
  else if ("imageUrl" in hero) hero.imageUrl = url;
  else hero.coverImage = url;
}

function structuredCloneSafe<T>(obj: T): T {
  // structuredClone is not supported in some environments (e.g., older Node.js versions)
  try {
    // @ts-ignore
    if (typeof structuredClone === "function") return structuredClone(obj);
  } catch {}
  return JSON.parse(JSON.stringify(obj));
}
