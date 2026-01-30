export type ImageValue =
  | { kind: "keep"; url: string }
  | { kind: "remove" }
  | { kind: "local"; file?: File; previewUrl: string };

export type PlaceDraft = {
  id: string;
  placeName: string;
  caption: string;
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
