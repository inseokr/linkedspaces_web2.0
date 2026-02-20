"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MapboxMap, {
  type MarkerData,
} from "@/views/Profile/travel-stats/components/MapBoxMap";
import { mockBlogs, demoAuthor } from "@/bloggo/lib/mock-data";
import Card from "@/bloggo/components/ui/Card";
import Badge from "@/bloggo/components/ui/Badge";
import Button from "@/bloggo/components/ui/Button";

export default function DemoProfileView() {
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [activeBlogId, setActiveBlogId] = useState<string | undefined>(
    mockBlogs[0]?.slug,
  );
  const [focusLatLng, setFocusLatLng] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);

  // Map markers
  const markers: MarkerData[] = useMemo(() => {
    return mockBlogs.map((blog) => ({
      id: blog.slug,
      lat: blog.coordinate.lat,
      lng: blog.coordinate.lng,
      year: new Date(blog.publishedAt).getFullYear(),
      label: blog.coordinate.label,
      imageUrl: blog.coverImage,
      dateLabel: new Date(blog.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    }));
  }, []);

  // Sync scroll to active item
  const scrollToBlog = (slug: string) => {
    setActiveBlogId(slug);
    const el = cardRefs.current[slug];
    if (el && listRef.current) {
      const listTop = listRef.current.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      const offset = elTop - listTop + listRef.current.scrollTop - 20; // 20px padding
      listRef.current.scrollTo({ top: offset, behavior: "smooth" });
    }
  };

  // Sync map center to active item (when clicked from list)
  const handleBlogClick = (slug: string) => {
    const blog = mockBlogs.find((b) => b.slug === slug);
    if (blog) {
      setFocusLatLng({ lat: blog.coordinate.lat, lng: blog.coordinate.lng });
      // Also update active state
      setActiveBlogId(slug);
    }
  };

  // Handle marker click
  const handleMarkerClick = (markerId: string) => {
    scrollToBlog(markerId);
    handleBlogClick(markerId);
  };

  // Scroll spy to update map marker when scrolling list
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    let isScrollingProgrammatically = false; // Simple guard if needed, but for now relying on intersection/position

    const handleScroll = () => {
      // Find the card closest to the top-center of the list view
      const listRect = list.getBoundingClientRect();
      const triggerY = listRect.top + listRect.height / 3; // Trigger at 1/3 viewport height

      let bestSlug = activeBlogId;
      let minDist = Infinity;

      Object.entries(cardRefs.current).forEach(([slug, el]) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Distance from trigger point
        const dist = Math.abs(rect.top - triggerY);

        // Only consider items that are somewhat visible
        if (dist < minDist && dist < listRect.height) {
          minDist = dist;
          bestSlug = slug;
        }
      });

      if (bestSlug && bestSlug !== activeBlogId) {
        setActiveBlogId(bestSlug);
        const blog = mockBlogs.find((b) => b.slug === bestSlug);
        if (blog) {
          setFocusLatLng({
            lat: blog.coordinate.lat,
            lng: blog.coordinate.lng,
          });
        }
      }
    };

    // Debounce scroll handler slightly
    let timeout: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleScroll, 100);
    };

    list.addEventListener("scroll", debouncedScroll, { passive: true });
    return () => list.removeEventListener("scroll", debouncedScroll);
  }, [activeBlogId]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-[var(--bloggo-bg)]">
      {/* Left Panel: Profile Info + Blog List */}
      <aside className="w-full lg:w-[480px] flex-shrink-0 flex flex-col border-r border-[var(--bloggo-border)] bg-gray-50/50">
        {/* Profile Header */}
        <div className="p-6 border-b border-[var(--bloggo-border)] bg-white z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Image
              src={demoAuthor.avatar}
              alt={demoAuthor.name}
              width={64}
              height={64}
              className="rounded-full border-2 border-sky-500/20"
            />
            <div>
              <h1 className="text-xl font-bold text-[var(--bloggo-text-primary)]">
                {demoAuthor.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-[var(--bloggo-text-secondary)]">
                <Badge variant="violet">@{demoAuthor.username}</Badge>
                <span>•</span>
                <span>{demoAuthor.followers.toLocaleString()} followers</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-[var(--bloggo-text-secondary)] line-clamp-2">
            {demoAuthor.bio}
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href={`/bloggo/profile/${demoAuthor.username}`}
              className="flex-1"
            >
              <Button variant="secondary" size="sm" className="w-full">
                View Full Profile
              </Button>
            </Link>
            <Button variant="primary" size="sm" className="flex-1">
              Follow
            </Button>
          </div>
        </div>

        {/* Scrollable Blog List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          {mockBlogs.map((blog) => (
            <div
              key={blog.slug}
              ref={(el) => {
                cardRefs.current[blog.slug] = el;
              }}
              onClick={() => {
                handleBlogClick(blog.slug);
                router.push(`/bloggo/profile/demo/blog/${blog.slug}`);
              }}
              className="cursor-pointer transition-transform duration-300"
            >
              <Card
                padding="none"
                className={`overflow-hidden transition-all duration-300 ${
                  activeBlogId === blog.slug
                    ? "ring-2 ring-sky-500 ring-offset-2 shadow-lg scale-[1.02]"
                    : "hover:shadow-md hover:border-sky-500/30"
                }`}
              >
                <div className="flex h-32 sm:h-36">
                  {/* Image */}
                  <div className="relative w-1/3 min-w-[120px]">
                    <Image
                      src={blog.coverImage}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Badge
                          variant="default"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {blog.coordinate.label}
                        </Badge>
                        <span className="text-xs text-[var(--bloggo-text-muted)]">
                          {new Date(blog.publishedAt).getFullYear()}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-[var(--bloggo-text-primary)] line-clamp-2 leading-tight mb-1">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-[var(--bloggo-text-secondary)] line-clamp-1">
                        {blog.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Link
                        href={`/bloggo/profile/demo/blog/${blog.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-medium text-sky-600 hover:text-sky-500 transition-colors"
                      >
                        Read Post →
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}

          <div className="h-24 flex items-center justify-center text-[var(--bloggo-text-muted)] text-sm">
            End of list
          </div>
        </div>
      </aside>

      {/* Right Panel: Map */}
      <main className="flex-1 relative bg-gray-100 hidden lg:block">
        <MapboxMap
          countryCode="US" // Default needed? or optional
          worldview="US"
          defaultFocusZoom={2} // Zoom out to see world
          focusLatLng={focusLatLng}
          markers={markers}
          activeMarkerId={activeBlogId}
          onMarkerClick={handleMarkerClick}
          // We can use overlayTopRight for extra controls if needed
        />
      </main>

      {/* Mobile Map Toggle could go here if we wanted full mobile support, but for now focusing on desktop split */}
    </div>
  );
}
