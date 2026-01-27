export type TripPrivacyControl = {
  level: "public" | "private" | "hidden" | string;
  allowedUserList: string[];
};

export type TripCoordinate = {
  latitude: number;
  longitude: number;
};

export type TripPlaceRef = {
  placeIndex: number;
  _id?: string;
};

export type Trip = {
  blogKey: number;
  status: "saved" | string;

  privacyControl: TripPrivacyControl;

  startTimeString: string;
  endTimeString: string;
  startingYear: number;

  startTimestamp?: string; // ISO
  endTimestamp?: string; // ISO

  title?: string;
  tripHighlight?: string;
  coverPhotoUri?: string;

  visitedPlaceName?: string[];
  country?: string;
  countryCode?: string;

  coordinate?: TripCoordinate;
  placeList?: TripPlaceRef[];
};
