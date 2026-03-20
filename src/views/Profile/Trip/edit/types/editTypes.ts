export type ImageValue =
  | { kind: "keep"; url: string }
  | { kind: "remove"; reason?: "user" | "sanitize" }
  | { kind: "local"; previewUrl?: string; previewKey?: string };

export type PlaceDraft = {
  id: string;
  /** Backend identifier for /placeVisitHistory/story (usually digitizedTime). */
  placeKey: string;
  placeName: string;
  originalPlaceName?: string;
  timeRangeText?: string;
  categoryLabel?: string;
  /** Place-level story (not photo caption). */
  placeStory?: string;
  caption?: string;
  photos: string[];
  captions: string[];
  /** Indices (into the original photos/captions arrays) that the user has hidden in the editor. */
  hiddenPhotoIndices?: number[];
  coordinate?: { latitude: number; longitude: number };
  status?: "saved" | "hidden" | "deleted" | string;
  originalIndex?: number;
  isHidden?: boolean;
  hiddenAt?: number;
  anchorBeforeId?: string;
  anchorAfterId?: string;
  visitIndex?: number;
  markerRole?: "start" | "end" | "poi";
};

export type DayDraft = {
  id: string; // "day-1"
  dayIndex: number;
  title: string;
  /** Day-level story (from trip-recap API, editable via POST /trips/day-story). */
  dayStory?: string;
  places: PlaceDraft[];
};

export type RecapEditDraft = {
  version: 1;
  updatedAt: number;

  sharedWithFriends: boolean;
  recapTitle: string;
  coverPhoto: ImageValue;

  days: DayDraft[];
};
