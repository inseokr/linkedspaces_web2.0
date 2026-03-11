# Admin Dashboard Backend API Spec

The frontend calls these endpoints with the same base URL and auth as the rest of the app (`Authorization: Bearer <token>`). The backend **must** verify that the authenticated user's `username` is **"inseo"** or **"yoobin"** and return **403 Unauthorized** otherwise.

Base path: same as existing API (e.g. `LS_API` or your API prefix).

---

## 1. GET /admin/dashboard-analytics

**Purpose:** Aggregate metrics across ALL users (for admin dashboard overview, POI accuracy, geography, top users, engagement).

**Auth:** Bearer token required. Admin-only (username must be `inseo` or `yoobin`).

**Response 200:** JSON body with the following shape.

```json
{
  "overview": {
    "totalUsers": 1234,
    "totalPlaces": 45678,
    "totalPhotos": 123456,
    "totalComments": 5678,
    "newUsersLast30Days": 89,
    "avgPlacesPerUser": "37.02",
    "avgPhotosPerPlace": "2.71"
  },
  "poiAccuracy": {
    "topThreeAccuracy": "78.20",
    "topTenAccuracy": "91.50",
    "topFortyAccuracy": "97.10",
    "totalSelections": 12000
  },
  "geography": {
    "placesByCountry": [
      ["United States", 15000],
      ["Japan", 8000],
      ["France", 5000]
    ],
    "placesByCity": [
      ["New York, United States", 5000],
      ["Tokyo, Japan", 4500]
    ]
  },
  "categories": [
    { "category": "Cafe", "count": 12000, "percentage": "26.30" },
    { "category": "Restaurant", "count": 10000, "percentage": "21.92" }
  ],
  "topActiveUsers": [
    {
      "username": "travel_jane",
      "placesAdded": 1240,
      "photosAdded": 5200,
      "joinedDate": "2024-01-15T00:00:00.000Z"
    }
  ],
  "engagement": {
    "photosWithStoryPercentage": "62.00",
    "audioCaptionPercentage": "18.00",
    "totalStories": 76543,
    "totalAudioCaptions": 22222
  }
}
```

**Implementation notes:**

- **Data source:** User model with `placeVisitHistory` (and optionally `friends`). Use `.lean()` and `.select()` for performance.
- **Filter:** Exclude places where `place.status === 'hidden'`.
- **POI:** From `place.suggestedList` (JSON array) and `place.selectedIndex`. Top 3/10/40 accuracy = % of selections where `selectedIndex < 3` / `< 10` / `< 40`.
- **Geography:** Count places by `place.country` and by `"${place.city}, ${place.country}"` for cities.
- **Categories:** Flatten `place.categories` and count each category.
- **Top users:** One row per user; sum places (and optionally photos) from their `placeVisitHistory`.
- **Engagement:** From `place.photoList`: count photos with `photo.story`, and with `photo.audio` or `photo.storyAudio`; count comments (including replies).

**Errors:**

- **403:** Not an admin user.
- **500:** Server error (log and return generic message).

---

## 2. GET /admin/user-details/:username

**Purpose:** Detailed metrics for a single user (drill-down from Top Active Users).

**Auth:** Bearer token required. Admin-only.

**Params:** `username` – path parameter (URL-encode the username).

**Response 200:** JSON body:

```json
{
  "username": "travel_jane",
  "joinedDate": "2024-01-15T00:00:00.000Z",
  "totalPlaces": 1240,
  "totalPhotos": 5200,
  "placesByCountry": { "United States": 800, "Japan": 440 },
  "placesByCity": { "New York": 320, "Tokyo": 410 },
  "placesByCategory": [
    { "category": "Cafe", "count": 380, "percentage": "30.65" },
    { "category": "Restaurant", "count": 310, "percentage": "25.00" }
  ],
  "avgPhotosPerPlace": "4.19",
  "photosWithStoryPercentage": "62.00",
  "audioCaptionPercentage": "18.00",
  "avgStoryLength": 42,
  "friendCount": 85
}
```

**Implementation notes:**

- Find user by `username`. Exclude `placeVisitHistory` entries with `place.status === 'hidden'`.
- `placesByCountry` / `placesByCity`: plain objects `{ [key]: count }`.
- `avgStoryLength`: average length of `photo.story` strings (only over photos that have a story).

**Errors:**

- **403:** Not an admin user.
- **404:** User not found.
- **500:** Server error.

---

## 3. GET /admin/dashboard-api-usage

**Purpose:** Metrics for infrastructure dashboard (API Usage & Cost Tracking).

**Auth:** Bearer token required. Admin-only.

**Response 200:** JSON body:

```json
{
  "totalByService": {
    "google": 120500,
    "openai": 45000,
    "unsplash": 8000,
    "osmCityName": 1500,
    "osmAddress": 2500
  },
  "costPerUserAvgUsd": 0.45,
  "perUserBreakdown": [
    {
      "userId": "usr_123",
      "username": "travel_jane",
      "placesSaved": 1240,
      "friends": 85,
      "highlights": 12,
      "recapBlogs": 3,
      "itineraries": 5
    }
  ]
}
```

**Implementation notes:**

- Requires tracking or simulating API calls globally and per-user in the backend.
- `totalByService`: an object mapping service types (`google`, `openai`, `unsplash`, `osmCityName`, `osmAddress`) to totals. Unused ones should default to `0`.
- `costPerUserAvgUsd`: Estimated cost averaged over active users.
- `perUserBreakdown`: Detailed statistics for top demanding users.

**Errors:**

- **403:** Not an admin user.
- **500:** Server error.

---

## Security checklist

1. Verify JWT (or session) and load current user.
2. Restrict to `currentUser.username` in `['inseo', 'yoobin']`; else **403**.
3. Do not expose other users’ PII beyond the aggregate/listed fields above.
4. Consider rate limiting for `/admin/*` routes.

## Frontend usage

- Base URL: same as `NEXT_PUBLIC_API_BASE_URL` (e.g. `https://your-api.com/LS_API`).
- Requests: `GET` with `Authorization: Bearer <token>` (token from localStorage/sessionStorage after login).
- The dashboard uses these two endpoints only; all other sections (e.g. DAU/WAU/MAU trend, API usage) currently use mock or merged data.
