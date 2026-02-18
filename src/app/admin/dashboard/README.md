# Admin User Dashboard

Admin-only User Dashboard for LinkedSpaces. Access is restricted to usernames **inseo** and **yoobin**. The dashboard can show **live data** from the backend (when endpoints exist) or **mock data** as fallback.

## Access

- **Route:** `/admin/dashboard`
- **Menu:** Top-right user dropdown → "User Dashboard" (visible only for admin users).
- **Guard:** Unauthenticated or non-admin users are redirected to `/`.

## Structure

- **`page.tsx`** — Auth + admin check, loads mock data and renders all sections.
- **`types.ts`** — TypeScript types for all metrics (Overview, Activity, Performance, Geo, Per-User, API).
- **`mockData.ts`** — Mock data generators (~6 months of history). Replace with API calls in Phase 2.
- **`components/`**
  - `DashboardOverview.tsx` — DAU/WAU/MAU, growth, retention, stickiness, churn, trend line chart.
  - `DashboardActivity.tsx` — Top users, recent activity feed, engagement by page, add-place flow.
  - `DashboardPerformance.tsx` — POI accuracy (top3/top10/top40, Google AC), crash rate, load time, API failure, CAC.
  - `DashboardGeo.tsx` — Popular places, places per city, users per country.
  - `DashboardPerUser.tsx` — Drill-down by user (places, blogs, categories, POI, photo stats, etc.).
  - `DashboardApiUsage.tsx` — API calls by service, cost per user, per-user breakdown.
  - `DashboardFilters.tsx` — Date range, segment, country (UI only with mock; wire to API in Phase 2).

## How to add or modify metrics

1. **Types:** Add or change fields in `types.ts` (e.g. `OverviewMetrics`, `UserActivityMetrics`).
2. **Mock data:** Update the corresponding getter in `mockData.ts` (e.g. `getMockOverviewMetrics()`).
3. **UI:** Update the section component (e.g. `DashboardOverview.tsx`) to display the new field or chart.
4. **Export:** If needed, add CSV/PDF export in `page.tsx` (e.g. `exportOverviewCsv`) or in the section component.

## Mock data structure

- **Overview:** `getMockOverviewMetrics()` — dau, wau, mau, signups, growth %, retention %, stickiness, churn %, `trendDaily[]`.
- **Activity:** `getMockUserActivityMetrics()` — topActiveUsers, recentActivity, total/monthly places, blogs, engagementByPage, mostUsedAddPlaceFlow, referralRatePercent.
- **Performance:** `getMockPerformanceMetrics()` — poiAccuracy (top3/10/40, googleAutocomplete), crashRate, loadTimeAvgMs, apiFailureRate, cacUsd.
- **Geo:** `getMockGeoMetrics()` — popularPlaces, placesPerCity, usersPerCountry.
- **Per-user:** `getMockPerUserMetrics(userId)` — places, blogs, placesByCountry, categoryBreakdown, photosPerPlace, pctPhotosWithStory, poiAccuracy, etc.
- **API:** `getMockApiUsageMetrics()` — totalByService (google, openai, unsplash, osmCityName, osmAddress), costPerUserAvgUsd, perUserBreakdown.

All dates use ISO strings; counts are numbers. Mock data is deterministic except for `trendDaily` (slight random variation).

## Real data integration (Phase 2 — implemented)

The dashboard **fetches live data** from the backend when available:

- **API client:** `src/api/admin-dashboard.ts` — `fetchDashboardAnalytics()` and `fetchUserDetails(username)`.
- **Backend contract:** See **`BACKEND_API_SPEC.md`** in this folder for the exact request/response shape.
- **Reference implementation:** `docs/backend-admin-dashboard-reference.js` — copy into your Node/Express app and wire to your User model and auth.

**Endpoints the frontend calls:**

1. **GET /admin/dashboard-analytics** — aggregate overview, POI accuracy, geography, categories, top active users, engagement. Admin-only (inseo, yoobin).
2. **GET /admin/user-details/:username** — per-user drill-down. Admin-only.

**Flow:**

- On load, the page calls `fetchDashboardAnalytics()`. On success, data is mapped via `dataMapper.ts` and merged with mock for fields the backend doesn’t provide (e.g. DAU/WAU/MAU trend). On 403/500, the UI shows an error with "Retry" and "Use mock data".
- Per-user: the dropdown lists usernames from Top Active Users. Selecting a user calls `fetchUserDetails(username)` and shows the mapped metrics (or mock when "Use mock data" is on).

**Backend:** Implement the two routes on your API server (same base URL as the rest of the app). Protect with your auth middleware and a check that `req.user.username` is `inseo` or `yoobin`; return 403 otherwise.
