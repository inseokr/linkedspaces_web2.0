"use client";

import { useMemo, useState } from "react";

import ResponsiveRecapGrid from "@/views/Profile/recap-blogs/section/ResponsiveRecapGrid";

import CountryRecapCard, {
  type CountryRecapItem,
} from "@/views/Profile/recap-blogs/components/CountryRecapCard";

import AllBlogCard, {
  type AllBlogCardItem,
} from "@/views/Profile/recap-blogs/components/RecapBlogCard";

import ViewAllBlogsButton from "@/views/Profile/recap-blogs/components/ViewAllBlogsButton";

import RecapYearTabs, {
  type RecapYearValue,
} from "@/views/Profile/recap-blogs/components/RecapYearsTab";

import MapboxMap from "@/views/Profile/travel-stats/components/MapBoxMap";

// 420px 세로 컬럼
import RecapBlogColumn from "@/views/Profile/recap-blogs/section/RecapBlogColumn";

// Daytab
import DayTabs, {
  type DayTab,
  type DayValue,
  getTripDayCountInclusive,
} from "@/views/Profile/recap-blogs/BlogPage/components/DayTab";

type Mode = "recap" | "allBlogs";
type View = "grid" | "map" | "recapBlog";

/** 단일 원천 데이터: 블로그 (lat/lng 추가) */
type BlogItem = {
  id: string;
  href: string;
  coverImageUrl: string;
  title: string;

  countryCode: string;
  countryName: string;

  visitedFrom: string;
  visitedTo?: string;

  locationLabel?: string;

  /** 지도 마커용 좌표 */
  lat: number;
  lng: number;
};

function getYear(isoDate: string) {
  return new Date(isoDate).getFullYear();
}

function formatDateLabel(fromISO: string, toISO?: string) {
  const from = new Date(fromISO);
  const to = toISO ? new Date(toISO) : null;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const pad2 = (n: number) => String(n).padStart(2, "0");

  const fromStr = `${from.getFullYear()} ${monthNames[from.getMonth()]} ${pad2(
    from.getDate(),
  )}`;

  if (!to) return fromStr;

  const toStr = `${monthNames[to.getMonth()]} ${pad2(to.getDate())}`;
  return `${fromStr}-${toStr}`;
}

/** MapboxMap에 넘길 마커 데이터 타입 */
type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  year: number;
  label: string;
  imageUrl: string;
};

export default function ProfileRecapBlogsView() {
  const [selectedYear, setSelectedYear] = useState<RecapYearValue>("ALL");
  const [mode, setMode] = useState<Mode>("recap");

  /** grid ↔ map */
  const [view, setView] = useState<View>("grid");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(
    null,
  );

  const openMapForCountry = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    setView("map");
  };

  const backToGrid = () => {
    setView("grid");
    setSelectedCountryCode(null);
  };

  /**단일 원천: blogItems (lat/lng 채워넣기) */
  const blogItems: BlogItem[] = [
    {
      id: "blog-1",
      href: "/blogs/1",
      coverImageUrl: "/images/recap/kr.png",
      title: "Exploring the Wonders of Swiss",
      countryCode: "CH",
      countryName: "Switzerland",
      visitedFrom: "2024-12-27",
      visitedTo: "2024-12-29",
      locationLabel: "Swiss Alps",
      lat: 46.8182,
      lng: 8.2275,
    },
    {
      id: "blog-2",
      href: "/blogs/2",
      coverImageUrl: "/images/recap/us.png",
      title: "Road trip in California",
      countryCode: "US",
      countryName: "United States",
      visitedFrom: "2025-01-10",
      visitedTo: "2025-01-12",
      locationLabel: "Big Sur",
      lat: 36.2704,
      lng: -121.8081,
    },
    {
      id: "blog-3",
      href: "/blogs/3",
      coverImageUrl: "/images/recap/us.png",
      title: "Road trip in California",
      countryCode: "US",
      countryName: "United States",
      visitedFrom: "2025-01-10",
      visitedTo: "2025-01-12",
      locationLabel: "Near ND",
      lat: 47.5515,
      lng: -101.002,
    },
    {
      id: "blog-4",
      href: "/blogs/4",
      coverImageUrl: "/images/recap/gb.png",
      title: "London Walks",
      countryCode: "GB",
      countryName: "United Kingdom",
      visitedFrom: "2024-06-01",
      visitedTo: "2024-06-03",
      locationLabel: "London",
      lat: 51.5072,
      lng: -0.1276,
    },
    {
      id: "blog-5",
      href: "/blogs/5",
      coverImageUrl: "/images/recap/us.png",
      title: "Road trip in California (2024)",
      countryCode: "US",
      countryName: "United States",
      visitedFrom: "2024-01-10",
      visitedTo: "2024-01-12",
      locationLabel: "Big Sur2",
      lat: 32.2704,
      lng: -115.8081,
    },
  ];

  /** years 탭도 blogItems에서 파생 */
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const b of blogItems) {
      set.add(getYear(b.visitedFrom));
      if (b.visitedTo) set.add(getYear(b.visitedTo));
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [blogItems]);

  /** 공통 필터: selectedYear 기준으로 blogItems만 필터 */
  const filteredBlogItems = useMemo(() => {
    if (selectedYear === "ALL") return blogItems;

    return blogItems.filter((b) => {
      const y1 = getYear(b.visitedFrom);
      const y2 = b.visitedTo ? getYear(b.visitedTo) : y1;
      return y1 === selectedYear || y2 === selectedYear;
    });
  }, [blogItems, selectedYear]);

  /** countryCode를 item에 싣기 위한 확장 타입 */
  type CountryRecapItemWithCode = CountryRecapItem & { countryCode: string };

  /** recap 모드에서 쓸 CountryRecapItem[] (filteredBlogItems에서 파생) */
  const recapItems = useMemo<CountryRecapItemWithCode[]>(() => {
    const map = new Map<
      string,
      { countryName: string; coverImageUrl: string; years: Set<number> }
    >();

    for (const b of filteredBlogItems) {
      const key = b.countryCode;
      const fromY = getYear(b.visitedFrom);
      const toY = b.visitedTo ? getYear(b.visitedTo) : fromY;

      if (!map.has(key)) {
        map.set(key, {
          countryName: b.countryName,
          coverImageUrl: b.coverImageUrl,
          years: new Set<number>(),
        });
      }

      const entry = map.get(key)!;
      entry.years.add(fromY);
      entry.years.add(toY);
    }

    return Array.from(map.entries()).map(([countryCode, v]) => {
      const yearsArr = Array.from(v.years).sort((a, b) => b - a);
      return {
        id: `${countryCode.toLowerCase()}-${yearsArr.join("-")}`,
        countryCode,
        countryName: v.countryName,
        coverImageUrl: v.coverImageUrl,
        years: yearsArr,
        href: `/profile/recap-blog/${countryCode.toLowerCase()}`,
      };
    });
  }, [filteredBlogItems]);

  /** allBlogs 모드에서 쓸 AllBlogCardItem[] (filteredBlogItems에서 파생) */
  const allBlogItems = useMemo<AllBlogCardItem[]>(() => {
    return filteredBlogItems.map((b) => ({
      id: b.id,
      href: b.href,
      coverImageUrl: b.coverImageUrl,
      title: b.title,
      locationLabel: b.locationLabel ?? b.countryName,
      dateLabel: formatDateLabel(b.visitedFrom, b.visitedTo),
    }));
  }, [filteredBlogItems]);

  /** map 뷰 왼쪽 리스트: (연도 필터 적용된) + 선택 나라만 */
  const mapLeftBlogItems = useMemo<AllBlogCardItem[]>(() => {
    if (!selectedCountryCode) return [];

    return filteredBlogItems
      .filter((b) => b.countryCode === selectedCountryCode)
      .map((b) => ({
        id: b.id,
        href: b.href,
        coverImageUrl: b.coverImageUrl,
        title: b.title,
        locationLabel: b.locationLabel ?? b.countryName,
        dateLabel: formatDateLabel(b.visitedFrom, b.visitedTo),
      }));
  }, [filteredBlogItems, selectedCountryCode]);

  /**map 뷰 마커: (연도 필터 적용된) + 선택 나라만 */
  const mapMarkers = useMemo<MarkerData[]>(() => {
    if (!selectedCountryCode) return [];

    return filteredBlogItems
      .filter((b) => b.countryCode === selectedCountryCode)
      .map((b) => ({
        id: b.id,
        lat: b.lat,
        lng: b.lng,
        year: getYear(b.visitedFrom),
        label: b.locationLabel ?? b.countryName,
        imageUrl: b.coverImageUrl,
      }));
  }, [filteredBlogItems, selectedCountryCode]);

  /** view가 map이면: 왼쪽 리스트 + 오른쪽 지도 */
  const renderGridOrMap = () => {
    if (view === "map") {
      return (
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: 420px vertical column */}
          <aside className="w-full lg:w-[420px] shrink-0">
            <div className="h-[520px] overflow-y-auto pr-2">
              <RecapBlogColumn
                items={mapLeftBlogItems}
                gapClassName="gap-6"
                onVisibilityClick={(item) => console.log("toggle", item.id)}
                showVisibilityButton
              />

              {mapLeftBlogItems.length === 0 && (
                <div className="mt-4 rounded-2xl border border-black/10 p-4 text-sm text-black/60">
                  No blogs for this country in the selected year.
                </div>
              )}
            </div>
          </aside>

          {/* Right: Map */}
          <section className="min-w-0 flex-1">
            <div className="h-[520px] w-full overflow-hidden rounded-2xl border border-black/10">
              <MapboxMap
                countryCode={selectedCountryCode ?? "US"}
                markers={mapMarkers}
                onMarkerClick={(id) => console.log("marker click:", id)}
              />
            </div>
          </section>
        </div>
      );
    }

    // view === "grid"
    if (mode === "recap") {
      return (
        <ResponsiveRecapGrid<CountryRecapItemWithCode>
          items={recapItems}
          minCardWidth={420}
          getKey={(it) => it.id}
          renderItem={(it) => (
            <CountryRecapCard
              item={it}
              onSelect={(code) => openMapForCountry(code)}
            />
          )}
        />
      );
    }

    if (view === "recapBlog") {
      //TODO
    }

    // mode === "allBlogs"
    return (
      <ResponsiveRecapGrid<AllBlogCardItem>
        items={allBlogItems}
        minCardWidth={320}
        getKey={(it) => it.id}
        renderItem={(it) => (
          <AllBlogCard
            item={it}
            className="mx-auto max-w-[420px]"
            onVisibilityClick={(blog) => console.log("toggle", blog.id)}
          />
        )}
      />
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="space-y-1">
            <h1 className="ml-6 font-[Inter] text-[24px] font-bold leading-[32px] tracking-[-0.5px] text-black">
              Recap Blog
            </h1>
            <p className="ml-8 font-[Inter] text-[14px] font-normal leading-[20px] tracking-[-0.5px] text-[#8B949E]">
              Building memories around the world
            </p>
          </div>

          <div className="ml-6">
            {mode === "recap" && view === "grid" ? (
              <ViewAllBlogsButton onClick={() => setMode("allBlogs")}>
                View All Blogs
              </ViewAllBlogsButton>
            ) : (
              <ViewAllBlogsButton
                onClick={() => {
                  if (view === "map") {
                    backToGrid(); // map → grid
                  } else {
                    setMode("recap"); // allBlogs → recap
                  }
                }}
              >
                Go Back
              </ViewAllBlogsButton>
            )}
          </div>
        </div>

        <RecapYearTabs
          value={selectedYear}
          years={years}
          onChange={setSelectedYear}
          className="mr-6"
        />
      </div>

      {renderGridOrMap()}
    </div>
  );
}
