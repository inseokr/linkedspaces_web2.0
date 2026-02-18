"use client";

import RecapBlogsCarousel from "./RecapBlogsCarousel";
import type { MockRecapBlog } from "@/lib/mockNetwork";
import ResponsiveRecapGrid from "@/views/Profile/recap-blogs/section/ResponsiveRecapGrid";
import AllBlogCard, {
  type AllBlogCardItem,
} from "@/views/Profile/recap-blogs/components/RecapBlogCard";

function mockRecapToAllBlogItem(item: MockRecapBlog): AllBlogCardItem {
  return {
    id: item.id,
    href: item.href ?? "#",
    coverImageUrl: item.coverImageUrl,
    title: item.title,
    locationLabel: item.locationLabel,
    dateLabel: item.dateLabel,
  };
}

export interface RecapsModuleProps {
  items: MockRecapBlog[];
  userPlaceTokens?: Set<string>;
  isLoading?: boolean;
  /** "grid" = Profile Recap Blog style (when Blogs toggle); "carousel" = horizontal scroll with arrows (when All) */
  viewMode?: "carousel" | "grid";
}

export default function RecapsModule({
  items,
  isLoading,
  viewMode = "carousel",
}: RecapsModuleProps) {
  if (isLoading) {
    return (
      <section className="w-full" aria-label="Recap Blogs">
        <div className="mb-3" />
        {viewMode === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        ) : (
          <RecapBlogsCarousel items={[]} isLoading />
        )}
      </section>
    );
  }

  if (viewMode === "grid") {
    return (
      <section className="w-full" aria-label="Recap Blogs">
        <h2 className="mb-4 text-xl font-semibold text-[var(--card-text)]">
          Recap Blogs
        </h2>
        <ResponsiveRecapGrid<MockRecapBlog>
          items={items}
          minCardWidth={310}
          maxCardWidth={320}
          gapClassName="gap-6"
          getKey={(it) => it.id}
          renderItem={(item) => (
            <AllBlogCard
              item={mockRecapToAllBlogItem(item)}
              showVisibilityButton={false}
              className="mx-auto max-w-[420px]"
            />
          )}
        />
      </section>
    );
  }

  return (
    <section className="w-full" aria-label="Recap Blogs">
      <RecapBlogsCarousel items={items} isLoading={false} showArrows />
    </section>
  );
}
