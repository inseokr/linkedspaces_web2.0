"use client";

/**
 * Travel Stats page — identity-driven self-portrait of how the user explores the world.
 *
 * Added/refactored:
 * - statsTypes.ts: types for headline stats, highlights, scope stats, time scopes.
 * - lib/buildTravelStats.ts: pure aggregator (places + recapBlogs + friends) → timeScopes (lifetime, thisYear, last6Months).
 * - lib/haversine.ts: distance between places for estimatedDistanceMiles.
 * - lib/userToStatsInput.ts: maps getCachedUser() → BuildTravelStatsInput.
 * - hooks/useTravelStats.ts: get user, build stats, scope state (lifetime | thisYear | last6Months).
 * - components: TravelStatsHeader, HeroStatCards, MapFootprint, HighlightsSection, PeopleAndPatternsSection, HeroStatCard, HighlightCard, TravelStatsEmpty, StatsDrawer.
 * Route: /profile/travel-stats (src/app/profile/travel-stats/page.tsx).
 */

import { useState, useEffect } from "react";
import { useTravelStats } from "@/views/Profile/travel-stats/hooks/useTravelStats";
import TravelStatsHeader from "./components/TravelStatsHeader";
import HeroStatCards from "./components/HeroStatCards";
import MapFootprint from "./components/MapFootprint";
import HighlightsSection from "./components/HighlightsSection";
import MostVisitedSection from "./section/MostVisitedSection";
import AllCountriesSection from "./section/AllCountry";
import PeopleAndPatternsSection from "./components/PeopleAndPatternsSection";
import TravelStatsEmpty from "./components/TravelStatsEmpty";
import StatsDrawer from "./components/StatsDrawer";

export default function ProfileStatsPageView() {
  const { scope, setScope, currentScopeStats, hasData } = useTravelStats();
  const [drawer, setDrawer] = useState<{
    open: boolean;
    title: string;
    key: string;
  }>({
    open: false,
    title: "",
    key: "",
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-[40vh] w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="p-6 space-y-6">
        <TravelStatsHeader scope={scope} onScopeChange={setScope} />
        <TravelStatsEmpty />
      </div>
    );
  }

  const geography = currentScopeStats?.geography ?? null;

  return (
    <div className="p-6 space-y-8">
      <TravelStatsHeader scope={scope} onScopeChange={setScope} />

      <section className="space-y-3">
        <HeroStatCards
          stats={currentScopeStats!.headlineStats}
          onStatClick={(key) =>
            setDrawer({ open: true, title: `Breakdown: ${key}`, key })
          }
        />
      </section>

      <HighlightsSection
        highlights={currentScopeStats!.highlights}
        onHighlightClick={(key) =>
          setDrawer({ open: true, title: `Highlight: ${key}`, key })
        }
      />

      <MapFootprint geography={geography} />

      {currentScopeStats!.countriesWithCities.length > 0 && (
        <>
          <MostVisitedSection
            items={currentScopeStats!.countriesWithCities
              .slice(0, 3)
              .map((c, idx) => ({
                country: c.country,
                countryCode: c.countryCode,
                visits: c.placesCount,
                subtitle: idx === 0 ? "Your top destination" : undefined,
              }))}
          />
          <AllCountriesSection
            items={currentScopeStats!.countriesWithCities.map((c) => ({
              country: c.country,
              countryCode: c.countryCode,
              citiesCount: c.citiesCount,
              placesCount: c.placesCount,
              cities: c.cities,
            }))}
            className=""
          />
        </>
      )}

      <PeopleAndPatternsSection
        data={currentScopeStats!.peopleAndPatterns ?? null}
      />

      <StatsDrawer
        open={drawer.open}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
        title={drawer.title}
      >
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            Drill-down for &quot;{drawer.key}&quot; — top 10 list and more
            detail can be wired here.
          </p>
        </div>
      </StatsDrawer>
    </div>
  );
}
