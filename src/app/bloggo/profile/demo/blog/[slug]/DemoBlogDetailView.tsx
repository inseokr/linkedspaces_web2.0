"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import MapboxMap, {
  type MarkerData,
} from "@/views/Profile/travel-stats/components/MapBoxMap";
import { getBlogBySlug, type BlogPlace } from "@/bloggo/lib/mock-data";
import Card from "@/bloggo/components/ui/Card";
import Badge from "@/bloggo/components/ui/Badge";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function DemoBlogDetailView({ params }: Props) {
  const { slug } = use(params);
  const blog = getBlogBySlug(slug);

  if (!blog) notFound();

  const listRef = useRef<HTMLDivElement>(null);
  const placeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [activePlaceId, setActivePlaceId] = useState<string | undefined>(
    blog.places[0]?.id,
  );
  const [focusLatLng, setFocusLatLng] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);

  // Build map markers from blog places
  const markers: MarkerData[] = useMemo(() => {
    return blog.places.map((place, idx) => ({
      id: place.id,
      lat: place.coordinate.lat,
      lng: place.coordinate.lng,
      year: new Date(blog.publishedAt).getFullYear(),
      label: place.name,
      imageUrl: place.photos[0] ?? blog.coverImage,
      dateLabel: `Stop ${idx + 1}`,
    }));
  }, [blog]);

  // Scroll to a specific place card
  const scrollToPlace = (placeId: string) => {
    const el = placeRefs.current[placeId];
    if (el && listRef.current) {
      const listTop = listRef.current.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      const offset = elTop - listTop + listRef.current.scrollTop - 20;
      listRef.current.scrollTo({ top: offset, behavior: "smooth" });
    }
  };

  // Handle clicking a place card
  const handlePlaceClick = (placeId: string) => {
    const place = blog.places.find((p) => p.id === placeId);
    if (place) {
      setFocusLatLng({
        lat: place.coordinate.lat,
        lng: place.coordinate.lng,
      });
      setActivePlaceId(placeId);
    }
  };

  // Handle marker click on map
  const handleMarkerClick = (markerId: string) => {
    scrollToPlace(markerId);
    handlePlaceClick(markerId);
  };

  // Scroll spy: update active place based on scroll position
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const handleScroll = () => {
      const listRect = list.getBoundingClientRect();
      const triggerY = listRect.top + listRect.height / 3;

      let bestId = activePlaceId;
      let minDist = Infinity;

      Object.entries(placeRefs.current).forEach(([id, el]) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - triggerY);
        if (dist < minDist && dist < listRect.height) {
          minDist = dist;
          bestId = id;
        }
      });

      if (bestId && bestId !== activePlaceId) {
        setActivePlaceId(bestId);
        const place = blog.places.find((p) => p.id === bestId);
        if (place) {
          setFocusLatLng({
            lat: place.coordinate.lat,
            lng: place.coordinate.lng,
          });
        }
      }
    };

    let timeout: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleScroll, 100);
    };

    list.addEventListener("scroll", debouncedScroll, { passive: true });
    return () => list.removeEventListener("scroll", debouncedScroll);
  }, [activePlaceId]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-[var(--bloggo-bg)]">
      {/* Left Panel: Blog Header + Place Cards */}
      <aside className="w-full lg:w-[520px] flex-shrink-0 flex flex-col border-r border-[var(--bloggo-border)] bg-gray-50/50">
        {/* Sticky blog header */}
        <div className="p-6 border-b border-[var(--bloggo-border)] bg-white z-10 shadow-sm">
          <Link
            href="/bloggo/profile/demo"
            className="text-sm text-sky-600 hover:text-sky-500 transition-colors mb-3 inline-flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to profile
          </Link>

          {/* Cover image */}
          <div className="relative w-full h-36 rounded-xl overflow-hidden mb-4">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <h1 className="text-lg font-bold text-white leading-tight">
                {blog.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--bloggo-text-muted)]">
            <span>{blog.coordinate.label}</span>
            <span>&middot;</span>
            <span>{blog.readingTime} min read</span>
            <span>&middot;</span>
            <span>
              {blog.places.length} place
              {blog.places.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {blog.tags.map((tag) => (
              <Badge key={tag} variant="violet">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Scrollable place cards */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
        >
          {blog.places.map((place, idx) => (
            <div
              key={place.id}
              ref={(el) => {
                placeRefs.current[place.id] = el;
              }}
              onClick={() => handlePlaceClick(place.id)}
              className="cursor-pointer"
            >
              <Card
                padding="none"
                className={`overflow-hidden transition-all duration-300 ${
                  activePlaceId === place.id
                    ? "ring-2 ring-sky-500 ring-offset-2 shadow-lg"
                    : "hover:shadow-md hover:border-sky-500/30"
                }`}
              >
                {/* Place cover photo */}
                {place.photos.length > 0 && (
                  <div className="relative w-full h-48">
                    <Image
                      src={place.photos[0]}
                      alt={place.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-black/70">
                        {idx + 1} of {blog.places.length}
                      </span>
                    </div>
                  </div>
                )}

                {/* Place content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-sky-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-[var(--bloggo-text-primary)]">
                      {place.name}
                    </h3>
                  </div>
                  <p className="text-sm text-[var(--bloggo-text-secondary)] leading-relaxed">
                    {place.description}
                  </p>

                  {/* Photo thumbnails if more than 1 photo */}
                  {place.photos.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {place.photos.slice(1).map((photo, i) => (
                        <div
                          key={i}
                          className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-[var(--bloggo-border)]"
                        >
                          <Image
                            src={photo}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}

          <div className="h-24 flex items-center justify-center text-[var(--bloggo-text-muted)] text-sm">
            End of places
          </div>
        </div>
      </aside>

      {/* Right Panel: Map */}
      <main className="flex-1 relative bg-gray-100 hidden lg:block">
        <MapboxMap
          countryCode="US"
          worldview="US"
          focusLatLng={focusLatLng}
          markers={markers}
          activeMarkerId={activePlaceId}
          onMarkerClick={handleMarkerClick}
        />
      </main>
    </div>
  );
}
