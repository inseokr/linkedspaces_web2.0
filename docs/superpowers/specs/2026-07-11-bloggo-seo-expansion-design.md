# Bloggo SEO Expansion — Design

**Date:** 2026-07-11
**Site:** bloggo.linkedspaces.com (Next.js app, rewritten to `src/app/bloggo/*` by `src/middleware.ts`)
**Goal:** Organic search traffic from long-tail travel-journal keywords → App Store downloads for Bloggo (id6759849314). The existing landing page design stays untouched.

## Background

- The App Store listing is "Bloggo: Journal & Diary" (Photo & Video, free, v1.4). Description emphasizes: automatic trip detection, instant journal creation, Instagram carousel export (4:5 / 9:16), PDF storybook, video slideshow with music, travel maps, on-device privacy.
- Competitor validation: TripMemo ranks with exactly this playbook (`/travel-photo-journal-app`, `/best-travel-journal-apps`, `/guide/choosing-travel-journal-app`).
- Current SEO gaps: layout metadata targets wrong keywords ("developer blog, content creation"), no sitemap, no canonical URLs (pages duplicated across `linkedspaces.com/bloggo/*` and `bloggo.linkedspaces.com/*`), no structured data.

## Scope

### 1. Reference file — `docs/bloggo/app.md`

App Store listing snapshot: name, subtitle ("Photos, Videos & Your Memories"), full description, category, version, ratings, icon URL, screenshot URLs, plus the target keyword map (primary + long-tail → page). Single source of truth for future ASO work.

### 2. Assets — `public/bloggo/screenshots/`

Download listing screenshots at full resolution from mzstatic (via the `{w}x{h}` template URLs in the App Store page HTML) plus the 512px icon. Descriptive keyword-bearing filenames (e.g. `automatic-trip-detection.png`). Every use gets meaningful alt text.

### 3. New page: `/how-it-works` (pillar page)

Route: `src/app/bloggo/how-it-works/page.tsx`. Server component, static.

- H1 targets "turn photos into a travel blog" / "AI travel journal".
- Expanded 3-step walkthrough (find trips from camera roll → group by place → structured blog draft) with real app screenshots; richer copy than the landing timeline.
- Export section: carousel / PDF / video — each links to its guide.
- FAQ section: 8–10 specific questions (e.g. "Does Bloggo upload my photos?", "Can I make an Instagram carousel from my trip photos?"), each answer ends with a "Learn more" link to the matching guide.
- JSON-LD: `HowTo` + `FAQPage`.
- Download CTAs (App Store badge) top and bottom.
- Copy follows LinkedSpaces voice standards: sentence case, direct, warm, privacy-first, no hype.

### 4. Guides — `/guides` index + `/guides/[slug]`

Data-driven: one content file `src/app/bloggo/guides/guides.ts` exporting a typed array of guide entries (slug, target keyword, title, meta description, intro, steps, FAQ crumbs, screenshot refs, related-guide slugs). Rendered by:

- `src/app/bloggo/guides/page.tsx` — index listing all guides.
- `src/app/bloggo/guides/[slug]/page.tsx` — shared template with `generateStaticParams` + `generateMetadata`.

Guide page structure: intent-answering intro (answers the search query directly) → "How to do it with Bloggo" steps with screenshot → mini-FAQ → related guides → download CTA. JSON-LD: `Article` + `BreadcrumbList`.

Launch guides (9):

| Slug | Target keyword |
|---|---|
| `turn-photos-into-travel-blog` | how to turn photos into a travel blog |
| `organize-travel-photos-by-trip` | organize travel photos by trip automatically |
| `instagram-carousel-from-travel-photos` | make an Instagram carousel from travel photos |
| `travel-photo-book-from-iphone` | create a travel photo book / PDF on iPhone |
| `travel-video-slideshow-with-music` | trip photos into a video slideshow with music |
| `private-travel-journal-app` | private travel journal app that doesn't upload photos |
| `travel-map-of-places-visited` | make a map of places you've traveled |
| `photo-journal-app-for-everyday-life` | photo journal app for everyday life |
| `turn-camera-roll-into-diary` | turn your camera roll into a diary |

Adding a future keyword page = adding one entry to `guides.ts`.

### 5. SEO infrastructure

- **Layout metadata** (`src/app/bloggo/layout.tsx`): rewrite title/description/keywords for the real positioning (AI travel journal, turn photos into blogs, photo journal & diary); add `metadataBase: https://bloggo.linkedspaces.com`; OpenGraph/Twitter card images.
- **Canonical URLs**: every bloggo page declares a canonical on `bloggo.linkedspaces.com` (path without the `/bloggo` prefix), resolving the two-host duplicate-content issue.
- **Sitemap**: `src/app/bloggo/sitemap.ts` → served at `bloggo.linkedspaces.com/sitemap.xml` through the existing middleware rewrite. Includes landing, features, how-it-works, guides index, all guide slugs, pricing, support. Verify the middleware matcher passes `/sitemap.xml` through the rewrite (it excludes only `_next/*` and favicon).
- **robots.txt**: add `Sitemap:` line.
- **`MobileApplication` JSON-LD** injected in the bloggo layout (name, category, rating, price, App Store URL) — no visual change.
- **Navigation**: header nav and footer "Product" column gain "How it works" and "Guides" links.

## Error handling

- Unknown guide slug → existing `src/app/bloggo/not-found.tsx` (via `notFound()`).
- All new pages are static server components; no runtime data fetching, so no loading/error states.

## Testing / verification

- `npm run build` passes; all 9 guide pages statically generated.
- Verify on the bloggo host (bloggo.localhost) that `/how-it-works`, `/guides`, `/guides/<slug>`, and `/sitemap.xml` render with clean URLs.
- Validate JSON-LD blocks with a schema validator; canonical + meta tags present in page source.

## Out of scope

- Landing page visuals and copy.
- App Store listing changes (keyword field, subtitle) — separate ASO task.
- Blog/CMS, MDX tooling, analytics, paid acquisition.
