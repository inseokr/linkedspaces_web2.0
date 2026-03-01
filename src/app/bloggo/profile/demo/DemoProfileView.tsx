"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  mockBlogs,
  demoAuthor,
  type BlogPost,
  type CountrySummary as BaseCountrySummary,
} from "@/bloggo/lib/mock-data";
import MapboxMap, {
  type MarkerData,
} from "@/views/Profile/travel-stats/components/MapBoxMap";
import { MapPin, Eye } from "lucide-react";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = "recap" | "mapView";
type RecapYearValue = "ALL" | number;

interface CountrySummary extends BaseCountrySummary {
  blogCount: number;
}

// ─── Year Tabs ────────────────────────────────────────────────────────────────
function RecapYearTabs({
  value,
  years,
  onChange,
  className = "",
}: {
  value: RecapYearValue;
  years: number[];
  onChange: (v: RecapYearValue) => void;
  className?: string;
}) {
  const options: RecapYearValue[] = ["ALL", ...years];
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full bg-black/[0.03] p-1.5",
        className,
      ].join(" ")}
      role="tablist"
      aria-label="Recap year filter"
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
              "rounded-full px-5 py-2.5 text-[14px] font-bold leading-none transition-all duration-200",
              selected
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 scale-[1.05]"
                : "text-black/40 hover:text-black/70 hover:bg-black/5",
              "focus:outline-none",
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
        "focus:outline-none focus:ring-2 focus:ring-blue-400/40"
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
  const latestDate = new Date(item.latestDate);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const lastVisitedText = `Last visited ${monthNames[latestDate.getMonth()]} ${latestDate.getFullYear()}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.countryCode)}
      className={[
        "group relative block w-full overflow-hidden rounded-3xl",
        "border border-black/5 shadow-sm text-left",
        "focus:outline-none focus:ring-2 focus:ring-sky-400/40",
        "transition-transform duration-200 hover:scale-[1.01]",
      ].join(" ")}
    >
      <div className="relative aspect-[5/4] w-full bg-slate-100">
        <Image
          src={item.coverImage}
          alt={item.countryName}
          fill
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

        {/* Blog count badge */}
        <div className="absolute left-5 top-5">
          <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md border border-white/20">
            <span className="text-[13px] font-bold text-white leading-none">
              {item.blogCount}
            </span>
            <span className="text-[11px] font-medium text-white/80 leading-none">
              {item.blogCount === 1 ? "blog" : "blogs"}
            </span>
          </div>
        </div>
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
              {lastVisitedText}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Blog List Card (compact, for the map panel left-list) ────────────────────
function BlogListCard({
  blog,
  isActive,
  onClick,
}: {
  blog: BlogPost;
  isActive: boolean;
  onClick: () => void;
}) {
  const dateLabel = new Date(blog.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const yearMatch = dateLabel.match(/\b(19|20)\d{2}\b/);
  const yearText = yearMatch?.[0] ?? "";
  const dateWithoutYear = yearText
    ? dateLabel.replace(/,?\s*\b(19|20)\d{2}\b\s*$/, "").trim()
    : dateLabel;

  return (
    <div data-recap-blog-id={blog.slug} className="w-full">
      <Link
        href={`/bloggo/profile/demo/blog/${blog.slug}`}
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
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, 420px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

            {/* Location pill bottom-left */}
            <div className="absolute bottom-3 left-3 z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[12px] text-white backdrop-blur">
                <MapPin className="h-3.5 w-3.5 opacity-90" />
                <span className="leading-none">{blog.coordinate.label}</span>
              </div>
            </div>

            {/* Date pill top-left */}
            {dateLabel && (
              <div className="absolute left-3 top-3 z-10 w-[80%]">
                <div
                  className="inline-flex w-fit items-center gap-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[12px] text-white backdrop-blur whitespace-nowrap pointer-events-none"
                  title={dateLabel}
                >
                  {!!yearText && (
                    <span className="shrink-0 font-extrabold leading-none">
                      {yearText}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title below card */}
        <h3 className="mt-2 min-w-0 max-w-full break-words line-clamp-2 text-[13px] font-medium text-black/90">
          {blog.title}
        </h3>
        {/* Date below title */}
        {dateLabel && (
          <p className="mt-0.5 text-[12px] text-black/60">
            {dateWithoutYear || dateLabel}
          </p>
        )}
      </Link>
    </div>
  );
}

// ─── Responsive Grid Wrapper ───────────────────────────────────────────────────
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
  if (items.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-black/10 p-4 text-sm text-black/60">
        No blogs found for this selection.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          items.length === 1
            ? "minmax(300px, 600px)"
            : "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
        gap: "24px",
        justifyContent: "center",
        maxWidth: items.length === 1 ? "600px" : "none",
        margin: "0 auto",
      }}
    >
      {items.map((item) => (
        <div key={getKey(item)}>{renderItem(item)}</div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DemoProfileView() {
  const [mode, setMode] = useState<Mode>("recap");
  const [selectedYear, setSelectedYear] = useState<RecapYearValue>("ALL");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | undefined>(
    undefined,
  );

  const router = useRouter();
  const mapListScrollRef = useRef<HTMLDivElement | null>(null);

  // ── Derive available years ──────────────────────────────────────────────────
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    mockBlogs.forEach((b) => set.add(new Date(b.publishedAt).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, []);

  // ── Filter blogs by year ────────────────────────────────────────────────────
  const blogsFilteredByYear = useMemo(() => {
    if (selectedYear === "ALL") return mockBlogs;
    return mockBlogs.filter(
      (b) => new Date(b.publishedAt).getFullYear() === selectedYear,
    );
  }, [selectedYear]);

  // ── Country summaries (recap grid) ─────────────────────────────────────────
  const countrySummaries = useMemo(() => {
    const map = new Map<
      string,
      {
        countryCode: string;
        countryName: string;
        coverImage: string;
        years: number[];
        latestDate: string;
        blogCount: number;
      }
    >();
    for (const blog of blogsFilteredByYear) {
      const year = new Date(blog.publishedAt).getFullYear();
      const existing = map.get(blog.countryCode);
      if (existing) {
        existing.blogCount += 1;
        if (!existing.years.includes(year)) existing.years.push(year);
        if (blog.publishedAt > existing.latestDate) {
          existing.latestDate = blog.publishedAt;
          existing.coverImage = blog.coverImage;
        }
      } else {
        map.set(blog.countryCode, {
          countryCode: blog.countryCode,
          countryName: blog.countryName,
          coverImage: blog.coverImage,
          years: [year],
          latestDate: blog.publishedAt,
          blogCount: 1,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      b.latestDate.localeCompare(a.latestDate),
    );
  }, [blogsFilteredByYear]);

  // ── Blogs for the selected country (map view left list) ────────────────────
  const countryBlogs = useMemo(() => {
    if (!selectedCountry) return [];
    return blogsFilteredByYear
      .filter((b) => b.countryCode === selectedCountry)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
  }, [blogsFilteredByYear, selectedCountry]);

  // ── Map markers from countryBlogs ──────────────────────────────────────────
  const mapMarkers: MarkerData[] = useMemo(() => {
    return countryBlogs.map((blog) => ({
      id: blog.slug,
      lat: blog.coordinate.lat,
      lng: blog.coordinate.lng,
      year: new Date(blog.publishedAt).getFullYear(),
      label: blog.title,
      imageUrl: blog.coverImage,
      dateLabel: new Date(blog.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    }));
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
        setActiveBlogSlug(undefined);
        return;
      }
      const st = root.scrollTop;
      for (const el of nodes) {
        if (el.offsetTop + el.offsetHeight > st + 4) {
          setActiveBlogSlug(el.dataset.recapBlogId);
          return;
        }
      }
      setActiveBlogSlug(nodes[nodes.length - 1]?.dataset.recapBlogId);
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

  // ── Navigate to blog when marker is clicked on map ───────────────────────
  const navigateToBlog = (slug: string) => {
    router.push(`/bloggo/profile/demo/blog/${slug}`);
  };

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setMode("mapView");
    setActiveBlogSlug(undefined);
  };

  const handleGoBack = () => {
    setSelectedCountry(null);
    setMode("recap");
    setActiveBlogSlug(undefined);
  };

  const headerAction =
    mode === "recap" ? null : (
      <ViewAllBlogsButton onClick={handleGoBack}>Go Back</ViewAllBlogsButton>
    );

  // ── Selected country name for the column header ────────────────────────────
  const selectedCountryName = useMemo(() => {
    if (!selectedCountry) return "";
    const summary = countrySummaries.find(
      (s) => s.countryCode === selectedCountry,
    );
    return summary?.countryName ?? selectedCountry;
  }, [selectedCountry, countrySummaries]);

  return (
    <div
      className="flex flex-col bg-[#F5F5F7]"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      {/* ── Sticky Header ───────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 border-b border-black/10 bg-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {mode === "recap" ? (
                <>
                  <Image
                    src={demoAuthor.avatar}
                    alt={demoAuthor.name}
                    width={44}
                    height={44}
                    className="rounded-full object-cover flex-shrink-0 border-2 border-sky-500/30"
                  />
                  <div className="space-y-0.5">
                    <h1 className="font-[Inter] text-[20px] font-bold leading-[28px] tracking-[-0.4px] text-black">
                      Recap Blog
                    </h1>
                    <p className="font-[Inter] text-[13px] font-normal leading-[18px] tracking-[-0.3px] text-[#8B949E]">
                      @{demoAuthor.username}
                    </p>
                  </div>
                </>
              ) : (
                headerAction
              )}
            </div>

            <div className="flex flex-col items-end gap-3">
              <RecapYearTabs
                value={selectedYear}
                years={availableYears}
                onChange={setSelectedYear}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {mode === "recap" ? (
        /* ── Recap grid ──────────────────────────────────────────────────── */
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Blog count badge */}
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-[15px] font-semibold text-black/80">
              {selectedYear === "ALL" ? "All Recaps" : `${selectedYear} Recaps`}
            </h2>
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[12px] font-semibold text-sky-700">
              {blogsFilteredByYear.length}{" "}
              {blogsFilteredByYear.length === 1 ? "blog" : "blogs"}
            </span>
          </div>

          <ResponsiveGrid<CountrySummary>
            items={countrySummaries}
            minCardWidth={440}
            maxCardWidth={600}
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
                className="h-full overflow-y-auto pr-2 px-4 pt-2 pb-4 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
                      key={blog.slug}
                      blog={blog}
                      isActive={activeBlogSlug === blog.slug}
                      onClick={() => setActiveBlogSlug(blog.slug)}
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
            <div className="h-full w-full overflow-hidden rounded-2xl border border-black/10">
              <MapboxMap
                countryCode={selectedCountry ?? undefined}
                markers={mapMarkers}
                onMarkerClick={navigateToBlog}
                activeMarkerId={activeBlogSlug}
                overlayTopRight={undefined}
              />
            </div>
          </section>
        </div>
      )}
      <ScrollToTopButton scrollContainerRef={mapListScrollRef} />
    </div>
  );
}
