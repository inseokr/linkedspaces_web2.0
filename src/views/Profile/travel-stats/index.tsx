import OverallJourney from "@/views/Profile/travel-stats/components/OverallJourney";

import MostVisitedSection, {
  CountryStat,
} from "@/views/Profile/travel-stats/section/MostVisitedSection";

import AllCountriesSection, {
  CountryDetail,
} from "@/views/Profile/travel-stats/section/AllCountry";

import MapboxMap from "@/views/Profile/travel-stats/components/MapBoxMap"; // mapbox

export default function ProfileStatsPageView() {
  //test 데이터 start
  const items: CountryStat[] = [
    {
      country: "United States",
      visits: 47,
      subtitle: "Your top destination",
      flagEmoji: "🇺🇸",
    },
    { country: "United Kingdom", visits: 32, flagEmoji: "🇬🇧" },
    { country: "France", visits: 28, flagEmoji: "🇫🇷" },
  ];

  const allCountries: CountryDetail[] = [
    {
      country: "United States",
      flagEmoji: "🇺🇸",
      citiesCount: 12,
      placesCount: 47,
      cities: [
        { city: "New York", places: 18 },
        { city: "Los Angeles", places: 12 },
        { city: "San Francisco", places: 9 },
      ],
    },
    {
      country: "United Kingdom",
      flagEmoji: "🇬🇧",
      citiesCount: 8,
      placesCount: 32,
      cities: [
        { city: "London", places: 15 },
        { city: "Edinburgh", places: 8 },
      ],
    },
  ];
  //test 데이터 end

  return (
    <div className="p-6 space-y-6">
      {/* Title + OverallComment */}
      <div className="flex items-start justify-start gap-6">
        <div className="space-y-1">
          <h1 className="ml-6 font-[Inter] text-[24px] font-bold leading-[32px] tracking-[-0.5px] text-black">
            Your Travel Journey
          </h1>
          <p className="ml-8 font-[Inter] text-[14px] font-normal leading-[20px] tracking-[-0.5px] text-[#8B949E]">
            Building memories around the world
          </p>
        </div>

        <div className="pt-1 ml-15">
          <OverallJourney deltaPlaces={12} />
        </div>
      </div>

      {/* Most Visited */}
      <MostVisitedSection items={items} />

      <div className="ml-12 mr-12 w-[85%] max-w-[930px] h-[320px] rounded-3xl overflow-hidden border border-black/10">
        <MapboxMap highlightIso2={["US", "UK", "FR"]} />
      </div>

      {/* All Countries*/}
      <AllCountriesSection items={allCountries} />
    </div>
  );
}
