# User Dashboard — Data Requirements (Summary for Backend)

**Purpose:** This document describes what data the **LinkedSpaces Admin User Dashboard** needs so the backend can provide it. The dashboard is only visible to two admin accounts: **inseo** and **yoobin**. All numbers should be calculated from **all users** in the system (not just the logged-in user).

---

## What the dashboard is

The User Dashboard is an admin-only page where you can see:

- How many users and places exist across the whole app
- How accurate the “place name suggestion” (POI Wizard) is
- Where users are saving places (by country and city)
- Who the most active users are
- How engaged users are (e.g. how many add stories or voice to photos)
- A drill-down view for any single user (places, photos, categories, friends, etc.)

To make this work, the backend needs to expose **two API endpoints** that return the data described below. The frontend will call them when an admin opens the dashboard.

---

## 1. Dashboard overview (all users at a glance)

**What to find / provide:**

| What we need                 | Description                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| **Total users**              | Number of registered users in the system.                                            |
| **Total places**             | Total number of places saved by all users (only count places that are not “hidden”). |
| **Total photos**             | Total number of photos across all those places.                                      |
| **Total comments**           | Total comments on photos (including replies).                                        |
| **New users (last 30 days)** | How many users signed up in the last 30 days.                                        |
| **Average places per user**  | Total places ÷ total users.                                                          |
| **Average photos per place** | Total photos ÷ total places.                                                         |

**Where it usually comes from:** User accounts (e.g. sign-up date for “new users”), and each user’s **place visit history** (list of places they saved, with photos and comments). Ignore any place where status is “hidden”.

---

## 2. POI Wizard accuracy (place name suggestions)

When a user adds a place, the app suggests a list of place names. The user picks one. We want to know: **how often was the correct place in the top 3? Top 10? Top 40?**

**What to find / provide:**

| What we need            | Description                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| **Top 3 accuracy (%)**  | Of all place selections, what percentage had the chosen place in the first 3 suggestions? |
| **Top 10 accuracy (%)** | Same idea, but in the first 10 suggestions.                                               |
| **Top 40 accuracy (%)** | Same idea, but in the first 40 suggestions.                                               |
| **Total selections**    | How many place selections we used to compute the above (for context).                     |

**Where it usually comes from:** For each saved place, you need:

- The list of suggestions that was shown (e.g. stored as `suggestedList` — often a JSON array).
- The index of the suggestion the user picked (e.g. `selectedIndex`: 0 = first, 1 = second, etc.).

Then: count how many times `selectedIndex` is 0, 1, or 2 (top 3), or &lt; 10 (top 10), or &lt; 40 (top 40), and turn those into percentages.

---

## 3. Geography (where are places?)

**What to find / provide:**

| What we need          | Description                                                                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Places by country** | For each country, how many saved places are in that country? (e.g. USA: 15,000, Japan: 8,000.) Provide as a list of [country name, count], sorted by count (highest first). Top 20 is enough. |
| **Places by city**    | Same idea, but by city. Use format “City, Country” (e.g. “New York, United States”) so we can show both. List of [city string, count], top 20.                                                |

**Where it usually comes from:** Each place in a user’s place visit history has (or can have) `country` and `city`. Count how many places per country and per “city, country”.

---

## 4. Place categories

**What to find / provide:**

| What we need      | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| **Category name** | e.g. Cafe, Restaurant, Bar, Park.                                        |
| **Count**         | How many places have that category?                                      |
| **Percentage**    | That count as a percentage of total places (so we can show “Cafe: 26%”). |

Provide a list of categories with count and percentage, sorted by count (highest first). We can show top 10 or so on the dashboard.

**Where it usually comes from:** Each place can have a `categories` array (e.g. ["Cafe", "Restaurant"]). Count how many places mention each category.

---

## 5. Top active users

**What to find / provide:**

For each user (we only need the **top 10** by number of places added):

| What we need     | Description                                          |
| ---------------- | ---------------------------------------------------- |
| **Username**     | The user’s username.                                 |
| **Places added** | Total number of places they have saved (non-hidden). |
| **Photos added** | Total number of photos across those places.          |
| **Joined date**  | When the user signed up (for display).               |

Sort by “places added” (highest first) and take the top 10.

**Where it usually comes from:** Loop over all users and their place visit history; sum places and photos per user.

---

## 6. Engagement (stories and voice)

**What to find / provide:**

| What we need              | Description                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| **Photos with story (%)** | Of all photos, what percentage have a text story/caption?          |
| **Photos with audio (%)** | Of all photos, what percentage have an audio caption (voice memo)? |
| **Total stories**         | Total number of photos that have a story (optional, for context).  |
| **Total audio captions**  | Total number of photos that have audio (optional).                 |

**Where it usually comes from:** For each place, look at `photoList`. For each photo, check if it has a `story` (text) or `audio` / `storyAudio`. Count and convert to percentages.

---

## 7. Per-user detail (drill-down when you click a user)

When the admin selects a specific user from the “Top active users” list, we need detailed stats **for that one user**.

**What to find / provide:**

| What we need                 | Description                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Username**                 | Same as the selected user.                                                                                       |
| **Joined date**              | When they signed up.                                                                                             |
| **Total places**             | Number of places they saved (non-hidden).                                                                        |
| **Total photos**             | Number of photos across those places.                                                                            |
| **Places by country**        | For this user only: count of places per country (e.g. USA: 800, Japan: 440).                                     |
| **Places by city**           | For this user only: count of places per city (e.g. New York: 320, Tokyo: 410).                                   |
| **Places by category**       | For this user: each category name, count, and percentage (same idea as section 4 but for one user).              |
| **Average photos per place** | This user’s total photos ÷ total places.                                                                         |
| **Photos with story (%)**    | For this user’s photos, what % have a text story?                                                                |
| **Photos with audio (%)**    | For this user’s photos, what % have audio?                                                                       |
| **Average story length**     | Among photos that have a story, average number of characters (so we know if users write short or long captions). |
| **Friend count**             | How many friends this user has (if your app has a friends list).                                                 |

**Where it usually comes from:** Find the user by username, then use only their place visit history and friends list. Same rules: ignore hidden places; count photos, stories, audio, categories, country, city.

---

## Summary: two API endpoints

1. **“Dashboard analytics” (all users)**  
   One API call that returns:
   - Overview (total users, total places, total photos, total comments, new users last 30 days, averages)
   - POI accuracy (top 3, top 10, top 40 %, and total selections)
   - Geography (places by country, places by city)
   - Categories (name, count, percentage)
   - Top 10 active users (username, places added, photos added, joined date)
   - Engagement (photos with story %, photos with audio %, and optionally total stories and total audio)

2. **“User details” (one user)**  
   One API call that takes a **username** and returns:
   - That user’s overview (total places, total photos, joined date, friend count)
   - Their places by country and by city
   - Their places by category (with count and percentage)
   - Their engagement (avg photos per place, % with story, % with audio, average story length)

---

## Who can access this data

- Only users with username **inseo** or **yoobin** may call these APIs. The backend should check the logged-in user and return “Access denied” (403) for anyone else.
- The frontend sends the same login token (Bearer token) it uses for the rest of the app.

---

## Where the data lives (technical note for implementers)

- **User model:** e.g. list of users, each with `username`, `createdAt`, `placeVisitHistory`, and optionally `friends`.
- **Place visit history:** For each user, an array of “places” they saved. Each place typically has: `country`, `city`, `categories`, `status` (exclude if `"hidden"`), `photoList`, and for POI: `suggestedList` and `selectedIndex`.
- **Photos:** Each photo can have `story`, `audio` or `storyAudio`, and `comments` (with optional replies).

If you have a reference implementation (e.g. the exact JSON shape and field names), it should match the two endpoints described in **BACKEND_API_SPEC.md** in the dashboard folder. This document is the high-level “what to find” summary so your father knows what the dashboard needs.
