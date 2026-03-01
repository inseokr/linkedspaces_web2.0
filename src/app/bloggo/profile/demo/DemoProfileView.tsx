"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { mockBlogs, demoAuthor, type BlogPost } from "@/bloggo/lib/mock-data";

import ResponsiveRecapGrid from "@/views/Profile/recap-blogs/section/ResponsiveRecapGrid";
import CountryRecapCard, {
  type CountryRecapItem,
} from "@/views/Profile/recap-blogs/components/CountryRecapCard";
import AllBlogCard, {
  type AllBlogCardItem,
} from "@/views/Profile/recap-blogs/components/RecapBlogCard";
import RecapYearTabs, {
  type RecapYearValue,
} from "@/views/Profile/recap-blogs/components/RecapYearsTab";
import ViewAllBlogsButton from "@/views/Profile/recap-blogs/components/ViewAllBlogsButton";
import RecapBlogColumn from "@/views/Profile/recap-blogs/section/RecapBlogColumn";

import MapboxMap, {
  type MarkerData,
} from "@/views/Profile/travel-stats/components/MapBoxMap";

import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = "recap" | "allBlogs";
type View = "grid" | "map";

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DemoProfileView() {
  const router = useRouter();

  // 1. States
  const [selectedYear, setSelectedYear] = useState<RecapYearValue>("ALL");
  const [mode, setMode] = useState<Mode>("recap");
  const [view, setView] = useState<View>("grid");
  const [isMapOverlayOpen, setIsMapOverlayOpen] = useState(false);
  const mapListScrollRef = useRef<HTMLDivElement | null>(null);
  const [topVisibleBlogSlug, setTopVisibleBlogSlug] = useState<
    string | undefined
  >(undefined);

  // 2. Data Processing
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    mockBlogs.forEach((b) => {
      const y = new Date(b.publishedAt).getFullYear();
      if (Number.isFinite(y)) set.add(y);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, []);

  const blogsFilteredByYear = useMemo(() => {
    if (selectedYear === "ALL") return mockBlogs;
    return mockBlogs.filter(
      (b) => new Date(b.publishedAt).getFullYear() === selectedYear,
    );
  }, [selectedYear]);

  // Transform mockBlogs -> CountryRecapItem[]
  const recapItems: CountryRecapItem[] = useMemo(() => {
    const grouped: Record<string, CountryRecapItem> = {};
    blogsFilteredByYear.forEach((blog) => {
      const code = blog.countryCode;
      const year = new Date(blog.publishedAt).getFullYear();
      if (!grouped[code]) {
        grouped[code] = {
          id: code,
          countryCode: code,
          countryName: blog.countryName,
          coverImageUrl: blog.coverImage,
          years: [year],
          href: "#",
        };
      } else {
        if (!grouped[code].years.includes(year)) grouped[code].years.push(year);
      }
    });
    return Object.values(grouped);
  }, [blogsFilteredByYear]);

  // Transform mockBlogs -> AllBlogCardItem[]
  const allBlogItems: AllBlogCardItem[] = useMemo(() => {
    return blogsFilteredByYear.map((b) => ({
      id: b.slug,
      href: `/bloggo/profile/demo/blog/${b.slug}`,
      coverImageUrl: b.coverImage,
      title: b.title,
      locationLabel: b.countryName,
      dateLabel: new Date(b.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: selectedYear === "ALL" ? "numeric" : undefined,
      }),
      isPublic: true,
    }));
  }, [blogsFilteredByYear, selectedYear]);

  // Map markers
  const mapMarkers: MarkerData[] = useMemo(() => {
    return blogsFilteredByYear.map((b) => ({
      id: b.slug,
      lat: b.coordinate.lat,
      lng: b.coordinate.lng,
      year: new Date(b.publishedAt).getFullYear(),
      label: b.title,
      imageUrl: b.coverImage,
      dateLabel: new Date(b.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        year: selectedYear === "ALL" ? "numeric" : undefined,
      }),
    }));
  }, [blogsFilteredByYear, selectedYear]);

  // 3. Scroll Spy for Map View
  useEffect(() => {
    if (view !== "map") return;
    const root = mapListScrollRef.current;
    if (!root) return;

    let raf = 0;
    const computeTopVisible = () => {
      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>("[data-recap-blog-id]"),
      );
      if (nodes.length === 0) {
        setTopVisibleBlogSlug(undefined);
        return;
      }

      const st = root.scrollTop;
      for (const el of nodes) {
        if (el.offsetTop + el.offsetHeight > st + 4) {
          setTopVisibleBlogSlug(el.dataset.recapBlogId);
          return;
        }
      }
      setTopVisibleBlogSlug(nodes[nodes.length - 1]?.dataset.recapBlogId);
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
  }, [view, allBlogItems.length]);

  // 4. Handlers
  const handleCountrySelect = (code: string) => {
    setView("map");
  };

  const goToBlogDetail = (slug: string) => {
    router.push(`/bloggo/profile/demo/blog/${slug}`);
  };

  const backToGrid = () => setView("grid");

  const headerAction = (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-xl bg-gray-100 p-0.5">
        <button
          onClick={backToGrid}
          className={[
            "px-3 py-1.5 text-[13px] font-semibold transition-all rounded-lg",
            view === "grid"
              ? "bg-white text-black shadow-sm"
              : "text-gray-500 hover:text-black",
          ].join(" ")}
        >
          Grid
        </button>
        <button
          onClick={() => setView("map")}
          className={[
            "px-3 py-1.5 text-[13px] font-semibold transition-all rounded-lg",
            view === "map"
              ? "bg-white text-black shadow-sm"
              : "text-gray-500 hover:text-black",
          ].join(" ")}
        >
          Map
        </button>
      </div>

      {mode === "recap" && view === "grid" ? (
        <ViewAllBlogsButton onClick={() => setMode("allBlogs")}>
          View All Blogs
        </ViewAllBlogsButton>
      ) : (
        <ViewAllBlogsButton
          onClick={() => {
            if (view === "map") backToGrid();
            else setMode("recap");
          }}
        >
          Go Back
        </ViewAllBlogsButton>
      )}
    </div>
  );

  const renderGridOrMap = () => {
    if (view === "map") {
      return (
        <div className="relative flex h-[calc(100vh-180px)] min-h-[520px] flex-col gap-4 lg:flex-row">
          <aside
            className={[
              "shrink-0 h-full",
              isMapOverlayOpen
                ? "absolute inset-0 z-30 w-full"
                : "w-full lg:w-[420px]",
            ].join(" ")}
          >
            <div className="h-full rounded-2xl border border-black/10 bg-white">
              <div
                ref={mapListScrollRef}
                className="h-full min-h-[220px] overflow-y-auto pr-2 px-4 pt-2 pb-4 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <div className="sm:hidden mb-6 flex justify-center">
                  <RecapYearTabs
                    value={selectedYear}
                    years={availableYears}
                    onChange={setSelectedYear}
                  />
                </div>

                <RecapBlogColumn
                  items={allBlogItems}
                  gapClassName="gap-6"
                  showVisibilityButton={false}
                  isExpanded={isMapOverlayOpen}
                  onToggleExpand={() => setIsMapOverlayOpen((v) => !v)}
                  layout={isMapOverlayOpen ? "grid" : "list"}
                  minCardWidth={isMapOverlayOpen ? 200 : undefined}
                  maxCardWidth={isMapOverlayOpen ? 300 : undefined}
                />

                {!isMapOverlayOpen && (
                  <div aria-hidden className="pointer-events-none h-[55vh]" />
                )}
              </div>
            </div>
          </aside>

          <section className="min-w-0 flex-1 h-full">
            <div className="h-full w-full overflow-hidden rounded-2xl border border-black/10">
              <MapboxMap
                mode="place"
                markers={mapMarkers}
                onMarkerClick={(id) => goToBlogDetail(id)}
                activeMarkerId={topVisibleBlogSlug}
                useSimpleMarkers
                overlayTopRight={
                  <div className="hidden sm:block">
                    <RecapYearTabs
                      value={selectedYear}
                      years={availableYears}
                      onChange={setSelectedYear}
                      className="border border-black/10 shadow-[0_12px_26px_rgba(0,0,0,0.16)]"
                    />
                  </div>
                }
              />
            </div>
          </section>
        </div>
      );
    }

    if (mode === "recap") {
      return (
        <>
          <div className="sm:hidden mb-8 flex justify-center">
            <RecapYearTabs
              value={selectedYear}
              years={availableYears}
              onChange={setSelectedYear}
            />
          </div>

          <ResponsiveRecapGrid<CountryRecapItem>
            items={recapItems}
            minCardWidth={300}
            maxCardWidth={600}
            getKey={(it) => it.id}
            renderItem={(it) => (
              <CountryRecapCard
                item={it}
                onSelect={(code) => handleCountrySelect(code)}
                showTripSummary={selectedYear !== "ALL"}
              />
            )}
          />
        </>
      );
    }

    return (
      <>
        <div className="sm:hidden mb-8 flex justify-center">
          <RecapYearTabs
            value={selectedYear}
            years={availableYears}
            onChange={setSelectedYear}
          />
        </div>

        <ResponsiveRecapGrid<AllBlogCardItem>
          items={allBlogItems}
          minCardWidth={310}
          maxCardWidth={320}
          getKey={(it) => it.id}
          renderItem={(it) => (
            <AllBlogCard item={it} className="mx-auto max-w-[420px]" />
          )}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-50 border-b border-black/10 bg-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="mx-auto max-w-7xl">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1 sm:ml-6">
                <h1 className="font-[Inter] text-[24px] font-bold leading-tight tracking-tight text-black">
                  Recap Blog
                </h1>
                <p className="font-[Inter] text-[14px] font-normal text-[#8B949E]">
                  Building memories around the world
                </p>
              </div>

              <div className="flex flex-col items-end gap-3 sm:mr-6">
                {headerAction}
                {view !== "map" && (
                  <div className="hidden sm:flex">
                    <RecapYearTabs
                      value={selectedYear}
                      years={availableYears}
                      onChange={setSelectedYear}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {renderGridOrMap()}
      </main>

      <ScrollToTopButton scrollContainerRef={mapListScrollRef} />
    </div>
  );
}
