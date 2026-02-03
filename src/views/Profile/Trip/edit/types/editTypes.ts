export type ImageValue =
  | { kind: "keep"; url: string }
  | { kind: "remove"; reason?: "user" | "sanitize" }
  | { kind: "local"; previewUrl?: string; previewKey?: string };

export type PlaceDraft = {
  id: string;
  /** Backend identifier for /placeVisitHistory/story (usually digitizedTime). */
  placeKey: string;
  placeName: string;
  timeRangeText?: string;
  categoryLabel?: string;
  /** Place-level story (not photo caption). */
  placeStory?: string;
  caption?: string;
  photos: string[];
  captions: string[];
  coordinate?: { latitude: number; longitude: number };
};

export type DayDraft = {
  id: string; // "day-1"
  dayIndex: number;
  title: string;
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
