"use client";

import CountryRecapGrid from "@/views/Profile/recap-blogs/section/CountryRecapGrid";
import type { CountryRecapItem } from "@/views/Profile/recap-blogs/components/CountryRecapCard";
import ViewAllBlogsButton from "@/views/Profile/recap-blogs/components/ViewAllBlogsButton";
import RecapYearTabs, {
  RecapYearValue,
} from "@/views/Profile/recap-blogs/components/RecapYearsTab";

type Mode = "recap" | "allBlogs"; // 모드에 따라 뷰 업데이트 - 나라 섹션 or 블로그 전체 보기 섹션

import { useMemo, useState } from "react";

export default function ProfileRecapBlogsView() {
  // test data
  const recapItems: CountryRecapItem[] = [
    {
      id: "us-2025-2024",
      countryName: "United States",
      coverImageUrl: "/images/recap/us.png",
      years: [2025, 2024],
      href: "/profile/recap-blog/us", // 이동할 페이지.. 나중엔 하나로 합치고 페이지 속 내용만 바꾸기
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
      href: "/profile/recap-blog/kr",
    },
  ];
  // test data 끝~

  //데이터에서 years만 중복 없이 뽑기
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const item of recapItems) {
      for (const y of item.years) set.add(y);
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [recapItems]);

  const [selectedYear, setSelectedYear] = useState<RecapYearValue>("ALL");

  //선택 연도에 따른 필터링
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
            <ViewAllBlogsButton href="/blogs">
              View All Blogs
            </ViewAllBlogsButton>
          </div>
        </div>
        <RecapYearTabs
          value={selectedYear}
          years={years}
          onChange={setSelectedYear}
          className="mr-6"
        />
      </div>
      <CountryRecapGrid
        items={filteredItems}
        minCardWidth={400}
        maxCardWidth={500}
      />
    </div>
  );
}
