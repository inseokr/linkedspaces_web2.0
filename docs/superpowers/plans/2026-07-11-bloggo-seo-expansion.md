# Bloggo SEO Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a how-it-works pillar page, nine data-driven SEO guide pages, and full SEO infrastructure (metadata, canonicals, sitemap, robots, JSON-LD) to bloggo.linkedspaces.com to capture long-tail travel-journal search traffic.

**Architecture:** All new pages are static server components under `src/app/bloggo/*`, served with clean URLs on `bloggo.linkedspaces.com` via the existing host rewrite in `src/middleware.ts`. Guide pages are data-driven: one typed content array (`guides.ts`) rendered by a shared `[slug]` template with `generateStaticParams`. A small middleware fix makes `public/` assets and `robots.txt` reachable on the bloggo host (they currently 404 there — this also fixes the already-broken App Store badge image on the live bloggo landing page).

**Tech Stack:** Next.js 16 App Router (`^16.1.6`), React 19, TypeScript, Tailwind classes + Bloggo CSS variables. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-11-bloggo-seo-expansion-design.md`

## Global Constraints

- **Canonical host:** `https://bloggo.linkedspaces.com`. Canonical paths never include the `/bloggo` prefix (e.g. canonical for `src/app/bloggo/guides/page.tsx` is `/guides`).
- **App Store URL:** `https://apps.apple.com/us/app/bloggo/id6759849314` (app id `6759849314`). Use this exact string everywhere.
- **Landing page untouched:** `src/app/bloggo/page.tsx` gets ONLY a `metadata` export added. No visual or copy changes anywhere on it.
- **Next.js 16:** in dynamic routes, `params` is a `Promise` — always `await params` in both `generateMetadata` and the page component.
- **All new pages** are static server components: no `"use client"`, no data fetching, no loading/error states. Unknown guide slug → `notFound()` (renders existing `src/app/bloggo/not-found.tsx`).
- **Voice (LinkedSpaces standards):** sentence case for all headings/labels/buttons ("How it works", never "How It Works"); direct, warm, privacy-first; no hype, no exclamation marks, no FOMO; verbs for buttons/links.
- **Path alias:** `@/*` → `src/*` (so `@/bloggo/components/...` → `src/bloggo/components/...`).
- **Internal links** use the `/bloggo`-prefixed form via `const BASE = "/bloggo"` (existing repo pattern); the middleware strips the prefix on the bloggo host.
- **No test framework exists in this repo.** Verification per task = `npm run build` (includes type-check) and/or `curl` checks against `npm run dev` on `http://bloggo.localhost:3000`. Task 11 runs the full verification matrix.
- **Commit after every task.** Work on a branch `bloggo-seo` off `dashboard` (create it in Task 1, Step 1 — or use a worktree per superpowers:using-git-worktrees).

## File Structure

```
docs/bloggo/app.md                                 new    — App Store listing snapshot + keyword map (reference only)
public/bloggo/screenshots/*.png                    new    — 10 listing screenshots + 512px app icon
public/bloggo/og-image.png                         new    — OpenGraph/Twitter card image
src/middleware.ts                                  modify — public-asset passthrough on bloggo host
public/robots.txt                                  modify — add Sitemap line
src/app/bloggo/layout.tsx                          modify — SEO metadata rewrite + MobileApplication JSON-LD
src/app/bloggo/page.tsx                            modify — add metadata export (canonical) only
src/app/bloggo/features/page.tsx                   modify — fix description, add canonical
src/app/bloggo/privacy/page.tsx                    modify — add canonical
src/app/bloggo/terms/page.tsx                      modify — add canonical
src/app/bloggo/pricing/layout.tsx                  new    — metadata for the client-component pricing page
src/app/bloggo/support/layout.tsx                  new    — metadata for the client-component support page
src/app/bloggo/how-it-works/page.tsx               new    — pillar page (HowTo + FAQPage JSON-LD)
src/app/bloggo/guides/guides.ts                    new    — typed content array for all 9 guides
src/app/bloggo/guides/page.tsx                     new    — guides index
src/app/bloggo/guides/[slug]/page.tsx              new    — shared guide template (Article + BreadcrumbList JSON-LD)
src/app/bloggo/sitemap.ts                          new    — served at bloggo.linkedspaces.com/sitemap.xml via rewrite
src/bloggo/components/seo/JsonLd.tsx               new    — JSON-LD <script> helper
src/bloggo/components/marketing/AppStoreBadge.tsx  new    — reusable App Store badge link
src/bloggo/components/layout/Header.tsx            modify — add "How it works" + "Guides" nav links
src/bloggo/components/layout/Footer.tsx            modify — add links to the "Product" column
```

**Pre-verified facts (do not re-derive):**

- The middleware matcher `"/((?!_next/static|_next/image|favicon\\.ico).*)"` DOES pass `/sitemap.xml` and `/robots.txt` through to the middleware function.
- On the bloggo host today, `/images/*`, `/robots.txt` etc. get rewritten to `/bloggo/images/*`, `/bloggo/robots.txt` which don't exist in `public/` → **live 404s** (confirmed: `curl -I https://bloggo.linkedspaces.com/images/app-store-badge.png` → 404). Task 3 fixes this.
- `src/app/bloggo/page.tsx`, `features`, `privacy`, `terms` are server components; `pricing/page.tsx` and `support/page.tsx` are `"use client"` and therefore cannot export `metadata` — they get thin `layout.tsx` files instead (repo precedent: `src/app/bloggo/sign-in/layout.tsx`).
- iPhone screenshots on the listing are 1242×2688 PNGs. The mzstatic template URLs below were extracted from the live App Store page on 2026-07-11.
- App Store data (fetched 2026-07-11): name "Bloggo: Journal & Diary", subtitle "Photos, Videos & Your Memories", Photo & Video, v1.4, free, rating 5.0 (3 ratings).

---

### Task 1: App Store reference file — `docs/bloggo/app.md`

**Files:**

- Create: `docs/bloggo/app.md`

**Interfaces:**

- Consumes: nothing.
- Produces: reference doc only — nothing imports it. Later tasks copy listing copy and the keyword map from it.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b bloggo-seo
```

- [ ] **Step 2: Write `docs/bloggo/app.md`** with exactly this content:

```markdown
# Bloggo — App Store listing snapshot

**Snapshot date:** 2026-07-11 · **Source:** https://apps.apple.com/us/app/bloggo/id6759849314

Single source of truth for ASO/SEO work. Update this file when the listing changes.

## Listing

| Field        | Value                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name         | Bloggo: Journal & Diary                                                                                                                                  |
| Subtitle     | Photos, Videos & Your Memories                                                                                                                           |
| App ID       | 6759849314                                                                                                                                               |
| Category     | Photo & Video                                                                                                                                            |
| Price        | Free                                                                                                                                                     |
| Version      | 1.4                                                                                                                                                      |
| Rating       | 5.0 (3 ratings)                                                                                                                                          |
| Company      | LinkedSpaces LLC                                                                                                                                         |
| Icon (512px) | https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/38/e3/ce/38e3ce25-233e-f588-32d3-5650d6b20320/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.png |

## Full description

> Turn your camera roll into a beautiful journal — photos, videos, and places, organized automatically.
>
> Bloggo automatically finds trips in your photos using time and location, then organizes them into ready-to-edit blog drafts. Complete with structured layouts, maps, routes, and captions.
>
> No blank page. No manual sorting. Just your memories.
>
> **How Bloggo works**
>
> - Bloggo finds trips from your camera roll
> - Your photos are grouped into places automatically
> - Turn them into a structured blog in seconds
>
> **Features**
>
> - **Automatic trip detection** — Bloggo finds trips using your photo time and location.
> - **Instant journal creation** — Turn your photos into a structured journal instantly. The more places and captions you add, the richer your story becomes.
> - **Share as a carousel** — Export your blog as Instagram-ready slides, including cover pages, maps, and place highlights. Download to your camera roll or share directly in 4:5 or 9:16 to other apps.
> - **Export as PDF** — Create a printable travel storybook from your blog in one tap.
> - **Export as video** — Generate a slideshow video with music, ready to share.
> - **Simple editing** — Add captions, adjust photos, and personalize your story.
> - **Travel maps** — See where your memories happened.
>
> **Privacy first**
> Your photos stay on your device. Bloggo uses photo metadata like time and location to organize your trips. Your photos are never uploaded.

## Screenshots (iPhone, 1242×2688)

Local copies live in `public/bloggo/screenshots/`. Template URLs take `{w}x{h}{c}.{f}` (use `1242x2688bb.png` for full resolution).

| #   | Local filename                     | Shows                                                                                                   | Template URL                                                                                                                                                               |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `turn-photos-into-travel-blog.png` | "Turn your photos into a blog" — finished blog cover with trip dates, moment count, route map, day tabs | https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/9a/fe/d7/9afed771-0685-fd6d-de41-ae75b1686ea8/1.png/{w}x{h}{c}.{f}                                             |
| 2   | `automatic-trip-detection.png`     | "Tap to blog" — Your Memories list of detected trips grouped by year, Create Blog button                | https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/ae/b8/7f/aeb87f43-b210-f570-1178-9bbc55f55ae4/2.png/{w}x{h}{c}.{f}                                             |
| 3   | `trip-route-map.png`               | "Relive your trips" — day route map with numbered places and distances                                  | https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/64/c1/82/64c1823d-fe20-4a41-ea21-9055699fe255/3.png/{w}x{h}{c}.{f}                                             |
| 4   | `share-carousel-pdf-video.png`     | "Share to TikTok & Instagram" — share sheet: post to social media, stitch reels, export as PDF          | https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/f2/e2/49/f2e249b9-00f1-2a46-150a-b9fc727a7020/4.png/{w}x{h}{c}.{f}                                             |
| 5   | `blog-on-the-go-camera.png`        | "Blog on the go" — in-app camera capturing a moment                                                     | https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/44/6e/d9/446ed9c9-b394-8606-f5ad-150ecf11fa8f/6.png/{w}x{h}{c}.{f}                                             |
| 6   | `write-your-travel-story.png`      | "Write your travel story" — day editor with summary field, place card, photo captions                   | https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/a6/e7/cb/a6e7cb1e-39b8-8e9d-07f5-1e2a5abcd8e9/Copy_of_Iphone_6.9__U00281242_x_2688_px_U0029.png/{w}x{h}{c}.{f} |
| 7   | `structured-travel-blog.png`       | "Beautiful blogs" — day view with place cards, captions, photos, distances                              | https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/f1/28/03/f1280381-bcf0-18d8-73e6-a09818ac41e7/8.png/{w}x{h}{c}.{f}                                             |
| 8   | `places-visited-tracker.png`       | "Track places visited" — places grid filtered by year and category                                      | https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/25/13/b6/2513b620-3b5c-fa84-d4c3-ce8792810dc2/5.png/{w}x{h}{c}.{f}                                             |
| 9   | `private-on-device-travel-map.png` | "Private, on-device" — US map with photo pins                                                           | https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/d8/22/4e/d8224ed7-55bf-d48b-7faa-833401a23af4/9.png/{w}x{h}{c}.{f}                                             |
| 10  | `my-blogs-home.png`                | "Start blogging today" — My Blogs home with Tap to Blog shortcut                                        | https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/d8/e4/4d/d8e44d88-64bc-66eb-d9b8-9e33400a729c/10.png/{w}x{h}{c}.{f}                                            |

Marketing feature image (1096×1080, used as og-image): https://is1-ssl.mzstatic.com/image/thumb/Features116/v4/ec/8c/b5/ec8cb547-a88f-bd50-0bae-ecf33835cf8e/89d66422-d75a-40f6-abb4-7baafc06e593.png/{w}x{h}{c}.{f}

## Target keyword map

| Keyword                                               | Type      | Page                                            |
| ----------------------------------------------------- | --------- | ----------------------------------------------- |
| AI travel journal                                     | primary   | `/` + `/how-it-works`                           |
| turn photos into a travel blog                        | primary   | `/how-it-works`                                 |
| photo journal & diary app                             | primary   | `/` (layout metadata)                           |
| how to turn photos into a travel blog                 | long-tail | `/guides/turn-photos-into-travel-blog`          |
| organize travel photos by trip automatically          | long-tail | `/guides/organize-travel-photos-by-trip`        |
| make an Instagram carousel from travel photos         | long-tail | `/guides/instagram-carousel-from-travel-photos` |
| create a travel photo book / PDF on iPhone            | long-tail | `/guides/travel-photo-book-from-iphone`         |
| trip photos into a video slideshow with music         | long-tail | `/guides/travel-video-slideshow-with-music`     |
| private travel journal app that doesn't upload photos | long-tail | `/guides/private-travel-journal-app`            |
| make a map of places you've traveled                  | long-tail | `/guides/travel-map-of-places-visited`          |
| photo journal app for everyday life                   | long-tail | `/guides/photo-journal-app-for-everyday-life`   |
| turn your camera roll into a diary                    | long-tail | `/guides/turn-camera-roll-into-diary`           |

Adding a future keyword page = one new entry in `src/app/bloggo/guides/guides.ts`.
```

- [ ] **Step 3: Verify the file renders**

Run: `head -20 docs/bloggo/app.md`
Expected: the header and snapshot table appear, no broken markdown.

- [ ] **Step 4: Commit**

```bash
git add docs/bloggo/app.md
git commit -m "docs: add Bloggo App Store listing snapshot and keyword map"
```

---

### Task 2: Screenshot and og-image assets — `public/bloggo/screenshots/`

**Files:**

- Create: `public/bloggo/screenshots/` (10 screenshots + 1 icon)
- Create: `public/bloggo/og-image.png`

**Interfaces:**

- Consumes: template URLs from Task 1's table.
- Produces: static assets referenced by later tasks as `/bloggo/screenshots/<name>.png` and `/bloggo/og-image.png`.

- [ ] **Step 1: Download all assets at full resolution**

```bash
cd public/bloggo && mkdir -p screenshots && cd screenshots
curl -fsS "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/9a/fe/d7/9afed771-0685-fd6d-de41-ae75b1686ea8/1.png/1242x2688bb.png" -o turn-photos-into-travel-blog.png
curl -fsS "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/ae/b8/7f/aeb87f43-b210-f570-1178-9bbc55f55ae4/2.png/1242x2688bb.png" -o automatic-trip-detection.png
curl -fsS "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/64/c1/82/64c1823d-fe20-4a41-ea21-9055699fe255/3.png/1242x2688bb.png" -o trip-route-map.png
curl -fsS "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/f2/e2/49/f2e249b9-00f1-2a46-150a-b9fc727a7020/4.png/1242x2688bb.png" -o share-carousel-pdf-video.png
curl -fsS "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/44/6e/d9/446ed9c9-b394-8606-f5ad-150ecf11fa8f/6.png/1242x2688bb.png" -o blog-on-the-go-camera.png
curl -fsS "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/a6/e7/cb/a6e7cb1e-39b8-8e9d-07f5-1e2a5abcd8e9/Copy_of_Iphone_6.9__U00281242_x_2688_px_U0029.png/1242x2688bb.png" -o write-your-travel-story.png
curl -fsS "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/f1/28/03/f1280381-bcf0-18d8-73e6-a09818ac41e7/8.png/1242x2688bb.png" -o structured-travel-blog.png
curl -fsS "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/25/13/b6/2513b620-3b5c-fa84-d4c3-ce8792810dc2/5.png/1242x2688bb.png" -o places-visited-tracker.png
curl -fsS "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/d8/22/4e/d8224ed7-55bf-d48b-7faa-833401a23af4/9.png/1242x2688bb.png" -o private-on-device-travel-map.png
curl -fsS "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/d8/e4/4d/d8e44d88-64bc-66eb-d9b8-9e33400a729c/10.png/1242x2688bb.png" -o my-blogs-home.png
curl -fsS "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/38/e3/ce/38e3ce25-233e-f588-32d3-5650d6b20320/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.png" -o bloggo-app-icon.png
cd .. && curl -fsS "https://is1-ssl.mzstatic.com/image/thumb/Features116/v4/ec/8c/b5/ec8cb547-a88f-bd50-0bae-ecf33835cf8e/89d66422-d75a-40f6-abb4-7baafc06e593.png/1096x1080bb.png" -o og-image.png
cd ../..
```

- [ ] **Step 2: Verify dimensions and integrity**

Run: `file public/bloggo/screenshots/*.png public/bloggo/og-image.png`
Expected: each screenshot reports `PNG image data, 1242 x 2688`; icon reports `512 x 512`; og-image reports `1096 x 1080`. No file under 20 KB (would indicate an error page). If any download failed, re-run just that curl.

- [ ] **Step 3: Commit**

```bash
git add public/bloggo/screenshots public/bloggo/og-image.png
git commit -m "feat(bloggo): add App Store screenshot assets and og image"
```

---

### Task 3: Middleware — serve public assets and robots.txt on the bloggo host

**Files:**

- Modify: `src/middleware.ts:20-27`

**Interfaces:**

- Consumes: nothing new.
- Produces: on the bloggo host, `/images/*`, `/icons/*`, `/gifs/*`, `/videos/*`, `/robots.txt`, `/manifest.json`, `/bloggo-icon.png`, `/reset-password.html`, `/bloggo/screenshots/*`, and `/bloggo/og-image.png` are served from `public/` instead of 404ing. `/sitemap.xml` still falls through to the rewrite (→ `/bloggo/sitemap.xml`, the route Task 9 creates).

**Why:** the current rewrite sends `/images/foo.png` to `/bloggo/images/foo.png`, which doesn't exist — every `public/` asset (including the live landing page's App Store badge) currently 404s on `bloggo.linkedspaces.com`, and `robots.txt` is unreachable there. Assets and robots must resolve on the canonical host for this SEO work to function.

- [ ] **Step 1: Add the passthrough**

In `src/middleware.ts`, add a module-level constant below the `BLOGGO_HOSTNAMES` array (after line 8):

```ts
// Files that exist in public/ at their real paths. Rewriting them under
// /bloggo would 404. /sitemap.xml is deliberately NOT here — it must fall
// through to the rewrite so it reaches the generated /bloggo/sitemap.xml.
const PUBLIC_ASSETS =
  /^\/(images|icons|gifs|videos)\/|^\/bloggo\/(screenshots\/|og-image\.png)|^\/(robots\.txt|manifest\.json|bloggo-icon\.png|reset-password\.html)$/;
```

Then inside the `isBloggoHost` branch, immediately after the `/api` early-return (`if (pathname.startsWith("/api")) { ... }`), add:

```ts
if (PUBLIC_ASSETS.test(pathname)) {
  return NextResponse.next();
}
```

Note: this must come BEFORE the `pathname.startsWith("/bloggo")` strip-prefix redirect, so `/bloggo/screenshots/*.png` is served directly instead of bouncing through a 307.

- [ ] **Step 2: Verify with the dev server**

```bash
npm run dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://bloggo.localhost:3000/images/app-store-badge.png   # expect 200
curl -s -o /dev/null -w "%{http_code}\n" http://bloggo.localhost:3000/robots.txt                    # expect 200
curl -s -o /dev/null -w "%{http_code}\n" http://bloggo.localhost:3000/bloggo/screenshots/automatic-trip-detection.png  # expect 200
curl -s -o /dev/null -w "%{http_code}\n" http://bloggo.localhost:3000/sign-in                       # expect 200 (rewrite still works)
kill %1
```

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "fix(bloggo): serve public assets and robots.txt on the bloggo host"
```

---

### Task 4: Layout SEO metadata + JsonLd helper + MobileApplication JSON-LD

**Files:**

- Create: `src/bloggo/components/seo/JsonLd.tsx`
- Modify: `src/app/bloggo/layout.tsx`

**Interfaces:**

- Consumes: `/bloggo/og-image.png` from Task 2.
- Produces: `JsonLd` component — `export default function JsonLd({ data }: { data: object })` — imported by Tasks 6 and 8 from `@/bloggo/components/seo/JsonLd`. Layout `metadata.metadataBase = new URL("https://bloggo.linkedspaces.com")`, which all later per-page `alternates.canonical` paths resolve against.

- [ ] **Step 1: Create `src/bloggo/components/seo/JsonLd.tsx`**

```tsx
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 2: Rewrite `src/app/bloggo/layout.tsx`** — replace the whole file with:

```tsx
import "@/app/bloggo/bloggo.css";
import BloggoHeader from "@/bloggo/components/layout/Header";
import BloggoFooter from "@/bloggo/components/layout/Footer";
import JsonLd from "@/bloggo/components/seo/JsonLd";
import { Metadata } from "next";

const APP_STORE_URL = "https://apps.apple.com/us/app/bloggo/id6759849314";

export const metadata: Metadata = {
  metadataBase: new URL("https://bloggo.linkedspaces.com"),
  title: {
    default: "Bloggo – AI travel journal that turns photos into blogs",
    template: "%s | Bloggo",
  },
  description:
    "Bloggo turns your camera roll into a travel journal — photos grouped by trip and place, with maps, captions, and a blog draft in seconds. Private, on-device.",
  keywords: [
    "AI travel journal",
    "turn photos into a blog",
    "travel journal app",
    "photo journal app",
    "travel diary",
    "trip blog maker",
  ],
  icons: {
    icon: "/bloggo-icon.png",
    apple: "/bloggo-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Bloggo",
    images: [
      {
        url: "/bloggo/og-image.png",
        width: 1096,
        height: 1080,
        alt: "Bloggo – turn your photos into a travel blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/bloggo/og-image.png"],
  },
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Bloggo: Journal & Diary",
  operatingSystem: "iOS",
  applicationCategory: "PhotoApplication",
  offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: 5,
    ratingCount: 3,
  },
  url: APP_STORE_URL,
};

export default function BloggoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bloggo-root min-h-screen flex flex-col theme-light">
      <JsonLd data={appJsonLd} />
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.12) 0%, transparent 60%)",
        }}
      />
      <BloggoHeader />
      <main className="flex-1 relative">{children}</main>
      <BloggoFooter />
    </div>
  );
}
```

Keep the JSX inside the returned `div` byte-identical to the current file except for the added `<JsonLd data={appJsonLd} />` line.

- [ ] **Step 3: Verify**

```bash
npm run dev &
sleep 8
curl -s http://bloggo.localhost:3000/ | grep -o '"@type":"MobileApplication"'      # expect one match
curl -s http://bloggo.localhost:3000/ | grep -o '<meta property="og:site_name" content="Bloggo"'  # expect one match
curl -s http://bloggo.localhost:3000/ | grep -c 'developer blog'                    # expect 0
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add src/bloggo/components/seo/JsonLd.tsx src/app/bloggo/layout.tsx
git commit -m "feat(bloggo): rewrite layout SEO metadata and add MobileApplication JSON-LD"
```

---

### Task 5: Canonical URLs on existing pages

**Files:**

- Modify: `src/app/bloggo/page.tsx` (top of file, after imports)
- Modify: `src/app/bloggo/features/page.tsx:8-12`
- Modify: `src/app/bloggo/privacy/page.tsx` (metadata export)
- Modify: `src/app/bloggo/terms/page.tsx` (metadata export)
- Create: `src/app/bloggo/pricing/layout.tsx`
- Create: `src/app/bloggo/support/layout.tsx`

**Interfaces:**

- Consumes: `metadataBase` from Task 4 (canonical paths below resolve against it).
- Produces: `<link rel="canonical">` on every existing public bloggo page.

- [ ] **Step 1: Landing page** — in `src/app/bloggo/page.tsx`, add after the existing imports (do not touch anything else):

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
```

- [ ] **Step 2: Features page** — in `src/app/bloggo/features/page.tsx`, replace the existing metadata export:

```ts
export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore Bloggo's powerful features for writers and developers — rich editor, analytics, custom domains, and more.",
};
```

with:

```ts
export const metadata: Metadata = {
  title: "Features",
  description:
    "Everything Bloggo does with your photos — automatic trip detection, place grouping, instant blog drafts, and carousel, PDF, and video export.",
  alternates: { canonical: "/features" },
};
```

- [ ] **Step 3: Privacy and terms** — in each file, add an `alternates` line inside the existing `metadata` object literal (keep title/description as they are):

`src/app/bloggo/privacy/page.tsx`:

```ts
  alternates: { canonical: "/privacy" },
```

`src/app/bloggo/terms/page.tsx`:

```ts
  alternates: { canonical: "/terms" },
```

- [ ] **Step 4: Pricing layout** — create `src/app/bloggo/pricing/layout.tsx` (the page is `"use client"` and cannot export metadata itself):

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Bloggo is free to download. Try it as a guest, or sign in with a free account for unlimited blogs and exports.",
  alternates: { canonical: "/pricing" },
};

export default function BloggoPricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

- [ ] **Step 5: Support layout** — create `src/app/bloggo/support/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with Bloggo. Browse common questions or contact us — we read every message.",
  alternates: { canonical: "/support" },
};

export default function BloggoSupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

- [ ] **Step 6: Verify**

```bash
npm run dev &
sleep 8
for p in "" features pricing support privacy terms; do
  curl -s "http://bloggo.localhost:3000/$p" | grep -o 'rel="canonical" href="[^"]*"'
done
kill %1
```

Expected output (one line each):

```
rel="canonical" href="https://bloggo.linkedspaces.com/"
rel="canonical" href="https://bloggo.linkedspaces.com/features"
rel="canonical" href="https://bloggo.linkedspaces.com/pricing"
rel="canonical" href="https://bloggo.linkedspaces.com/support"
rel="canonical" href="https://bloggo.linkedspaces.com/privacy"
rel="canonical" href="https://bloggo.linkedspaces.com/terms"
```

- [ ] **Step 7: Commit**

```bash
git add src/app/bloggo/page.tsx src/app/bloggo/features/page.tsx src/app/bloggo/privacy/page.tsx src/app/bloggo/terms/page.tsx src/app/bloggo/pricing/layout.tsx src/app/bloggo/support/layout.tsx
git commit -m "feat(bloggo): add canonical URLs and fix stale page metadata"
```

---

### Task 6: AppStoreBadge component + `/how-it-works` pillar page

**Files:**

- Create: `src/bloggo/components/marketing/AppStoreBadge.tsx`
- Create: `src/app/bloggo/how-it-works/page.tsx`

**Interfaces:**

- Consumes: `JsonLd` from Task 4; screenshots from Task 2; `/images/app-store-badge.png` (existing asset).
- Produces: `AppStoreBadge` — `export default function AppStoreBadge({ className = "" }: { className?: string })` — imported by Task 8 pages from `@/bloggo/components/marketing/AppStoreBadge`. Route `/how-it-works`. FAQ answers link to guide slugs created in Task 7 — links 404 until Task 8 ships, which is fine within the same branch.

- [ ] **Step 1: Create `src/bloggo/components/marketing/AppStoreBadge.tsx`**

```tsx
const APP_STORE_URL = "https://apps.apple.com/us/app/bloggo/id6759849314";

export default function AppStoreBadge({
  className = "",
}: {
  className?: string;
}) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download Bloggo on the App Store"
      className={className}
    >
      <img
        src="/images/app-store-badge.png"
        alt="Download on the App Store"
        className="h-[54px] w-auto"
      />
    </a>
  );
}
```

(Plain `<img>` matches the existing landing-page pattern for this same asset.)

- [ ] **Step 2: Create `src/app/bloggo/how-it-works/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Container from "@/bloggo/components/ui/Container";
import Card from "@/bloggo/components/ui/Card";
import Badge from "@/bloggo/components/ui/Badge";
import SectionHeader from "@/bloggo/components/ui/SectionHeader";
import JsonLd from "@/bloggo/components/seo/JsonLd";
import AppStoreBadge from "@/bloggo/components/marketing/AppStoreBadge";

const BASE = "/bloggo";

export const metadata: Metadata = {
  title: "How it works – turn photos into a travel blog",
  description:
    "Bloggo is an AI travel journal for iPhone. See how it finds trips in your camera roll, groups photos by place, and drafts a travel blog in seconds.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    number: "01",
    title: "Bloggo finds the trips in your camera roll",
    body: "Open Bloggo and tap 'Tap to Blog'. It scans your photo library on your device, using time and location metadata to detect when you were traveling. Every trip appears in a list with its dates, city, and photo count — from a three-week tour to a Saturday in the next town over.",
    screenshot: {
      src: "/bloggo/screenshots/automatic-trip-detection.png",
      alt: "Bloggo's Your Memories screen listing trips detected from the camera roll, grouped by year, with a Create Blog button",
    },
  },
  {
    number: "02",
    title: "Your photos are grouped by place",
    body: "Pick a trip and Bloggo clusters its photos by the places you visited, in the order you visited them. Each day gets a route map with numbered stops and the distances between them, so the shape of the day is visible before you write a word.",
    screenshot: {
      src: "/bloggo/screenshots/trip-route-map.png",
      alt: "A day route map in Bloggo with numbered place stops and distances between them",
    },
  },
  {
    number: "03",
    title: "You get a structured blog draft in seconds",
    body: "Bloggo turns the grouped photos into a blog draft: a cover with your trip title and map, a page per day, and a card per place with your photos already in order. Describe each day in a sentence, tell the story behind a photo, and the draft becomes yours.",
    screenshot: {
      src: "/bloggo/screenshots/write-your-travel-story.png",
      alt: "Bloggo's editor showing a day summary field, a place card, and photo captions ready to edit",
    },
  },
];

const exportOptions = [
  {
    icon: "🖼️",
    title: "Instagram carousel",
    body: "Ready-made slides with covers, maps, and place highlights, in 4:5 or 9:16.",
    href: `${BASE}/guides/instagram-carousel-from-travel-photos`,
  },
  {
    icon: "📖",
    title: "PDF storybook",
    body: "A printable travel photo book from your blog, in one tap.",
    href: `${BASE}/guides/travel-photo-book-from-iphone`,
  },
  {
    icon: "🎬",
    title: "Video slideshow",
    body: "A slideshow video with music, ready for reels and stories.",
    href: `${BASE}/guides/travel-video-slideshow-with-music`,
  },
];

const faqs = [
  {
    question: "Does Bloggo upload my photos?",
    answer:
      "No. Bloggo reads photo metadata like time and location on your device to organize trips. Your photos are never uploaded, and blog drafts stay on your iPhone unless you export or publish them.",
    learnMore: {
      href: `${BASE}/guides/private-travel-journal-app`,
      label: "Private travel journal",
    },
  },
  {
    question: "How does Bloggo know where my photos were taken?",
    answer:
      "Your iPhone stores a timestamp and location with every photo. Bloggo groups photos into trips and places from that metadata — no manual sorting, no uploads.",
    learnMore: {
      href: `${BASE}/guides/organize-travel-photos-by-trip`,
      label: "Organize photos by trip",
    },
  },
  {
    question: "Can I make an Instagram carousel from my trip photos?",
    answer:
      "Yes. Bloggo exports your blog as Instagram-ready slides — cover pages, maps, and place highlights included — in 4:5 or 9:16. Save them to your camera roll or share them directly.",
    learnMore: {
      href: `${BASE}/guides/instagram-carousel-from-travel-photos`,
      label: "Make a carousel",
    },
  },
  {
    question: "Can I turn a trip into a photo book?",
    answer:
      "Yes. One tap exports your blog as a printable PDF storybook with your photos, maps, and captions laid out for reading or printing.",
    learnMore: {
      href: `${BASE}/guides/travel-photo-book-from-iphone`,
      label: "Create a photo book",
    },
  },
  {
    question: "Can I make a video slideshow with music?",
    answer:
      "Yes. Bloggo generates a slideshow video from your blog, set to music and ready to share to reels, stories, or anywhere else.",
    learnMore: {
      href: `${BASE}/guides/travel-video-slideshow-with-music`,
      label: "Make a video slideshow",
    },
  },
  {
    question: "Does it work for everyday photos, not just trips?",
    answer:
      "Yes. Bloggo captures everyday moments too — the new café, Sunday's hike, last week's dinner — and groups them by place just like travel.",
    learnMore: {
      href: `${BASE}/guides/photo-journal-app-for-everyday-life`,
      label: "Photo journal for everyday life",
    },
  },
  {
    question: "Can I see a map of everywhere I've been?",
    answer:
      "Yes. Bloggo builds a private places-visited map from your photos, browsable by year and category, entirely on your device.",
    learnMore: {
      href: `${BASE}/guides/travel-map-of-places-visited`,
      label: "Map your travels",
    },
  },
  {
    question: "What about photos from years ago?",
    answer:
      "Bloggo scans your whole camera roll, so trips and everyday days from years back can become entries today.",
    learnMore: {
      href: `${BASE}/guides/turn-camera-roll-into-diary`,
      label: "Turn your camera roll into a diary",
    },
  },
  {
    question: "Can I edit the blog Bloggo creates?",
    answer:
      "Yes. Every title, caption, and photo is editable. The draft is a starting point — the structure is done, the words are yours.",
    learnMore: {
      href: `${BASE}/guides/turn-photos-into-travel-blog`,
      label: "Turn photos into a travel blog",
    },
  },
  {
    question: "Is Bloggo free?",
    answer:
      "Bloggo is free to download. You can try it as a guest — save one blog and export once — and a free account removes those caps.",
    learnMore: { href: `${BASE}/pricing`, label: "Pricing" },
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to turn your photos into a travel blog with Bloggo",
  step: steps.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.body,
  })),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={howToJsonLd} />
      <JsonLd data={faqJsonLd} />

      <section className="pt-20 pb-16 border-b border-[var(--bloggo-border)]">
        <Container className="flex flex-col items-center text-center gap-6">
          <Badge variant="violet">How it works</Badge>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight max-w-3xl">
            Turn your photos into a{" "}
            <span className="gradient-text">travel blog</span>
          </h1>
          <p className="text-lg text-[var(--bloggo-text-secondary)] max-w-2xl">
            Bloggo is an AI travel journal for iPhone. It finds trips in your
            camera roll, groups them by place, and drafts your blog — no blank
            page, no manual sorting.
          </p>
          <AppStoreBadge />
        </Container>
      </section>

      <section className="py-20 border-b border-[var(--bloggo-border)]">
        <Container size="lg" className="flex flex-col gap-16">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={[
                "flex flex-col items-center gap-10 lg:gap-16",
                i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row",
              ].join(" ")}
            >
              <div className="flex-1 flex flex-col gap-4">
                <span className="text-sm font-bold tracking-widest text-sky-500">
                  {step.number}
                </span>
                <h2 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
                  {step.title}
                </h2>
                <p className="text-[var(--bloggo-text-secondary)] leading-relaxed">
                  {step.body}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Image
                  src={step.screenshot.src}
                  alt={step.screenshot.alt}
                  width={310}
                  height={671}
                  className="rounded-3xl border border-[var(--bloggo-border)] shadow-xl"
                />
              </div>
            </div>
          ))}
        </Container>
      </section>

      <section className="py-20 border-b border-[var(--bloggo-border)]">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Share it"
            title="One trip, three ways to share"
            subtitle="Every blog exports as a carousel, a photo book, or a video — you choose the shape."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exportOptions.map((option) => (
              <Link key={option.href} href={option.href} className="group">
                <Card padding="lg" hover className="h-full flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-2xl">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--bloggo-text-primary)] mb-2">
                      {option.title}
                    </h3>
                    <p className="text-sm text-[var(--bloggo-text-secondary)]">
                      {option.body}
                    </p>
                  </div>
                  <span className="mt-auto text-sm font-semibold text-sky-500 group-hover:text-sky-400">
                    Read the guide →
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 border-b border-[var(--bloggo-border)]">
        <Container size="md" className="flex flex-col gap-12">
          <SectionHeader eyebrow="FAQ" title="Questions, answered" />
          <div className="flex flex-col gap-4">
            {faqs.map((faq) => (
              <Card
                key={faq.question}
                padding="lg"
                className="flex flex-col gap-3"
              >
                <h3 className="text-lg font-bold text-[var(--bloggo-text-primary)]">
                  {faq.question}
                </h3>
                <p className="text-sm text-[var(--bloggo-text-secondary)] leading-relaxed">
                  {faq.answer}
                </p>
                <Link
                  href={faq.learnMore.href}
                  className="text-sm font-semibold text-sky-500 hover:text-sky-400 w-fit"
                >
                  Learn more: {faq.learnMore.label} →
                </Link>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container
          size="md"
          className="text-center flex flex-col items-center gap-6"
        >
          <h2 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
            Your next blog is already in your camera roll
          </h2>
          <p className="text-[var(--bloggo-text-secondary)]">
            Download Bloggo and turn your last trip into a blog in seconds.
          </p>
          <AppStoreBadge />
        </Container>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npm run dev &
sleep 8
curl -s http://bloggo.localhost:3000/how-it-works | grep -c 'application/ld+json'   # expect 3 (MobileApplication + HowTo + FAQPage)
curl -s http://bloggo.localhost:3000/how-it-works | grep -o 'rel="canonical" href="[^"]*"'  # expect https://bloggo.linkedspaces.com/how-it-works
curl -s http://bloggo.localhost:3000/how-it-works | grep -o '"@type":"Question"' | wc -l    # expect 10
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add src/bloggo/components/marketing/AppStoreBadge.tsx src/app/bloggo/how-it-works/page.tsx
git commit -m "feat(bloggo): add how-it-works pillar page with HowTo and FAQ JSON-LD"
```

---

### Task 7: Guide content data — `src/app/bloggo/guides/guides.ts`

**Files:**

- Create: `src/app/bloggo/guides/guides.ts`

**Interfaces:**

- Consumes: screenshot paths from Task 2.
- Produces (used by Tasks 8 and 9):
  - `export interface Guide { slug: string; keyword: string; title: string; metaDescription: string; intro: string[]; steps: { title: string; body: string }[]; faqs: { question: string; answer: string }[]; screenshot: { src: string; alt: string }; related: string[] }`
  - `export const GUIDES: Guide[]` (9 entries)
  - `export function getGuide(slug: string): Guide | undefined`

- [ ] **Step 1: Create the file** with exactly this content:

```ts
export interface Guide {
  slug: string;
  keyword: string;
  title: string;
  metaDescription: string;
  intro: string[];
  steps: { title: string; body: string }[];
  faqs: { question: string; answer: string }[];
  screenshot: { src: string; alt: string };
  related: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: "turn-photos-into-travel-blog",
    keyword: "how to turn photos into a travel blog",
    title: "How to turn photos into a travel blog",
    metaDescription:
      "Turn your trip photos into a travel blog automatically. Bloggo groups your camera roll by day and place and writes a structured draft in seconds.",
    intro: [
      "The fastest way to turn photos into a travel blog is to let the photos do the structuring. Your camera roll already knows when and where every shot happened — the right app turns that metadata into days, places, and a story outline without any manual sorting.",
      "Bloggo does exactly this on your iPhone. It finds trips in your camera roll, groups photos by place, and hands you a structured blog draft — cover, days, places, and captions — ready for your voice. Your photos never leave your device.",
    ],
    steps: [
      {
        title: "Open Bloggo and tap 'Tap to Blog'",
        body: "Bloggo scans your camera roll on-device and lists every trip it finds, grouped by year. A weekend away or a three-week tour — each shows up with its dates, location, and photo count.",
      },
      {
        title: "Pick the trip you want to tell",
        body: "Select one trip, or merge several memories into a single blog. Tap 'Create Blog' and Bloggo builds the draft.",
      },
      {
        title: "Review the draft",
        body: "You get a cover with your trip title and map, a page per day, and place cards with your photos already in order. Nothing to arrange.",
      },
      {
        title: "Add your voice",
        body: "Describe each day in a sentence, tap a photo to tell its story, and save. The structure is done; the words are yours.",
      },
    ],
    faqs: [
      {
        question: "Do I have to sort my photos first?",
        answer:
          "No. Bloggo reads the time and location data your iPhone already stores and does the sorting for you.",
      },
      {
        question: "Does Bloggo upload my photos to create the blog?",
        answer:
          "No. Trip detection and blog creation happen on your device. Photos are only shared if you export or publish a blog yourself.",
      },
      {
        question: "Can I edit the blog after it's created?",
        answer:
          "Yes. Every title, caption, and photo is editable. The draft is a starting point, not a final cut.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/turn-photos-into-travel-blog.png",
      alt: "A finished Bloggo travel blog cover for a winter trip, with trip dates, moment count, and a route map",
    },
    related: [
      "organize-travel-photos-by-trip",
      "instagram-carousel-from-travel-photos",
      "turn-camera-roll-into-diary",
    ],
  },
  {
    slug: "organize-travel-photos-by-trip",
    keyword: "organize travel photos by trip automatically",
    title: "How to organize travel photos by trip, automatically",
    metaDescription:
      "Stop sorting albums by hand. Bloggo detects trips in your camera roll using time and location and organizes travel photos by trip and place.",
    intro: [
      "Organizing travel photos by hand means scrolling through thousands of shots and dragging them into albums — most people give up halfway. Automatic organization uses the timestamps and GPS data already attached to your photos, so the sorting is done before you start.",
      "Bloggo scans your camera roll on your iPhone, detects when you were traveling, and groups every trip's photos by day and place. No albums, no tagging, no uploads.",
    ],
    steps: [
      {
        title: "Let Bloggo scan your camera roll",
        body: "Open Bloggo and grant photo access. The scan runs on-device and finds trips using time and location patterns.",
      },
      {
        title: "Browse your trips by year",
        body: "The 'Your Memories' screen lists every detected trip with its dates, city, and photo count — three trips or 35, all found for you.",
      },
      {
        title: "Open a trip to see it grouped by place",
        body: "Inside each trip, photos are clustered by the places you visited, in the order you visited them, with the distances in between.",
      },
      {
        title: "Rescan whenever you like",
        body: "New photos, new trips. Tap 'Rescan memories' after your next trip and it appears in the list.",
      },
    ],
    faqs: [
      {
        question: "What if a trip is split in two?",
        answer:
          "Select both memories and merge them into one blog — a split trip is a two-tap fix.",
      },
      {
        question: "Does this work on old trips?",
        answer:
          "Yes. Bloggo scans your whole camera roll, so trips from years ago show up alongside last weekend.",
      },
      {
        question: "Is my location data shared?",
        answer:
          "No. Bloggo reads photo metadata on your device to group trips. Nothing is uploaded.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/automatic-trip-detection.png",
      alt: "Bloggo's Your Memories screen with trips detected automatically from the camera roll, grouped by year",
    },
    related: [
      "turn-photos-into-travel-blog",
      "travel-map-of-places-visited",
      "turn-camera-roll-into-diary",
    ],
  },
  {
    slug: "instagram-carousel-from-travel-photos",
    keyword: "make an Instagram carousel from travel photos",
    title: "How to make an Instagram carousel from travel photos",
    metaDescription:
      "Turn trip photos into Instagram-ready carousel slides — covers, maps, and place highlights in 4:5 or 9:16 — straight from your camera roll with Bloggo.",
    intro: [
      "A good travel carousel needs more than ten photos in a row: a cover slide, a sense of place, and a consistent look. Building that in a photo editor takes an evening per trip.",
      "Bloggo exports your trip as ready-made carousel slides — cover pages, maps, and place highlights included — in Instagram's 4:5 or 9:16 formats. You pick the trip; it builds the slides.",
    ],
    steps: [
      {
        title: "Create your trip blog",
        body: "Tap 'Tap to Blog', pick the trip, and Bloggo drafts it with days, places, and captions.",
      },
      {
        title: "Open 'Share Your Blog'",
        body: "From the blog cover, tap 'Share Your Blog' and choose 'Post to Social Media'.",
      },
      {
        title: "Pick your format",
        body: "Choose 4:5 for feed carousels or 9:16 for stories and vertical formats. Slides include your cover, route map, and place highlights.",
      },
      {
        title: "Download or share directly",
        body: "Save the slides to your camera roll, or share them straight into Instagram, TikTok, or any other app.",
      },
    ],
    faqs: [
      {
        question: "Which aspect ratios are supported?",
        answer: "4:5 for feed posts and 9:16 for stories and vertical formats.",
      },
      {
        question: "Can I choose which places make the cut?",
        answer:
          "Yes. The slides follow your blog, so edit the blog first and the export matches it.",
      },
      {
        question: "Do I need an account to export?",
        answer:
          "You can try Bloggo as a guest and export once; a free account removes the guest caps.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/share-carousel-pdf-video.png",
      alt: "Bloggo's share sheet with options to post to social media, stitch reels, and export as PDF",
    },
    related: [
      "travel-video-slideshow-with-music",
      "travel-photo-book-from-iphone",
      "turn-photos-into-travel-blog",
    ],
  },
  {
    slug: "travel-photo-book-from-iphone",
    keyword: "create a travel photo book / PDF on iPhone",
    title: "How to create a travel photo book on your iPhone",
    metaDescription:
      "Make a printable travel photo book from your iPhone in one tap. Bloggo turns your trip into a PDF storybook with days, places, maps, and captions.",
    intro: [
      "You don't need desktop software or a photo-book service to get a printable record of a trip. If your photos are organized by day and place, a PDF storybook is one tap away.",
      "Bloggo drafts your trip as a structured blog, then exports it as a PDF storybook — cover, days, places, maps, and your captions — ready for reading, printing, or sending to family.",
    ],
    steps: [
      {
        title: "Turn the trip into a blog",
        body: "Tap 'Tap to Blog' and pick the trip. Bloggo builds the draft with your photos grouped by day and place.",
      },
      {
        title: "Add the words you want to keep",
        body: "Captions and day summaries end up in the book, so a sentence per day goes a long way.",
      },
      {
        title: "Export as PDF",
        body: "Tap 'Share Your Blog', then 'Export as PDF'. Bloggo lays out the storybook in one tap.",
      },
      {
        title: "Print it or send it",
        body: "Save the PDF, print it at home or a print shop, or send it to someone who was there.",
      },
    ],
    faqs: [
      {
        question: "Is the PDF export free?",
        answer:
          "Bloggo is free to download. Guests can export once; a free account unlocks unlimited exports.",
      },
      {
        question: "Are maps included?",
        answer:
          "Yes. Your trip's maps and routes are part of the storybook layout.",
      },
      {
        question: "Does the book leave my device?",
        answer: "Only when you share it. The PDF is generated on your iPhone.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/structured-travel-blog.png",
      alt: "A structured Bloggo travel blog with place cards, captions, and photos — the layout that becomes the PDF storybook",
    },
    related: [
      "turn-photos-into-travel-blog",
      "travel-video-slideshow-with-music",
      "private-travel-journal-app",
    ],
  },
  {
    slug: "travel-video-slideshow-with-music",
    keyword: "trip photos into a video slideshow with music",
    title: "How to turn trip photos into a video slideshow with music",
    metaDescription:
      "Turn your trip photos into a shareable video slideshow with music in one tap. Bloggo builds the video from your blog — no editing timeline required.",
    intro: [
      "A trip video shouldn't require a video editor. If your photos are already organized into a story, a slideshow with music is a rendering step, not a project.",
      "Bloggo generates a video slideshow from your trip blog — your photos in story order, set to music, ready to share — in one tap.",
    ],
    steps: [
      {
        title: "Create the trip blog first",
        body: "Tap 'Tap to Blog' and pick the trip. The video follows your blog's structure, so the story order is already set.",
      },
      {
        title: "Curate the moments",
        body: "Trim places or photos you don't want before exporting — the video matches the blog.",
      },
      {
        title: "Generate the video",
        body: "Tap 'Share Your Blog', then 'Stitch Reels'. Bloggo renders a slideshow video with music from your moments.",
      },
      {
        title: "Share it anywhere",
        body: "Save it to your camera roll or share directly to TikTok, Instagram, or wherever your people are.",
      },
    ],
    faqs: [
      {
        question: "Can I use it for reels and stories?",
        answer: "Yes. The vertical format is made for reels and stories.",
      },
      {
        question: "Do I pick the photos?",
        answer:
          "You control the blog, and the video follows it — hide a place or photo and it stays out of the video.",
      },
      {
        question: "Is the video rendered on my phone?",
        answer:
          "Yes. The slideshow is generated on your device, like the rest of your blog.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/share-carousel-pdf-video.png",
      alt: "Bloggo's share sheet with 'Stitch Reels' for generating a video slideshow from trip moments",
    },
    related: [
      "instagram-carousel-from-travel-photos",
      "travel-photo-book-from-iphone",
      "turn-photos-into-travel-blog",
    ],
  },
  {
    slug: "private-travel-journal-app",
    keyword: "private travel journal app that doesn't upload photos",
    title: "A private travel journal app that doesn't upload your photos",
    metaDescription:
      "Bloggo is a private, on-device travel journal. Your photos and blog drafts stay on your iPhone unless you choose to share — no feed, no followers, no uploads.",
    intro: [
      "Most journal apps are social apps in disguise: your photos go to a server, and your memories become content. If you want a travel journal that's actually yours, the test is simple — does it work without uploading anything?",
      "Bloggo is local first and private by default. Trip detection, blog drafts, maps — all built on your device from photo metadata. Nothing is shared unless you export or publish it yourself.",
    ],
    steps: [
      {
        title: "Start as a guest",
        body: "No account needed. Open Bloggo, let it scan your camera roll on-device, and create your first blog.",
      },
      {
        title: "Journal without a feed",
        body: "There are no followers, likes, or view counts. Your blogs are a private space, organized by trip and place.",
      },
      {
        title: "Keep everything on your iPhone",
        body: "Drafts live on your device. Sign in with a free account to lift the guest caps — the local-first privacy stays the same.",
      },
      {
        title: "Share only what you choose",
        body: "Export a carousel, PDF, or video when you want to share a trip. Until then, it's your eyes only.",
      },
    ],
    faqs: [
      {
        question: "Does Bloggo upload my photos?",
        answer:
          "No. Bloggo uses photo metadata like time and location, on your device, to organize trips. Your photos are never uploaded.",
      },
      {
        question: "Do I need an account?",
        answer:
          "No. Guests can save one blog and export once; a free account removes those caps.",
      },
      {
        question: "Is there a social feed?",
        answer: "No. Bloggo has no feed, follower counts, or likes.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/private-on-device-travel-map.png",
      alt: "A private on-device map in Bloggo showing photo pins across the United States",
    },
    related: [
      "travel-map-of-places-visited",
      "turn-camera-roll-into-diary",
      "photo-journal-app-for-everyday-life",
    ],
  },
  {
    slug: "travel-map-of-places-visited",
    keyword: "make a map of places you've traveled",
    title: "How to make a map of the places you've traveled",
    metaDescription:
      "See every place you've been on one map, built automatically from your photos. Bloggo tracks places visited by year and category — private and on-device.",
    intro: [
      "The best record of where you've been is already in your pocket: every photo with location data is a pin waiting for a map. You shouldn't have to place them by hand.",
      "Bloggo turns your camera roll into a places-visited tracker — every restaurant, trail, and city you photographed, browsable by year and category, plotted on a private map.",
    ],
    steps: [
      {
        title: "Let Bloggo scan your photos",
        body: "The on-device scan reads the location stored in each photo and builds your places list from it.",
      },
      {
        title: "Open 'Places Visited'",
        body: "Every place appears as a card with its photo, date, and category — skiing, restaurants, hiking, cafés.",
      },
      {
        title: "Filter by year or category",
        body: "Jump to 2024's restaurants or every trail you've ever hiked. The filters make the archive browsable.",
      },
      {
        title: "Switch to the map view",
        body: "See your pins across the country, and tap any trip to relive it.",
      },
    ],
    faqs: [
      {
        question: "Where does the location data come from?",
        answer:
          "From the metadata your iPhone saves with each photo. Bloggo reads it on your device.",
      },
      {
        question: "Can other people see my map?",
        answer:
          "No. The map is private and on-device. It's a record for you, not a feed for others.",
      },
      {
        question: "Does Bloggo track me in real time?",
        answer:
          "No. Bloggo only reads the location stored in photos you've already taken.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/places-visited-tracker.png",
      alt: "Bloggo's Places Visited screen with place cards filtered by year and category",
    },
    related: [
      "organize-travel-photos-by-trip",
      "private-travel-journal-app",
      "turn-photos-into-travel-blog",
    ],
  },
  {
    slug: "photo-journal-app-for-everyday-life",
    keyword: "photo journal app for everyday life",
    title: "A photo journal app for everyday life, not just trips",
    metaDescription:
      "Bloggo turns everyday photos — lunches, walks, weekends — into a photo journal organized by place. Automatic, private, and built from your camera roll.",
    intro: [
      "Most photo journals die because they demand daily effort: open the app, pick photos, write something. A journal should build itself from what you already capture.",
      "Bloggo isn't only for vacations. It groups your everyday photos by place — the new café, Sunday's hike, last week's dinner — into blogs you can keep private or share.",
    ],
    steps: [
      {
        title: "Keep taking photos like you already do",
        body: "Your camera roll is the journal's raw material. No check-ins, no daily prompts.",
      },
      {
        title: "Let Bloggo group your moments",
        body: "The on-device scan organizes photos by time and place, so everyday memories show up alongside the big trips.",
      },
      {
        title: "Blog on the go",
        body: "Use Bloggo's in-app camera and new photos flow straight into a draft while the day is fresh.",
      },
      {
        title: "Add a line when it matters",
        body: "'Describe your day in a sentence' is the whole ask. Some days, that's plenty.",
      },
    ],
    faqs: [
      {
        question: "Do short outings count?",
        answer:
          "Yes. Bloggo captures everyday moments and local places, not just multi-day travel.",
      },
      {
        question: "Can I journal without writing much?",
        answer:
          "Yes. The photos and places carry the structure; a sentence per day is enough.",
      },
      {
        question: "Is my everyday journal private?",
        answer:
          "Yes. Drafts stay on your device unless you export or publish them.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/my-blogs-home.png",
      alt: "Bloggo's My Blogs home screen with recent everyday blogs and the Tap to Blog shortcut",
    },
    related: [
      "turn-camera-roll-into-diary",
      "private-travel-journal-app",
      "travel-map-of-places-visited",
    ],
  },
  {
    slug: "turn-camera-roll-into-diary",
    keyword: "turn your camera roll into a diary",
    title: "How to turn your camera roll into a diary",
    metaDescription:
      "Your camera roll is already a diary — it just needs structure. Bloggo turns photos into dated, place-organized diary entries you can write on in seconds.",
    intro: [
      "If you take photos most days, you already keep a diary — it's just unstructured. Every shot carries a date, a place, and a memory; a diary is what you get when something organizes them and leaves room for your words.",
      "Bloggo turns your camera roll into exactly that: dated entries organized by place, with space for a sentence about the day and a story for any photo. Written on your device, kept on your device.",
    ],
    steps: [
      {
        title: "Scan your camera roll",
        body: "Open Bloggo and let the on-device scan find your days and trips. Years of photos become browsable entries.",
      },
      {
        title: "Open a day",
        body: "Each entry starts with your photos in order, grouped by where you were, with the date and even that day's weather.",
      },
      {
        title: "Describe the day in a sentence",
        body: "One line at the top of each day. That's the entire writing commitment.",
      },
      {
        title: "Tell one photo's story",
        body: "'What's the one thing you'd want to remember?' Tap a photo and answer.",
      },
    ],
    faqs: [
      {
        question: "Do I have to write every day?",
        answer: "No. The photos keep the record; write when a day deserves it.",
      },
      {
        question: "Can I backfill old days?",
        answer:
          "Yes. Bloggo scans your whole camera roll, so last year's days can become entries today.",
      },
      {
        question: "Is my diary private?",
        answer:
          "Yes. Entries live on your device and are never uploaded. Sharing is always your choice.",
      },
    ],
    screenshot: {
      src: "/bloggo/screenshots/write-your-travel-story.png",
      alt: "Bloggo's diary-style editor with a day summary field and a photo story prompt",
    },
    related: [
      "photo-journal-app-for-everyday-life",
      "turn-photos-into-travel-blog",
      "private-travel-journal-app",
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
```

- [ ] **Step 2: Verify it type-checks and all related-slugs resolve**

```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | grep guides
```

Expected: no output (no errors mentioning guides).

```bash
node -e "
const ts = require('fs').readFileSync('src/app/bloggo/guides/guides.ts','utf8');
const slugs = [...ts.matchAll(/^    slug: \"([a-z-]+)\",$/gm)].map(m => m[1]);
const related = [...ts.matchAll(/^      \"([a-z-]+)\",$/gm)].map(m => m[1]);
const bad = related.filter(r => !slugs.includes(r));
console.log('slugs:', slugs.length, 'bad related:', bad);
"
```

Expected: `slugs: 9 bad related: []`

- [ ] **Step 3: Commit**

```bash
git add src/app/bloggo/guides/guides.ts
git commit -m "feat(bloggo): add guide content data for nine SEO guides"
```

---

### Task 8: Guides index + `[slug]` template pages

**Files:**

- Create: `src/app/bloggo/guides/page.tsx`
- Create: `src/app/bloggo/guides/[slug]/page.tsx`

**Interfaces:**

- Consumes: `GUIDES`, `getGuide`, `Guide` from Task 7 (`../guides` / `../../guides` relative or `@/app/bloggo/guides/guides`); `JsonLd` (Task 4); `AppStoreBadge` (Task 6).
- Produces: routes `/guides` and `/guides/<slug>` (9 static pages). Unknown slug → `notFound()`.

- [ ] **Step 1: Create `src/app/bloggo/guides/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/bloggo/components/ui/Container";
import Card from "@/bloggo/components/ui/Card";
import Badge from "@/bloggo/components/ui/Badge";
import AppStoreBadge from "@/bloggo/components/marketing/AppStoreBadge";
import { GUIDES } from "./guides";

const BASE = "/bloggo";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Practical guides for turning your camera roll into travel blogs, Instagram carousels, photo books, videos, and maps with Bloggo.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndexPage() {
  return (
    <>
      <section className="pt-20 pb-16 border-b border-[var(--bloggo-border)]">
        <Container className="flex flex-col items-center text-center gap-6">
          <Badge variant="violet">Guides</Badge>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight max-w-3xl">
            Get more from your{" "}
            <span className="gradient-text">travel photos</span>
          </h1>
          <p className="text-lg text-[var(--bloggo-text-secondary)] max-w-2xl">
            Practical guides for turning your camera roll into blogs, carousels,
            photo books, videos, and maps.
          </p>
        </Container>
      </section>

      <section className="py-20 border-b border-[var(--bloggo-border)]">
        <Container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`${BASE}/guides/${guide.slug}`}
              className="group"
            >
              <Card padding="lg" hover className="h-full flex flex-col gap-3">
                <h2 className="text-lg font-bold text-[var(--bloggo-text-primary)]">
                  {guide.title}
                </h2>
                <p className="text-sm text-[var(--bloggo-text-secondary)] leading-relaxed">
                  {guide.metaDescription}
                </p>
                <span className="mt-auto text-sm font-semibold text-sky-500 group-hover:text-sky-400">
                  Read the guide →
                </span>
              </Card>
            </Link>
          ))}
        </Container>
      </section>

      <section className="py-20">
        <Container
          size="md"
          className="text-center flex flex-col items-center gap-6"
        >
          <h2 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
            Skip the reading — try it on your own photos
          </h2>
          <p className="text-[var(--bloggo-text-secondary)]">
            Bloggo is free to download. Your first blog takes seconds.
          </p>
          <AppStoreBadge />
        </Container>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Create `src/app/bloggo/guides/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/bloggo/components/ui/Container";
import Card from "@/bloggo/components/ui/Card";
import JsonLd from "@/bloggo/components/seo/JsonLd";
import AppStoreBadge from "@/bloggo/components/marketing/AppStoreBadge";
import { GUIDES, getGuide } from "../guides";

const BASE = "/bloggo";
const SITE_URL = "https://bloggo.linkedspaces.com";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${guide.slug}` },
  };
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const related = guide.related.flatMap((relatedSlug) => {
    const relatedGuide = getGuide(relatedSlug);
    return relatedGuide ? [relatedGuide] : [];
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    image: `${SITE_URL}${guide.screenshot.src}`,
    author: { "@type": "Organization", name: "LinkedSpaces LLC" },
    publisher: {
      "@type": "Organization",
      name: "Bloggo",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/bloggo-icon.png` },
    },
    mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Bloggo",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: `${SITE_URL}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: `${SITE_URL}/guides/${guide.slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <article>
        <section className="pt-16 pb-12 border-b border-[var(--bloggo-border)]">
          <Container size="md" className="flex flex-col gap-6">
            <nav
              aria-label="Breadcrumb"
              className="text-sm text-[var(--bloggo-text-muted)]"
            >
              <Link
                href={BASE}
                className="hover:text-[var(--bloggo-text-primary)]"
              >
                Bloggo
              </Link>
              <span className="mx-2">/</span>
              <Link
                href={`${BASE}/guides`}
                className="hover:text-[var(--bloggo-text-primary)]"
              >
                Guides
              </Link>
            </nav>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              {guide.title}
            </h1>
            {guide.intro.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="text-lg text-[var(--bloggo-text-secondary)] leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
            <AppStoreBadge />
          </Container>
        </section>

        <section className="py-16 border-b border-[var(--bloggo-border)]">
          <Container
            size="lg"
            className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start"
          >
            <div className="flex-1 flex flex-col gap-8">
              <h2 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
                How to do it with Bloggo
              </h2>
              <ol className="flex flex-col gap-8">
                {guide.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/15 text-sky-500 font-bold flex items-center justify-center text-sm">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--bloggo-text-primary)] mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[var(--bloggo-text-secondary)] leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex-shrink-0 mx-auto">
              <Image
                src={guide.screenshot.src}
                alt={guide.screenshot.alt}
                width={310}
                height={671}
                className="rounded-3xl border border-[var(--bloggo-border)] shadow-xl"
              />
            </div>
          </Container>
        </section>

        <section className="py-16 border-b border-[var(--bloggo-border)]">
          <Container size="md" className="flex flex-col gap-8">
            <h2 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
              Common questions
            </h2>
            <div className="flex flex-col gap-4">
              {guide.faqs.map((faq) => (
                <Card
                  key={faq.question}
                  padding="lg"
                  className="flex flex-col gap-2"
                >
                  <h3 className="text-lg font-bold text-[var(--bloggo-text-primary)]">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-[var(--bloggo-text-secondary)] leading-relaxed">
                    {faq.answer}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {related.length > 0 && (
          <section className="py-16 border-b border-[var(--bloggo-border)]">
            <Container size="lg" className="flex flex-col gap-8">
              <h2 className="text-2xl font-bold text-[var(--bloggo-text-primary)]">
                Related guides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((relatedGuide) => (
                  <Link
                    key={relatedGuide.slug}
                    href={`${BASE}/guides/${relatedGuide.slug}`}
                    className="group"
                  >
                    <Card
                      padding="lg"
                      hover
                      className="h-full flex flex-col gap-3"
                    >
                      <h3 className="text-base font-bold text-[var(--bloggo-text-primary)]">
                        {relatedGuide.title}
                      </h3>
                      <span className="mt-auto text-sm font-semibold text-sky-500 group-hover:text-sky-400">
                        Read the guide →
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        )}

        <section className="py-16">
          <Container
            size="md"
            className="text-center flex flex-col items-center gap-6"
          >
            <h2 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
              Try it on your own photos
            </h2>
            <p className="text-[var(--bloggo-text-secondary)]">
              Bloggo is free to download. Your first blog takes seconds.
            </p>
            <AppStoreBadge />
          </Container>
        </section>
      </article>
    </>
  );
}
```

- [ ] **Step 3: Verify all 9 pages build statically**

Run: `npm run build`
Expected: build succeeds; the route table lists `/bloggo/guides/[slug]` as SSG with 9 generated paths (each guide slug shown), plus `/bloggo/guides` and `/bloggo/how-it-works` as static.

- [ ] **Step 4: Verify 404 and JSON-LD behavior**

```bash
npm run dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://bloggo.localhost:3000/guides/not-a-real-guide  # expect 404
curl -s http://bloggo.localhost:3000/guides/turn-photos-into-travel-blog | grep -o '"@type":"Article"'         # expect one match
curl -s http://bloggo.localhost:3000/guides/turn-photos-into-travel-blog | grep -o '"@type":"BreadcrumbList"'  # expect one match
curl -s http://bloggo.localhost:3000/guides/turn-photos-into-travel-blog | grep -o 'rel="canonical" href="[^"]*"'
# expect rel="canonical" href="https://bloggo.linkedspaces.com/guides/turn-photos-into-travel-blog"
kill %1
```

- [ ] **Step 5: Commit**

```bash
git add src/app/bloggo/guides/page.tsx "src/app/bloggo/guides/[slug]/page.tsx"
git commit -m "feat(bloggo): add guides index and data-driven guide pages"
```

---

### Task 9: Sitemap + robots.txt

**Files:**

- Create: `src/app/bloggo/sitemap.ts`
- Modify: `public/robots.txt`

**Interfaces:**

- Consumes: `GUIDES` from Task 7.
- Produces: `/bloggo/sitemap.xml` route → served as `bloggo.linkedspaces.com/sitemap.xml` via the middleware rewrite (Task 3 deliberately did NOT add `/sitemap.xml` to the asset passthrough).

- [ ] **Step 1: Create `src/app/bloggo/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { GUIDES } from "./guides/guides";

const SITE_URL = "https://bloggo.linkedspaces.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/features",
    "/how-it-works",
    "/guides",
    "/pricing",
    "/support",
  ].map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  const guidePages: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...guidePages];
}
```

- [ ] **Step 2: Replace `public/robots.txt`** with:

```
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

Sitemap: https://bloggo.linkedspaces.com/sitemap.xml
```

- [ ] **Step 3: Verify on the bloggo host**

```bash
npm run dev &
sleep 8
curl -s http://bloggo.localhost:3000/sitemap.xml | grep -c "<loc>"        # expect 15 (6 static + 9 guides)
curl -s http://bloggo.localhost:3000/sitemap.xml | grep -o "<loc>https://bloggo.linkedspaces.com/</loc>"  # expect one match
curl -s http://bloggo.localhost:3000/robots.txt | grep Sitemap            # expect the Sitemap line
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add src/app/bloggo/sitemap.ts public/robots.txt
git commit -m "feat(bloggo): add sitemap and robots sitemap directive"
```

---

### Task 10: Navigation — header and footer links

**Files:**

- Modify: `src/bloggo/components/layout/Header.tsx:15-18` (navLinks) and `:260-262` (dropdown filter)
- Modify: `src/bloggo/components/layout/Footer.tsx:9-16` (footerLinks)

**Interfaces:**

- Consumes: routes from Tasks 6 and 8.
- Produces: visible nav entries; no API changes.

- [ ] **Step 1: Header nav links** — in `src/bloggo/components/layout/Header.tsx`, replace:

```ts
const navLinks = [
  { href: `${BASE}/features`, label: "Features" },
  { href: `${BASE}/support`, label: "Support" },
];
```

with:

```ts
const navLinks = [
  { href: `${BASE}/how-it-works`, label: "How it works" },
  { href: `${BASE}/guides`, label: "Guides" },
  { href: `${BASE}/features`, label: "Features" },
  { href: `${BASE}/support`, label: "Support" },
];
```

- [ ] **Step 2: Keep the logged-in dropdown unchanged** — in the same file, the account dropdown currently filters marketing links out with:

```ts
                        {navLinks
                          .filter((link) => link.label !== "Features")
```

Replace that filter so the dropdown still shows only Support (not the two new links):

```ts
                        {navLinks
                          .filter((link) => link.label === "Support")
```

- [ ] **Step 3: Footer Product column** — in `src/bloggo/components/layout/Footer.tsx`, replace:

```ts
const footerLinks = {
  Product: [{ href: `${BASE}/features`, label: "Features" }],
```

with:

```ts
const footerLinks = {
  Product: [
    { href: `${BASE}/features`, label: "Features" },
    { href: `${BASE}/how-it-works`, label: "How it works" },
    { href: `${BASE}/guides`, label: "Guides" },
  ],
```

- [ ] **Step 4: Verify**

```bash
npm run dev &
sleep 8
curl -s http://bloggo.localhost:3000/ | grep -o '>How it works<' | head -2   # expect matches (header + footer)
curl -s http://bloggo.localhost:3000/ | grep -o '>Guides<' | head -2         # expect matches
kill %1
```

- [ ] **Step 5: Commit**

```bash
git add src/bloggo/components/layout/Header.tsx src/bloggo/components/layout/Footer.tsx
git commit -m "feat(bloggo): link how-it-works and guides in header and footer"
```

---

### Task 11: Full verification pass

**Files:** none (verification only; fix anything that fails and amend the relevant commit).

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: succeeds. Route table shows `/bloggo/how-it-works`, `/bloggo/guides`, `/bloggo/guides/[slug]` (9 paths), `/bloggo/sitemap.xml` — all static.

- [ ] **Step 2: Full curl matrix on the bloggo host**

```bash
npm run dev &
sleep 8
for p in "" how-it-works guides guides/turn-photos-into-travel-blog guides/organize-travel-photos-by-trip guides/instagram-carousel-from-travel-photos guides/travel-photo-book-from-iphone guides/travel-video-slideshow-with-music guides/private-travel-journal-app guides/travel-map-of-places-visited guides/photo-journal-app-for-everyday-life guides/turn-camera-roll-into-diary sitemap.xml robots.txt; do
  printf "%-60s %s\n" "/$p" "$(curl -s -o /dev/null -w '%{http_code}' http://bloggo.localhost:3000/$p)"
done
```

Expected: every line ends in `200`.

- [ ] **Step 3: Validate every JSON-LD block parses**

```bash
curl -s http://bloggo.localhost:3000/how-it-works | python3 -c "
import sys, re, json
html = sys.stdin.read()
blocks = re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', html, re.S)
for b in blocks:
    data = json.loads(b)
    print(data.get('@type'))
"
```

Expected: `MobileApplication`, `HowTo`, `FAQPage` (three lines, no JSON errors). Repeat for one guide page — expected: `MobileApplication`, `Article`, `BreadcrumbList`.

- [ ] **Step 4: Canonical + OG spot checks**

```bash
curl -s http://bloggo.localhost:3000/guides/private-travel-journal-app | grep -o 'rel="canonical" href="[^"]*"'
curl -s http://bloggo.localhost:3000/ | grep -o 'property="og:image" content="[^"]*"'
kill %1
```

Expected: canonical on the bloggo host without `/bloggo` prefix; og:image resolves to `https://bloggo.linkedspaces.com/bloggo/og-image.png`.

- [ ] **Step 5: Manual schema validation (human step)**

After deploy, paste `https://bloggo.linkedspaces.com/how-it-works` and one guide URL into https://validator.schema.org and https://search.google.com/test/rich-results. Then submit `https://bloggo.linkedspaces.com/sitemap.xml` in Google Search Console.

- [ ] **Step 6: Confirm the landing page diff is metadata-only**

Run: `git diff dashboard -- src/app/bloggo/page.tsx`
Expected: only the added `Metadata` import and `metadata` export — zero JSX/copy changes.
