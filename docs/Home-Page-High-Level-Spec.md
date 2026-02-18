# Home Page — High-Level Spec (for AI / handoff)

**Purpose:** Describe how the LinkedSpaces Home page looks and works today so another AI or developer can understand and enhance it.

---

## What the Home page is

The Home page is the **logged-in user’s main feed**: a single-column, scrollable dashboard showing the user’s **friends** and content from their **network** (friends’ places and trips). It uses a **light theme** (forced for `/home` in the app layout).

---

## Layout and structure

- **Container:** Full-width background `bg-[var(--color-bg)]`, content in a **max-w-5xl** centered column with horizontal padding (`px-4 py-8 sm:px-6 lg:px-8`).
- **Sections:** Four main sections stacked **vertically with `gap-12`** (in order, top to bottom):
  1. **Friends row**
  2. **Pulse / Invite card**
  3. **Recap Blogs carousel**
  4. **Feed list**

No sidebar; the page is just this single column under the main app header.

---

## Section 1: Friends row

- **Component:** `HomeFriendsRow`
- **Heading:** “Friends” (text-lg, semibold).
- **Content:** Horizontal scrollable row of **friend avatars + usernames**.
  - Each item: circular avatar (64px), username below (truncated, max-width 80px).
  - Clickable (button) per friend; `onFriendClick(friendId)` is wired (currently logs to console).
- **Data:** `friends` = list of `{ id, username, avatarUrl? }`. Comes from **current user’s `direct_friends` / `friends`** via `getHomeFriends(user)`; falls back to **mock friends** if none.

---

## Section 2: Pulse / Invite card (Invited Pulses)

- **Component:** `PulseCard`
- **Heading:** “Invited Pulses”
- **Content:** One **promotional / CTA card**:
  - Title: “Introducing Pulse”
  - Short copy: “Follow friends' trips in real time. Travel together, no matter where you are.”
  - Subtext: “No Pulse invitations yet! Wait for friends to invite you to their adventures.”
  - **Primary button:** “Invite Friends” → `onInviteFriends()` (currently logs to console).
- **Styling:** Rounded card, light blue gradient tint, border, shadow. No dynamic data yet (static copy).

---

## Section 3: Recap Blogs carousel

- **Component:** `RecapBlogsCarousel`
- **Heading:** “Recap Blogs” + hint “Swipe to see more trips →”
- **Content:** **Horizontal scrollable carousel** of trip/recap cards.
  - Each card: **fixed size** (280×200px), rounded, cover image, gradient overlay.
  - Overlay shows: **author avatar + username** (top-left), **location label** (bottom-left), **date label** (bottom).
  - Cards are **links** (`item.href`) to recap blog pages (e.g. `/profile/{username}/recap/{blogKey}`).
- **Data:** `recapBlogs` = list of `{ id, title, coverImageUrl, locationLabel, dateLabel, authorUsername, authorAvatarUrl?, href }`.
  - **Primary source:** **Global friends network** → `trips` from `useFriendsNetwork()` → mapped with `recapBlogsFromFriendsTrips(trips)`.
  - If no friends/trips: **current user’s recap** from `getHomeRecapBlogs(user)` (from `user.trips` + `placeVisitHistory`).
  - **Fallback:** Mock recap blogs if still empty.
- **Behavior:** Scroll-snap; scroll position drives an “active” index (used for optional dots/nav if added later).

---

## Section 4: Feed list

- **Component:** `FeedList` (renders many `FeedCard`s).
- **Heading:** “Feed”
- **Content:** **Vertical list of feed cards** (post-style).
  - **FeedCard layout:**
    - **Header row:** User avatar (40px circle), “**{username}** visited **{placeName}**”, time-ago text, kebab menu (⋮) for options.
    - **Main image:** One photo, aspect ratio 4:3.
    - **Footer row:** Like count (heart icon), comment count (message icon).
  - **Pagination:** Initial “page” shows first N posts (e.g. 20); “Load more” button and/or **intersection observer** to load more as user scrolls near the bottom.
- **Data:** `feedPosts` = list of `{ id, userId, username, userAvatarUrl?, placeName, placeId?, imageUrl, timeAgo, likeCount, commentCount }`.
  - **Primary source:** **Global friends network** → `visitEntries` from `useFriendsNetwork()` → mapped with `feedPostsFromFriendsVisitHistory(visitEntries)`.
  - If no friends/visit data: **current user’s feed** from `getHomeFeedPosts(user)` (from `user.placeVisitHistory`).
  - **Fallback:** Mock feed posts if still empty.
  - Avatars: feed posts are enriched with avatar URLs from the Friends list when the API doesn’t provide them.
- **Behavior:** `onMenuClick(postId)` wired (currently logs to console). No navigation to place detail yet from card click.

---

## Data flow (important for enhancements)

- **User:** Fetched once on client from cache: `getCachedUser()` in `useEffect` → stored in `user` state (to avoid SSR/hydration issues).
- **Friends network (global):** Provided by **`FriendsNetworkProvider`** in the root layout. It loads **friends’ visit history** and **friends’ trips** once per logged-in user (using `getHomeDirectFriendUsernames(user)` and API calls `getUserVisitHistory` per friend + `getFriendsTrips`). Exposed via **`useFriendsNetwork()`** → `{ visitEntries, trips, loading }`.
- **Home page** does **not** fetch friends data itself; it only:
  - Reads `user` from local state.
  - Reads `visitEntries` and `trips` from `useFriendsNetwork()`.
  - Derives `friends` from `getHomeFriends(user)` (user’s direct_friends/friends).
  - Derives **recap** from `trips` (or user’s own recap, then mocks).
  - Derives **feed** from `visitEntries` (or user’s own feed, then mocks).

So: **one global fetch** for friends’ visits/trips; Home and Explore both consume it.

---

## File locations

| What                     | Path                                         |
| ------------------------ | -------------------------------------------- |
| Home page                | `src/app/home/page.tsx`                      |
| Friends row              | `src/components/home/HomeFriendsRow.tsx`     |
| Pulse card               | `src/components/home/PulseCard.tsx`          |
| Recap carousel           | `src/components/home/RecapBlogsCarousel.tsx` |
| Feed list                | `src/components/home/FeedList.tsx`           |
| Feed card                | `src/components/home/FeedCard.tsx`           |
| Global friends data      | `src/contexts/FriendsNetworkContext.tsx`     |
| User/friends helpers     | `src/lib/homeNetworkData.ts`                 |
| API → feed/recap mappers | `src/lib/lsHomeMappers.ts`                   |
| Mock data / types        | `src/lib/mockNetwork.ts`                     |

---

## Design tokens / styling

- Background: `var(--color-bg)`
- Card text: `var(--card-text)`, muted: `var(--card-text-muted)`
- Card border: `var(--card-border)`
- Primary actions: `var(--color-main)` (focus rings, buttons)
- Images: Next.js `Image` with `normalizeImageSrc()` for external URLs; some avatars use DiceBear if no `avatarUrl`.

---

## Gaps / possible enhancements (for the other AI)

- **Friend click:** Currently only logs; could navigate to friend’s profile or a filtered feed.
- **Invite Friends:** Only logs; could open share/invite flow or modal.
- **Feed card:** No link to place detail or profile; kebab menu has no actions.
- **Recap cards:** Already link to recap blog page; could add hover state or better empty state.
- **Pulse card:** Static; could show real “Pulse” invitations when that feature exists.
- **Loading states:** No explicit loading UI when `useFriendsNetwork()` is loading; could add skeletons or a spinner.
- **Empty states:** When there are no friends or no feed/recap, fallbacks are mocks; could show “Add friends” or “Go add places” CTAs instead.
- **Responsiveness:** Layout is already responsive (padding, max-width); carousel and feed list work on small screens; could tune spacing or card sizes per breakpoint.

---

## Summary in one paragraph

The Home page is a **single-column feed** with four sections: (1) a horizontal **Friends** row from the user’s direct_friends (or mocks); (2) a **Pulse** CTA card (“Invite Friends”); (3) a horizontal **Recap Blogs** carousel from the global friends’ trips (or user’s own recap, or mocks); (4) a **Feed** list of “user visited place” cards from the global friends’ visit history (or user’s own visits, or mocks). Data for feed and recap comes from **FriendsNetworkContext** (one shared fetch). Styling uses CSS variables and a light theme. Interactions (friend click, invite, feed menu) are wired but currently only log; no navigation to profile/place detail yet.
