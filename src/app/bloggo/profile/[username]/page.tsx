"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { assetUrl } from "@/api/assets";
import { apiFetch, ApiError } from "@/api/client";
import MapboxMap, {
  type MarkerData,
} from "@/views/Profile/travel-stats/components/MapBoxMap";
import { resolveTripCoverUrl } from "@/views/Profile/recap-blogs/utils/tripDataTransform";

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = "recap" | "mapView";

interface CountrySummary {
  countryCode: string;
  countryName: string;
  coverImage: string | undefined;
  years: number[];
  latestDate: string;
}

interface BlogEntry {
  blogKey: string;
  title: string;
  coverPhotoUrl?: string;
  tripDateRangeText?: string;
  authorName?: string;
  authorProfileImageUrl?: string;
  /** ISO date string for sorting */
  createdAt?: string;
  /** Optional geo data (may be added by API in the future) */
  countryCode?: string;
  countryName?: string;
  coordinate?: { lat: number; lng: number; label?: string };
}

interface ProfileData {
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  bio?: string;
  blogs: BlogEntry[];
}

// ─── Year Filter Tabs ─────────────────────────────────────────────────────────
type RecapYearValue = "ALL" | number;

function RecapYearTabs({
  value,
  years,
  onChange,
}: {
  value: RecapYearValue;
  years: number[];
  onChange: (v: RecapYearValue) => void;
}) {
  const options: RecapYearValue[] = ["ALL", ...years];
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full bg-slate-100 p-1"
      role="tablist"
      aria-label="Filter by year"
    >
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <button
            key={String(opt)}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt)}
            className={[
              "rounded-full px-5 py-2 text-[13px] font-semibold leading-none transition",
              selected
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-700",
              "focus:outline-none focus:ring-2 focus:ring-sky-400/40",
            ].join(" ")}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── View All / Go Back button ─────────────────────────────────────────────────
function ViewAllBlogsButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center justify-center gap-2 rounded-full border border-black/50 bg-white " +
        "px-4 py-2 text-[13px] font-semibold leading-none text-black " +
        "hover:bg-black/[0.03] active:translate-y-[0.5px] " +
        "focus:outline-none focus:ring-2 focus:ring-sky-400/40"
      }
    >
      {children}
    </button>
  );
}

// ─── Country Recap Card ────────────────────────────────────────────────────────
function CountryRecapCard({
  item,
  onSelect,
}: {
  item: CountrySummary;
  onSelect: (countryCode: string) => void;
}) {
  const uniqYears = Array.from(new Set(item.years)).sort((a, b) => b - a);
  const yearDisplay =
    uniqYears.length <= 3
      ? uniqYears.join(", ")
      : `${uniqYears.slice(0, 2).join(" · ")} · +${uniqYears.length - 2}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.countryCode)}
      className={[
        "group relative block w-full max-w-[500px] overflow-hidden rounded-3xl",
        "border border-black/5 shadow-sm text-left",
        "focus:outline-none focus:ring-2 focus:ring-sky-400/40",
        "transition-transform duration-200 hover:scale-[1.01]",
      ].join(" ")}
    >
      <div className="relative aspect-[5/4] w-full bg-slate-100">
        {item.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.coverImage}
            alt={item.countryName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <svg
              className="w-10 h-10 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      </div>

      <div className="absolute inset-0 flex items-end justify-center pb-6 text-center">
        <div className="px-4">
          <div className="text-[24px] font-semibold tracking-[-0.4px] text-white drop-shadow">
            {item.countryName}
          </div>
          <div className="mt-2 flex justify-center">
            <div
              className={[
                "max-w-[260px] truncate whitespace-nowrap rounded-full",
                "border border-white/20 bg-black/35 px-3 py-1.5",
                "text-[12px] font-semibold leading-none text-white/90",
                "shadow-[0_10px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm",
              ].join(" ")}
            >
              {yearDisplay}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Blog List Card ───────────────────────────────────────────────────────────
function BlogListCard({
  blog,
  isActive,
  onClick,
  username,
}: {
  blog: BlogEntry;
  isActive: boolean;
  onClick: () => void;
  username: string;
}) {
  const dateLabel = blog.tripDateRangeText || "";
  const yearMatch = dateLabel.match(/\b(19|20)\d{2}\b/);
  const yearText = yearMatch?.[0] ?? "";
  const dateWithoutYear = yearText
    ? dateLabel.replace(/,?\s*\b(19|20)\d{2}\b\s*$/, "").trim()
    : dateLabel;

  const locationLabel = blog.coordinate?.label || blog.countryName || "";

  return (
    <div data-recap-blog-id={blog.blogKey} className="w-full">
      <Link
        href={`/bloggo/trip/${encodeURIComponent(username)}/${blog.blogKey}`}
        className="block"
        onClick={onClick}
      >
        <div
          className={[
            "group relative w-full overflow-hidden rounded-2xl",
            "border bg-white shadow-sm transition-all duration-200",
            isActive
              ? "border-sky-500 shadow-md ring-2 ring-sky-500/30"
              : "border-black/10 hover:border-sky-300 hover:shadow-md",
          ].join(" ")}
        >
          {/* Image */}
          <div className="relative aspect-[16/9] w-full bg-slate-100">
            {blog.coverPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={blog.coverPhotoUrl}
                alt={blog.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <svg
                  className="w-10 h-10 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

            {/* Location pill bottom-left */}
            {locationLabel && (
              <div className="absolute bottom-3 left-3 z-10">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[12px] text-white backdrop-blur">
                  <MapPin className="h-3.5 w-3.5 opacity-90" />
                  <span className="leading-none">{locationLabel}</span>
                </div>
              </div>
            )}

            {/* Date pill top-left */}
            {dateLabel && (
              <div className="absolute left-3 top-3 z-10 w-[80%]">
                <div
                  className="inline-flex w-fit items-center gap-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[12px] text-white backdrop-blur whitespace-nowrap pointer-events-none"
                  title={dateLabel}
                >
                  {!!yearText && (
                    <span className="shrink-0 rounded-full bg-white/15 px-1.5 py-0.5 font-extrabold leading-none">
                      {yearText}
                    </span>
                  )}
                  <span className="min-w-0">
                    {dateWithoutYear || dateLabel}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title below card */}
        <h3 className="mt-2 min-w-0 max-w-full break-words line-clamp-2 text-[13px] font-medium text-black/90">
          {blog.title}
        </h3>
      </Link>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Sticky header skeleton */}
      <div className="sticky top-0 z-50 border-b border-black/10 bg-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 420px))",
            gap: "24px",
            justifyContent: "center",
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="w-full aspect-[16/9] rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyBlogs({ isOwnProfile }: { isOwnProfile: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 col-span-full text-center">
      <div className="text-6xl mb-4">✈️</div>
      <p className="text-[var(--bloggo-text-primary)] font-semibold text-lg mb-1">
        No blogs yet
      </p>
      <p className="text-[var(--bloggo-text-muted)] text-sm max-w-xs">
        {isOwnProfile
          ? "Upload your first recap blog from the Bloggo app to have it appear here."
          : "This user hasn't published any recap blogs yet."}
      </p>
    </div>
  );
}

// ─── Responsive Grid ──────────────────────────────────────────────────────────

function ResponsiveGrid<T>({
  items,
  minCardWidth,
  maxCardWidth,
  getKey,
  renderItem,
}: {
  items: T[];
  minCardWidth: number;
  maxCardWidth: number;
  getKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, ${maxCardWidth}px))`,
        gap: "24px",
        justifyContent: "center",
      }}
    >
      {items.map((item) => (
        <div key={getKey(item)}>{renderItem(item)}</div>
      ))}
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const params = useParams();
  const username = (params?.username as string) ?? "";

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ok" | "not-found" | "error"
  >(username ? "loading" : "not-found");
  const [isOwnProfile, setIsOwnProfile] = useState(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? (window.localStorage.getItem("user") ??
            window.sessionStorage.getItem("user"))
          : null;
      if (raw) {
        const u = JSON.parse(raw);
        return u?.username === username;
      }
    } catch {
      // ignore
    }
    return false;
  });
  const [selectedYear, setSelectedYear] = useState<RecapYearValue>("ALL");
  const [activeBlogId, setActiveBlogId] = useState<string | undefined>(
    undefined,
  );
  const [imgError, setImgError] = useState(false);
  const [mode, setMode] = useState<Mode>("recap");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const mapListScrollRef = useRef<HTMLDivElement | null>(null);

  // ── Fetch profile ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!username) {
      // status is already initialized to "not-found" if username is empty
      return;
    }

    const tryLocalFallback = (fallbackStatus: "not-found" | "error") => {
      try {
        const raw =
          typeof window !== "undefined"
            ? (window.localStorage.getItem("user") ??
              window.sessionStorage.getItem("user"))
            : null;
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.username === username) {
            let userTrips = Array.isArray(u.trips) ? u.trips : [];

            // Clean up test blogs for the yoob account (Hide early tests 0-6)
            if (username === "yoob") {
              const testKeys = [0, 1, 2, 3, 4, 5, 6];
              userTrips = userTrips.filter(
                (t: any) => !testKeys.includes(Number(t.blogKey)),
              );
            }

            // Only cloud uploaded blogs have a valid blogKey
            userTrips = userTrips.filter((t: any) => t.blogKey != null);

            const mappedBlogs: BlogEntry[] = userTrips.map((trip: any) => ({
              blogKey: String(trip.blogKey ?? trip._id ?? ""),
              title: trip.title || "Untitled Recap",
              coverPhotoUrl: resolveTripCoverUrl(
                trip,
                u.placeVisitHistory,
                undefined,
              ),
              tripDateRangeText: trip.startingYear
                ? String(trip.startingYear)
                : undefined,
              authorName: u.username,
              authorProfileImageUrl: u.profile_picture
                ? assetUrl(u.profile_picture)
                : undefined,
              countryCode: trip.countryCode,
              countryName: trip.countryName || trip.country,
              coordinate: trip.coordinate
                ? {
                    lat:
                      (trip.coordinate as any).lat ??
                      (trip.coordinate as any).latitude,
                    lng:
                      (trip.coordinate as any).lng ??
                      (trip.coordinate as any).longitude,
                  }
                : undefined,
            }));

            setProfile({
              username: u.username,
              displayName: u.username,
              profileImageUrl: u.profile_picture
                ? assetUrl(u.profile_picture)
                : undefined,
              bio: undefined,
              blogs: mappedBlogs,
            });
            setStatus("ok");
            return;
          }
        }
      } catch {
        // ignore
      }
      setStatus(fallbackStatus);
    };

    const fetchProfile = async () => {
      try {
        const data = await apiFetch<ProfileData>(
          `/bloggo/profile?username=${encodeURIComponent(username)}`,
        );
        if (!data) {
          tryLocalFallback("not-found");
          return;
        }

        // Defensively filter blogs per user account in case the backend returns everything
        // and only keep blogs correctly assigned to this profile, and skip any completely corrupted entries.
        if (data.blogs && Array.isArray(data.blogs)) {
          data.blogs = data.blogs.filter((b) => {
            // Require a valid blog key (indicates it's safely uploaded to cloud)
            if (b.blogKey == null) return false;
            // If authorName is provided by the backend, ensure it matches the profile we are viewing
            if (b.authorName && b.authorName !== username) return false;

            // Clean up test blogs for the yoob account (Hide early tests 0-6)
            if (username === "yoob") {
              const testKeys = ["0", "1", "2", "3", "4", "5", "6"];
              if (testKeys.includes(String(b.blogKey))) return false;
            }
            return true;
          });
        }

        setProfile(data);
        setStatus("ok");
      } catch (err: any) {
        if (err?.status === 404) {
          tryLocalFallback("not-found");
        } else {
          tryLocalFallback("error");
        }
      }
    };

    fetchProfile();
  }, [username]);

  // ── Derive years from blogs ─────────────────────────────────────────────────
  const availableYears = useMemo(() => {
    if (!profile) return [];
    const set = new Set<number>();
    for (const b of profile.blogs) {
      const src = b.createdAt || b.tripDateRangeText || "";
      const match = src.match(/\b(20\d{2}|19\d{2})\b/);
      if (match) set.add(Number(match[0]));
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [profile]);

  // ── Filter blogs by year ────────────────────────────────────────────────────
  const filteredBlogs = useMemo(() => {
    if (!profile) return [];
    if (selectedYear === "ALL") return profile.blogs;
    return profile.blogs.filter((b) => {
      const src = b.createdAt || b.tripDateRangeText || "";
      const match = src.match(/\b(20\d{2}|19\d{2})\b/);
      return match ? Number(match[0]) === selectedYear : false;
    });
  }, [profile, selectedYear]);

  // ── Country summaries (recap grid) ─────────────────────────────────────────
  const countrySummaries = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    for (const blog of filteredBlogs) {
      const countryCode = blog.countryCode || "UNKNOWN";
      const countryName =
        blog.countryName || blog.countryCode || "Other Destinations";

      const src = blog.createdAt || blog.tripDateRangeText || "";
      const match = src.match(/\b(20\d{2}|19\d{2})\b/);
      const year = match ? Number(match[0]) : new Date().getFullYear();

      const dateStr = blog.createdAt || new Date().toISOString();

      const existing = map.get(countryCode);
      if (existing) {
        if (!existing.years.includes(year)) existing.years.push(year);
        if (dateStr > existing.latestDate) {
          existing.latestDate = dateStr;
          if (blog.coverPhotoUrl) existing.coverImage = blog.coverPhotoUrl;
        }
      } else {
        map.set(countryCode, {
          countryCode,
          countryName,
          coverImage: blog.coverPhotoUrl,
          years: [year],
          latestDate: dateStr,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      b.latestDate.localeCompare(a.latestDate),
    );
  }, [filteredBlogs]);

  // ── Blogs for the selected country (map view left list) ────────────────────
  const countryBlogs = useMemo(() => {
    if (!selectedCountry) return [];
    return filteredBlogs.filter(
      (b) => (b.countryCode || "UNKNOWN") === selectedCountry,
    );
  }, [filteredBlogs, selectedCountry]);

  // ── Map markers from countryBlogs ──────────────────────────────────────────
  const mapMarkers: MarkerData[] = useMemo(() => {
    return countryBlogs.map((blog) => {
      const src = blog.createdAt || blog.tripDateRangeText || "";
      const match = src.match(/\b(20\d{2}|19\d{2})\b/);
      const year = match ? Number(match[0]) : new Date().getFullYear();

      return {
        id: blog.blogKey,
        lat: blog.coordinate?.lat ?? NaN,
        lng: blog.coordinate?.lng ?? NaN,
        year: year,
        label: blog.title || "",
        imageUrl: blog.coverPhotoUrl ?? "",
        dateLabel: blog.tripDateRangeText ?? "",
      };
    });
  }, [countryBlogs]);

  // ── Scroll spy: update active marker as user scrolls the left list ─────────
  useEffect(() => {
    if (mode !== "mapView") return;
    const root = mapListScrollRef.current;
    if (!root) return;

    let raf = 0;
    const computeTopVisible = () => {
      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>("[data-recap-blog-id]"),
      );
      if (nodes.length === 0) {
        setActiveBlogId(undefined);
        return;
      }
      const st = root.scrollTop;
      for (const el of nodes) {
        if (el.offsetTop + el.offsetHeight > st + 4) {
          setActiveBlogId(el.dataset.recapBlogId);
          return;
        }
      }
      setActiveBlogId(nodes[nodes.length - 1]?.dataset.recapBlogId);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(computeTopVisible);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    computeTopVisible();
    return () => {
      root.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [mode, countryBlogs.length]);

  // ── Scroll to blog when marker is clicked on map ──────────────────────────
  const scrollToBlog = (id: string) => {
    setActiveBlogId(id);
    const root = mapListScrollRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(`[data-recap-blog-id="${id}"]`);
    if (el) {
      root.scrollTo({ top: el.offsetTop - 20, behavior: "smooth" });
    }
  };

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setMode("mapView");
    setActiveBlogId(undefined);
  };

  const handleGoBack = () => {
    setSelectedCountry(null);
    setMode("recap");
    setActiveBlogId(undefined);
  };

  const headerAction =
    mode === "recap" ? null : (
      <ViewAllBlogsButton onClick={handleGoBack}>Go Back</ViewAllBlogsButton>
    );

  const selectedCountryName = useMemo(() => {
    if (!selectedCountry) return "";
    const summary = countrySummaries.find(
      (s) => s.countryCode === selectedCountry,
    );
    return summary?.countryName ?? selectedCountry;
  }, [selectedCountry, countrySummaries]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (status === "loading") return <ProfileSkeleton />;

  // ── Not Found ────────────────────────────────────────────────────────────────
  if (status === "not-found" || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <div className="text-7xl mb-6">🙈</div>
          <h1 className="text-2xl font-bold text-[var(--bloggo-text-primary)] mb-3">
            Profile not found
          </h1>
          <p className="text-[var(--bloggo-text-secondary)] leading-relaxed mb-8">
            We couldn&apos;t find a Bloggo profile for{" "}
            <strong>@{username}</strong>. Make sure the link is correct.
          </p>
          <Link
            href="/bloggo"
            className="inline-block mt-2 px-6 py-3 rounded-xl bg-[var(--bloggo-accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            ← Back to Bloggo
          </Link>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <div className="text-7xl mb-6">📡</div>
          <h1 className="text-2xl font-bold text-[var(--bloggo-text-primary)] mb-3">
            Couldn&apos;t load profile
          </h1>
          <p className="text-[var(--bloggo-text-secondary)] leading-relaxed mb-8">
            We had trouble reaching the server. Try again in a moment.
          </p>
          <Link
            href="/bloggo"
            className="inline-block mt-2 px-6 py-3 rounded-xl bg-[var(--bloggo-accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            ← Back to Bloggo
          </Link>
        </div>
      </div>
    );
  }

  // ── Profile ───────────────────────────────────────────────────────────────────
  const displayName = profile.displayName || profile.username;
  const blogs = profile.blogs ?? [];
  const initials = displayName[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* ── Sticky Header ───────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 border-b border-black/10 bg-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-6">
            {/* Left: avatar + name */}
            <div className="flex items-center gap-4">
              {profile.profileImageUrl && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.profileImageUrl}
                  alt={displayName}
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-sky-500/30"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-11 h-11 rounded-full flex-shrink-0 bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-base font-bold">
                  {initials}
                </div>
              )}
              <div className="space-y-0.5">
                <h1 className="font-[Inter] text-[20px] font-bold leading-[28px] tracking-[-0.4px] text-black">
                  Recap Blog
                </h1>
                <p className="font-[Inter] text-[13px] font-normal leading-[18px] tracking-[-0.3px] text-[#8B949E]">
                  {profile.bio || `@${profile.username}`}
                </p>
              </div>
            </div>

            {/* Right: year tabs and optional back button */}
            <div className="flex flex-col items-end gap-3">
              {headerAction}
              {availableYears.length > 1 && mode === "recap" && (
                <RecapYearTabs
                  value={selectedYear}
                  years={availableYears}
                  onChange={setSelectedYear}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {filteredBlogs.length === 0 ? (
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          <EmptyBlogs isOwnProfile={isOwnProfile} />
        </div>
      ) : mode === "recap" ? (
        /* ── Recap grid ──────────────────────────────────────────────────── */
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Blog count badge */}
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-[15px] font-semibold text-black/80">
              {selectedYear === "ALL" ? "All Recaps" : `${selectedYear} Recaps`}
            </h2>
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[12px] font-semibold text-sky-700">
              {filteredBlogs.length}{" "}
              {filteredBlogs.length === 1 ? "blog" : "blogs"}
            </span>
          </div>

          <ResponsiveGrid<CountrySummary>
            items={countrySummaries}
            minCardWidth={430}
            maxCardWidth={500}
            getKey={(it) => it.countryCode}
            renderItem={(it) => (
              <CountryRecapCard item={it} onSelect={handleCountrySelect} />
            )}
          />
        </div>
      ) : (
        /* ── Map + list split view ───────────────────────────────────────── */
        <div
          className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row gap-4"
          style={{ height: "calc(100vh - 180px)", minHeight: "520px" }}
        >
          {/* Left: scrollable blog list */}
          <aside className="shrink-0 w-full lg:w-[420px] h-full">
            <div className="h-full rounded-2xl border border-black/10 bg-white overflow-hidden">
              <div
                ref={mapListScrollRef}
                className="h-full overflow-y-auto pr-2 px-4 pt-2 pb-4"
              >
                {/* Country header */}
                {selectedCountryName && (
                  <h2 className="py-3 text-[16px] font-bold text-[#5B5B5B] font-[Inter]">
                    {selectedCountryName}
                  </h2>
                )}

                <div className="flex flex-col gap-6">
                  {countryBlogs.map((blog) => (
                    <BlogListCard
                      key={blog.blogKey}
                      blog={blog}
                      isActive={activeBlogId === blog.blogKey}
                      onClick={() => setActiveBlogId(blog.blogKey)}
                      username={username}
                    />
                  ))}
                </div>

                {countryBlogs.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-black/10 p-4 text-sm text-black/60">
                    No blogs for this country in the selected year.
                  </div>
                )}

                {/* Bottom buffer so last card can scroll to top */}
                <div aria-hidden className="pointer-events-none h-[55vh]" />
              </div>
            </div>
          </aside>

          {/* Right: Mapbox map */}
          <section className="min-w-0 flex-1 h-full">
            <div className="h-full w-full overflow-hidden rounded-2xl border border-black/10 relative">
              <MapboxMap
                countryCode={selectedCountry ?? undefined}
                markers={mapMarkers}
                onMarkerClick={scrollToBlog}
                activeMarkerId={activeBlogId}
                overlayTopRight={
                  availableYears.length > 1 ? (
                    <RecapYearTabs
                      value={selectedYear}
                      years={availableYears}
                      onChange={setSelectedYear}
                    />
                  ) : undefined
                }
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
