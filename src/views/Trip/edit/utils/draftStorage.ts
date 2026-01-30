import type { RecapEditDraft, ImageValue } from "../types/editTypes";

const DRAFT_VERSION = 1;

export function draftKey(userId: string, tripId: string) {
  return `recapDraft:${userId}:${tripId}`;
}

// localStorage cannot store File objects, so we sanitize local image values before saving.
// If the image was selected locally, we only keep a preview URL (best-effort UI preview).

function sanitizeImageForStorage(img: ImageValue): ImageValue {
  if (img.kind === "local") {
    return img.previewKey
      ? { kind: "local", previewKey: img.previewKey } // key는 남김
      : { kind: "remove" };
  }
  return img;
}

function sanitizeDraftForStorage(draft: RecapEditDraft): RecapEditDraft {
  return {
    ...draft,
    coverPhoto: sanitizeImageForStorage(draft.coverPhoto),
    days: draft.days.map((d) => ({ ...d })),
  };
}

export function saveDraft(
  userId: string,
  tripId: string,
  draft: RecapEditDraft,
) {
  if (typeof window === "undefined") return;
  const safe = sanitizeDraftForStorage(draft);
  window.localStorage.setItem(draftKey(userId, tripId), JSON.stringify(safe));
}

export function loadDraft(
  userId: string,
  tripId: string,
): RecapEditDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(draftKey(userId, tripId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as RecapEditDraft;
    if (parsed?.version !== DRAFT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDraft(userId: string, tripId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(draftKey(userId, tripId));
}
