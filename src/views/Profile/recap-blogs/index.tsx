"use client";

import { useMemo, useState } from "react";

import ResponsiveRecapGrid from "@/views/Profile/recap-blogs/section/ResponsiveRecapGrid";

import CountryRecapCard, {
  type CountryRecapItem,
} from "@/views/Profile/recap-blogs/components/CountryRecapCard";

import AllBlogCard, {
  type AllBlogCardItem,
} from "@/views/Profile/recap-blogs/components/RecapBlogCard"; // 경로/파일명 맞춰

import ViewAllBlogsButton from "@/views/Profile/recap-blogs/components/ViewAllBlogsButton";

import RecapYearTabs, {
  type RecapYearValue,
} from "@/views/Profile/recap-blogs/components/RecapYearsTab";

type Mode = "recap" | "allBlogs";

export default function ProfileRecapBlogsView() {
  // recap test data
  const recapItems: CountryRecapItem[] = [
    {
      id: "us-2025-2024",
      countryName: "United States",
      coverImageUrl: "/images/recap/us.png",
      years: [2025, 2024],
      href: "/profile/recap-blog/us",
    },
    {
      id: "kr-2024",
      countryName: "Korea",
      coverImageUrl: "/images/recap/kr.png",
      years: [2024],
      href: "/profile/recap-blog/kr",
    },
    {
      id: "gb-2024",
      countryName: "United Kingdom",
      coverImageUrl: "/images/recap/gb.png",
      years: [2024],
      href: "/profile/recap-blog/gb",
    },
  ];

  //all blogs test data (필요한 변수명: allBlogItems)
  const allBlogItems: AllBlogCardItem[] = [
    {
      id: "blog-1",
      href: "/blogs/1",
      coverImageUrl: "/images/recap/kr.png",
      title: "Exploring the Wonders of Swiss",
      locationLabel: "Swiss Alps",
      dateLabel: "2024 Dec 27-Dec 29",
    },
    {
      id: "blog-2",
      href: "/blogs/2",
      coverImageUrl: "/images/recap/us.png",
      title: "Road trip in California",
      locationLabel: "Big Sur",
      dateLabel: "2025 Jan 10-Jan 12",
    },

    {
      id: "blog-3",
      href: "/blogs/3",
      coverImageUrl: "/images/recap/us.png",
      title: "Road trip in California",
      locationLabel: "Big Sur",
      dateLabel: "2025 Jan 10-Jan 12",
    },

    {
      id: "blog-4",
      href: "/blogs/4",
      coverImageUrl: "/images/recap/us.png",
      title: "Road trip in California",
      locationLabel: "Big Sur",
      dateLabel: "2025 Jan 10-Jan 12",
    },
  ];

  // years 탭 데이터
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const item of recapItems) for (const y of item.years) set.add(y);
    return Array.from(set).sort((a, b) => b - a);
  }, [recapItems]);

  const [selectedYear, setSelectedYear] = useState<RecapYearValue>("ALL");
  const [mode, setMode] = useState<Mode>("recap");

  const filteredItems = useMemo(() => {
    if (selectedYear === "ALL") return recapItems;
    return recapItems.filter((item) => item.years.includes(selectedYear));
  }, [recapItems, selectedYear]);

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
            {mode === "recap" ? (
              <ViewAllBlogsButton onClick={() => setMode("allBlogs")}>
                View All Blogs
              </ViewAllBlogsButton>
            ) : (
              <ViewAllBlogsButton onClick={() => setMode("recap")}>
                Go Back
              </ViewAllBlogsButton>
            )}
          </div>
        </div>

        {/* 필요하면 allBlogs 모드에서 숨기기 */}
        <RecapYearTabs
          value={selectedYear}
          years={years}
          onChange={setSelectedYear}
          className="mr-6"
        />
      </div>

      {mode === "recap" ? (
        <ResponsiveRecapGrid<CountryRecapItem>
          items={filteredItems}
          minCardWidth={400}
          getKey={(it) => it.id}
          renderItem={(it) => <CountryRecapCard item={it} />}
        />
      ) : (
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
      )}
    </div>
  );
}
