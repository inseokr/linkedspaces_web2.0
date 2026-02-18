"use client";

import Image from "next/image";
import type { NetworkRecapBlogItem } from "@/lib/explore/exploreTypes";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";
import Button from "@/components/ui/Button";

export interface RecapBlogsListProps {
  blogs: NetworkRecapBlogItem[];
  onBlogClick?: (blog: NetworkRecapBlogItem) => void;
  isLoading?: boolean;
}

export default function RecapBlogsList({
  blogs,
  onBlogClick,
  isLoading,
}: RecapBlogsListProps) {
  if (isLoading) {
    return (
      <section className="w-full" aria-label="Latest recap blogs">
        <h2 className="mb-3 text-xl font-semibold text-[var(--card-text)]">
          Latest Recap Blogs
        </h2>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-[var(--color-neutral)]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (blogs.length === 0) return null;

  return (
    <section className="w-full" aria-label="Latest recap blogs">
      <h2 className="mb-3 text-xl font-semibold text-[var(--card-text)]">
        Latest Recap Blogs
      </h2>
      <ul className="flex flex-col gap-3">
        {blogs.map((blog) => (
          <li key={blog.id}>
            <article className="flex overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-1 gap-3 p-3">
                <div className="flex gap-1 shrink-0">
                  {blog.previewImageUrls.slice(0, 3).map((url, i) => {
                    const { src, unoptimized } = normalizeImageSrc(url);
                    return (
                      <div
                        key={i}
                        className="relative h-14 w-14 overflow-hidden rounded-lg bg-[var(--color-neutral)]"
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          unoptimized={unoptimized}
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[var(--card-text)] line-clamp-1">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-[var(--card-text-muted)]">
                    {blog.dateRange}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {blog.authorAvatarUrl && (
                      <div className="relative h-5 w-5 overflow-hidden rounded-full">
                        <Image
                          src={normalizeImageSrc(blog.authorAvatarUrl).src}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="20px"
                        />
                      </div>
                    )}
                    <span className="text-xs text-[var(--card-text-muted)]">
                      {blog.authorName}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center p-3 border-l border-[var(--card-border)]">
                <Button
                  type="button"
                  variant="main"
                  radius="full"
                  className="text-xs px-4 py-1.5"
                  onClick={() => onBlogClick?.(blog)}
                >
                  Open recap
                </Button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
