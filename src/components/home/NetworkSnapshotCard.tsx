"use client";

import { useMemo } from "react";
import { BookOpen, Trophy, TrendingUp } from "lucide-react";
import type { MockFeedPost, MockRecapBlog } from "@/lib/mockNetwork";

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\w\s,]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Start of current month (local). */
function startOfThisMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** True if isoDate is in the current month, or if no date (treat as this month for mock data). */
function isInCurrentMonth(isoDate: string | undefined): boolean {
  if (!isoDate) return true;
  try {
    const date = new Date(isoDate);
    const start = startOfThisMonth();
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return date >= start && date < end;
  } catch {
    return true;
  }
}

export interface NetworkSnapshotCardProps {
  feedPosts: MockFeedPost[];
  recapBlogs: MockRecapBlog[];
  isLoading?: boolean;
}

interface NetworkStats {
  spotlightUsername: string | null;
  spotlightCount: number;
  topLocation: string | null;
  topLocationCount: number;
  newestRecap: MockRecapBlog | null;
  totalSaves: number;
  totalBlogs: number;
  uniqueCount: number;
  placesSavedThisMonth: number;
  blogsThisMonth: number;
  totalLikes: number;
  topPosterThisMonth: { username: string; count: number } | null;
  trendingPlacesThisMonth: { name: string; count: number }[];
  popularBlogsThisMonth: MockRecapBlog[];
}

export default function NetworkSnapshotCard({
  feedPosts,
  recapBlogs,
  isLoading,
}: NetworkSnapshotCardProps) {
  const stats = useMemo<NetworkStats>(() => {
    const byUsername = new Map<string, number>();
    const locationCount = new Map<string, number>();
    const uniquePlaces = new Set<string>();

    const thisMonthPosts = feedPosts.filter((p) =>
      isInCurrentMonth(p.createdAt),
    );
    const thisMonthRecaps = recapBlogs.filter((r) =>
      isInCurrentMonth(r.createdAt),
    );

    const byUsernameThisMonth = new Map<string, number>();
    const placeCountThisMonth = new Map<string, number>();
    for (const p of thisMonthPosts) {
      const un = (p.username ?? "").trim().toLowerCase();
      if (un)
        byUsernameThisMonth.set(un, (byUsernameThisMonth.get(un) ?? 0) + 1);
      const loc = (p.placeName ?? "").trim();
      if (loc)
        placeCountThisMonth.set(loc, (placeCountThisMonth.get(loc) ?? 0) + 1);
    }

    const recent = feedPosts.slice(0, 50);
    for (const p of recent) {
      const un = (p.username ?? "").trim().toLowerCase();
      if (un) byUsername.set(un, (byUsername.get(un) ?? 0) + 1);
      const loc = (p.placeName ?? "").trim();
      if (loc) {
        locationCount.set(loc, (locationCount.get(loc) ?? 0) + 1);
        uniquePlaces.add(loc);
      }
      for (const t of tokenize(p.placeName ?? "")) {
        if (t.length > 2) locationCount.set(t, (locationCount.get(t) ?? 0) + 1);
      }
    }
    for (const p of feedPosts) {
      const loc = (p.placeName ?? "").trim();
      if (loc) uniquePlaces.add(loc);
    }
    for (const r of recapBlogs) {
      const loc = (r.locationLabel ?? "").trim();
      if (loc) {
        locationCount.set(loc, (locationCount.get(loc) ?? 0) + 1);
        uniquePlaces.add(loc);
      }
      for (const t of tokenize(r.locationLabel ?? "")) {
        if (t.length > 2) locationCount.set(t, (locationCount.get(t) ?? 0) + 1);
      }
    }

    let spotlightUsername: string | null = null;
    let spotlightCount = 0;
    byUsername.forEach((count, username) => {
      if (count > spotlightCount) {
        spotlightCount = count;
        spotlightUsername = username;
      }
    });

    const sortedLoc = [...locationCount.entries()]
      .filter(([k]) => k.length > 2 && !/^\d+$/.test(k))
      .sort((a, b) => b[1] - a[1]);
    const topLocation = sortedLoc[0]?.[0] ?? null;
    const topLocationCount = sortedLoc[0]?.[1] ?? 0;

    let topPosterThisMonth: { username: string; count: number } | null = null;
    byUsernameThisMonth.forEach((count, username) => {
      if (!topPosterThisMonth || count > topPosterThisMonth.count) {
        topPosterThisMonth = { username: capitalize(username), count };
      }
    });

    const trendingPlacesThisMonth = [...placeCountThisMonth.entries()]
      .filter(([name]) => name.length > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const popularBlogsThisMonth = [...thisMonthRecaps]
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      })
      .slice(0, 3);

    const totalLikes = feedPosts.reduce(
      (sum, p) => sum + (p.likeCount ?? 0),
      0,
    );

    return {
      spotlightUsername: spotlightUsername
        ? capitalize(spotlightUsername)
        : null,
      spotlightCount,
      topLocation,
      topLocationCount,
      newestRecap: recapBlogs[0] ?? null,
      totalSaves: feedPosts.length,
      totalBlogs: recapBlogs.length,
      uniqueCount: uniquePlaces.size,
      placesSavedThisMonth: thisMonthPosts.length,
      blogsThisMonth: thisMonthRecaps.length,
      totalLikes,
      topPosterThisMonth,
      trendingPlacesThisMonth,
      popularBlogsThisMonth,
    };
  }, [feedPosts, recapBlogs]);

  if (isLoading) {
    return (
      <section className="w-full" aria-label="Network snapshot">
        <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--card-text-muted)]">
          Network snapshot
        </h2>
        <div className="rounded-xl border border-[var(--card-border)] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-100" />
            <div className="h-14 animate-pulse rounded-lg bg-gray-100" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const hasThisMonth =
    (stats.topPosterThisMonth?.count ?? 0) > 0 ||
    stats.trendingPlacesThisMonth.length > 0 ||
    stats.popularBlogsThisMonth.length > 0;
  const hasAny = hasThisMonth;

  return (
    <section className="w-full" aria-label="Network snapshot">
      <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--card-text-muted)]">
        Network snapshot
      </h2>
      <div className="rounded-xl border border-[var(--card-border)] bg-white shadow-sm overflow-hidden">
        {!hasAny ? (
          <div className="p-5 text-center">
            <p className="text-sm text-[var(--card-text-muted)]">
              Add friends to see your network activity here.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Top Poster This Month */}
            {stats.topPosterThisMonth && stats.topPosterThisMonth.count > 0 && (
              <div className="rounded-lg bg-amber-400 px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy
                    className="h-3.5 w-3.5 shrink-0 text-black"
                    aria-hidden
                  />
                  <span className="text-[11px] font-medium uppercase tracking-wide text-black">
                    Top poster this month
                  </span>
                </div>
                <p className="text-sm text-black">
                  <strong>{stats.topPosterThisMonth.username}</strong>
                  <span className="text-black/90">
                    {" "}
                    &ndash; {stats.topPosterThisMonth.count} place
                    {stats.topPosterThisMonth.count !== 1 ? "s" : ""} saved
                  </span>
                </p>
              </div>
            )}

            {/* Divider above Trending places */}
            {stats.trendingPlacesThisMonth.length > 0 && (
              <div className="border-t border-[var(--card-border)] pt-4 first:pt-0 first:border-t-0" />
            )}
            {/* Trending Places This Month — up to 3 */}
            {stats.trendingPlacesThisMonth.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp
                    className="h-3.5 w-3.5 shrink-0 text-[var(--card-text-muted)]"
                    aria-hidden
                  />
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--card-text-muted)]">
                    Trending places this month
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {stats.trendingPlacesThisMonth.map(({ name, count }) => (
                    <li
                      key={name}
                      className="flex items-baseline justify-between gap-2 text-sm"
                    >
                      <span
                        className="min-w-0 truncate font-medium text-[var(--card-text)]"
                        title={name}
                      >
                        {name}
                      </span>
                      <span className="shrink-0 tabular-nums text-[var(--card-text-muted)]">
                        {count} visit{count !== 1 ? "s" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Divider above Popular blogs */}
            {stats.popularBlogsThisMonth.length > 0 && (
              <div className="border-t border-[var(--card-border)] pt-4" />
            )}
            {/* Popular Blogs This Month — up to 3 */}
            {stats.popularBlogsThisMonth.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen
                    className="h-3.5 w-3.5 shrink-0 text-[var(--card-text-muted)]"
                    aria-hidden
                  />
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--card-text-muted)]">
                    Popular blogs this month
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {stats.popularBlogsThisMonth.map((blog) => (
                    <li key={blog.id}>
                      <span
                        className="block truncate text-sm font-medium text-[var(--card-text)]"
                        title={blog.title}
                      >
                        {blog.title}
                      </span>
                      {blog.authorUsername && (
                        <span className="text-[11px] text-[var(--card-text-muted)]">
                          {blog.authorUsername}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
