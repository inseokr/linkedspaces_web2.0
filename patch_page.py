import re
import sys

with open('src/app/bloggo/profile/[username]/page.tsx', 'r') as f:
    content = f.read()

# 1. Imports and types
imports_target = """import { MapPin } from 'lucide-react';
import { assetUrl } from '@/api/assets';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogEntry {"""

imports_replacement = """import { MapPin } from 'lucide-react';
import { assetUrl } from '@/api/assets';
import MapboxMap, { type MarkerData } from '@/views/Profile/travel-stats/components/MapBoxMap';

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = "recap" | "mapView";

interface CountrySummary {
  countryCode: string;
  countryName: string;
  coverImage: string | undefined;
  years: number[];
  latestDate: string;
}

interface BlogEntry {"""
if imports_target in content:
    content = content.replace(imports_target, imports_replacement)
else:
    print("Could not patch imports.")
    sys.exit(1)

# 2. Add New Components below Year Filter Tabs
year_tabs_target = """        );
      })}
    </div>
  );
}

// ─── Blog List Card ───────────────────────────────────────────────────────────"""

year_tabs_replacement = """        );
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
             <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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

// ─── Blog List Card ───────────────────────────────────────────────────────────"""
if year_tabs_target in content:
    content = content.replace(year_tabs_target, year_tabs_replacement)
else:
    print("Could not patch year tabs.")
    sys.exit(1)

state_target = """  const [selectedYear, setSelectedYear] = useState<RecapYearValue>('ALL');
  const [activeBlogId, setActiveBlogId] = useState<string | undefined>(undefined);

  const gridRef = useRef<HTMLDivElement | null>(null);

  // ── Detect own profile ──────────────────────────────────────────────────────"""

state_replacement = """  const [selectedYear, setSelectedYear] = useState<RecapYearValue>('ALL');
  const [activeBlogId, setActiveBlogId] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<Mode>('recap');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const mapListScrollRef = useRef<HTMLDivElement | null>(null);

  // ── Detect own profile ──────────────────────────────────────────────────────"""

if state_target in content:
    content = content.replace(state_target, state_replacement)
else:
    print("Could not patch state.")
    sys.exit(1)


hooks_target = """  const filteredBlogs = useMemo(() => {
    if (!profile) return [];
    if (selectedYear === 'ALL') return profile.blogs;
    return profile.blogs.filter((b) => {
      const src = b.createdAt || b.tripDateRangeText || '';
      const match = src.match(/\b(20\d{2}|19\d{2})\b/);
      return match ? Number(match[0]) === selectedYear : false;
    });
  }, [profile, selectedYear]);

  // ── Loading ──────────────────────────────────────────────────────────────────"""

hooks_replacement = """  const filteredBlogs = useMemo(() => {
    if (!profile) return [];
    if (selectedYear === 'ALL') return profile.blogs;
    return profile.blogs.filter((b) => {
      const src = b.createdAt || b.tripDateRangeText || '';
      const match = src.match(/\b(20\d{2}|19\d{2})\b/);
      return match ? Number(match[0]) === selectedYear : false;
    });
  }, [profile, selectedYear]);

  // ── Country summaries (recap grid) ─────────────────────────────────────────
  const countrySummaries = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    for (const blog of filteredBlogs) {
      const countryCode = blog.countryCode || 'UNKNOWN';
      const countryName = blog.countryName || 'Other Destinations';

      const src = blog.createdAt || blog.tripDateRangeText || '';
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
    return Array.from(map.values()).sort((a, b) => a.countryName.localeCompare(b.countryName));
  }, [filteredBlogs]);

  // ── Blogs for the selected country (map view left list) ────────────────────
  const countryBlogs = useMemo(() => {
    if (!selectedCountry) return [];
    return filteredBlogs.filter((b) => (b.countryCode || 'UNKNOWN') === selectedCountry);
  }, [filteredBlogs, selectedCountry]);

  // ── Map markers from countryBlogs ──────────────────────────────────────────
  const mapMarkers: MarkerData[] = useMemo(() => {
    return countryBlogs.map((blog) => {
      const src = blog.createdAt || blog.tripDateRangeText || '';
      const match = src.match(/\b(20\d{2}|19\d{2})\b/);
      const year = match ? Number(match[0]) : new Date().getFullYear();

      return {
        id: blog.blogKey,
        lat: blog.coordinate?.lat ?? 0,
        lng: blog.coordinate?.lng ?? 0,
        year: year,
        label: blog.title || '',
        imageUrl: blog.coverPhotoUrl ?? '',
        dateLabel: blog.tripDateRangeText ?? '',
      };
    });
  }, [countryBlogs]);


  // ── Scroll spy: update active marker as user scrolls the left list ─────────
  useEffect(() => {
    if (mode !== 'mapView') return;
    const root = mapListScrollRef.current;
    if (!root) return;

    let raf = 0;
    const computeTopVisible = () => {
      const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-recap-blog-id]'));
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

    root.addEventListener('scroll', onScroll, { passive: true });
    computeTopVisible();
    return () => {
      root.removeEventListener('scroll', onScroll);
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
      root.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' });
    }
  };

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setMode('mapView');
    setActiveBlogId(undefined);
  };

  const handleGoBack = () => {
    setSelectedCountry(null);
    setMode('recap');
    setActiveBlogId(undefined);
  };

  const headerAction = mode === 'recap' ? null : (
    <ViewAllBlogsButton onClick={handleGoBack}>Go Back</ViewAllBlogsButton>
  );

  const selectedCountryName = useMemo(() => {
    if (!selectedCountry) return '';
    const summary = countrySummaries.find((s) => s.countryCode === selectedCountry);
    return summary?.countryName ?? selectedCountry;
  }, [selectedCountry, countrySummaries]);

  // ── Loading ──────────────────────────────────────────────────────────────────"""

if hooks_target in content:
    content = content.replace(hooks_target, hooks_replacement)
else:
    print("Could not patch hooks.")
    sys.exit(1)


# Header Right Action Patch
header_target = """            {/* Right: year tabs (only shown when there's more than 1 year) */}
            {availableYears.length > 1 && (
              <RecapYearTabs
                value={selectedYear}
                years={availableYears}
                onChange={setSelectedYear}
              />
            )}
          </div>
        </div>
      </div>"""

header_replacement = """            {/* Right: year tabs and optional back button */}
            <div className="flex flex-col items-end gap-3">
              {headerAction}
              {availableYears.length > 1 && mode === 'recap' && (
                <RecapYearTabs
                  value={selectedYear}
                  years={availableYears}
                  onChange={setSelectedYear}
                />
              )}
            </div>
          </div>
        </div>
      </div>"""
if header_target in content:
    content = content.replace(header_target, header_replacement)
else:
    print("Could not patch header right action.")
    sys.exit(1)

content_target = """      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8" ref={gridRef}>

        {/* Blog count badge */}
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-[15px] font-semibold text-black/80">
            {selectedYear === 'ALL' ? 'All Recaps' : `${selectedYear} Recaps`}
          </h2>
          <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[12px] font-semibold text-sky-700">
            {filteredBlogs.length} {filteredBlogs.length === 1 ? 'blog' : 'blogs'}
          </span>
        </div>

        {filteredBlogs.length > 0 ? (
          <ResponsiveGrid<BlogEntry>
            items={filteredBlogs}
            minCardWidth={300}
            maxCardWidth={420}
            getKey={(b) => b.blogKey}
            renderItem={(b) => (
              <BlogListCard
                blog={b}
                isActive={activeBlogId === b.blogKey}
                onClick={() => setActiveBlogId(b.blogKey)}
                username={username}
              />
            )}
          />
        ) : (
          <EmptyBlogs isOwnProfile={isOwnProfile} />
        )}
      </div>
    </div>
  );
}"""

content_replacement = """      {/* ── Content ─────────────────────────────────────────────────────────── */}
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
              {selectedYear === 'ALL' ? 'All Recaps' : `${selectedYear} Recaps`}
            </h2>
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[12px] font-semibold text-sky-700">
              {filteredBlogs.length} {filteredBlogs.length === 1 ? 'blog' : 'blogs'}
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
}"""

if content_target in content:
    content = content.replace(content_target, content_replacement)
else:
    print("Could not patch content.")
    sys.exit(1)

with open('src/app/bloggo/profile/[username]/page.tsx', 'w') as f:
    f.write(content)

print("Patch applied successfully.")
