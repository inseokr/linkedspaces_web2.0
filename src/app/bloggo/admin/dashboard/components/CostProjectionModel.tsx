"use client";

import { useState } from "react";

// Average compressed photo size assumption
const AVG_PHOTO_SIZE_GB = 0.002; // ~2 MB per photo

export function CostProjectionModel({
  currentMau,
}: {
  awsCostBreakdown?: {
    storageCost: number;
    dataTransferCost: number;
    requestsCost: number;
    estimatedMonthlyTotal: number;
  } | null;
  storageUsedGb?: number | null;
  currentMau?: number;
  photoCount?: number | null;
}) {
  const [users, setUsers] = useState(
    currentMau && currentMau > 0 ? currentMau : 10000,
  );
  const [blogsPerUserYearly, setBlogsPerUserYearly] = useState(2);
  const [photosPerBlog, setPhotosPerBlog] = useState(25);
  const [placesPerBlog, setPlacesPerBlog] = useState(5);
  const [poiSelectionPct, setPoiSelectionPct] = useState(60);
  const [viewsPerBlog, setViewsPerBlog] = useState(10);

  // ── Derived quantities ────────────────────────────────────────────────────
  const monthlyNewBlogs = (users * blogsPerUserYearly) / 12;

  // Storage: S3 charges per GB stored/month (cumulative total of all blogs × photos)
  const totalPhotosStored = users * blogsPerUserYearly * photosPerBlog;
  const storageGb = totalPhotosStored * AVG_PHOTO_SIZE_GB;

  // Bandwidth: monthly views × photos downloaded per view
  const monthlyBandwidthGb =
    monthlyNewBlogs * viewsPerBlog * photosPerBlog * AVG_PHOTO_SIZE_GB;

  // Mapbox map loads: creation loads (one per place) + view loads (one per blog view)
  const monthlyMapLoads =
    monthlyNewBlogs * placesPerBlog + monthlyNewBlogs * viewsPerBlog;

  // Search autocomplete: POI selection triggers a search session per place
  const monthlySearches =
    monthlyNewBlogs * placesPerBlog * (poiSelectionPct / 100);

  // ── Cost calculations ─────────────────────────────────────────────────────

  // Photo Storage: $0.023/GB (first 50 TB = 51,200 GB)
  const projStorageCost = Math.min(storageGb, 50 * 1024) * 0.023;

  // Photo Consumption (bandwidth): 500 GB free/month, then $0.09/GB (up to 10 TB)
  const FREE_BANDWIDTH_GB = 500;
  const billableBandwidthGb = Math.min(
    Math.max(0, monthlyBandwidthGb - FREE_BANDWIDTH_GB),
    10 * 1024,
  );
  const projBandwidthCost = billableBandwidthGb * 0.09;

  // Mapbox: 50K free, then $0.005 per load
  const projMapboxCost = Math.max(0, monthlyMapLoads - 50000) * 0.005;

  // Search autocomplete: 100K free/month, then $0.75 per 1K
  const projSearchCost = Math.max(0, monthlySearches - 100000) * (0.75 / 1000);

  // MongoDB Atlas — schema-based document size model
  // place_bytes = 1200 (base) + photos × 1500
  // trip_bytes  = 1300 (base) + places × 70
  // annual_bytes/user = trips × places × place_bytes + trips × trip_bytes
  const MONGO_FIXED_OVERHEAD_KB = 8;
  const placeBytes = 1200 + photosPerBlog * 1500;
  const tripBytes = 1300 + placesPerBlog * 70;
  const annualBytesPerUser =
    blogsPerUserYearly * placesPerBlog * placeBytes +
    blogsPerUserYearly * tripBytes;
  const annualKbPerUser = annualBytesPerUser / 1024;

  const docSizeKb = (years: number) =>
    MONGO_FIXED_OVERHEAD_KB + years * annualKbPerUser;

  // Total DB storage in GB at year 1
  const schemaGb = (users * docSizeKb(1)) / (1024 * 1024);

  // Atlas independent storage scaling:
  // Stay on M10 ($57/mo) and add ~$0.10/GB for storage over 10 GB.
  // Upgrade to M20 only when RAM pressure demands it (~100 GB+ working set).
  // Upgrade to M30 at ~300 GB+.
  const projMongoCost = atlasCostEstimate(schemaGb);

  // Heroku Dynos — RPS-based sizing (Little's Law)
  // Default params: 5% peak concurrency, 3 API calls/min/user, 300ms avg response
  const defaultHerokuSizing = herokuSizing(users, 5, 3, 300, 350, 3);
  const projHerokuCost = defaultHerokuSizing.monthlyCost;

  const totalMonthlyCost =
    projStorageCost +
    projBandwidthCost +
    projMapboxCost +
    projSearchCost +
    projMongoCost +
    projHerokuCost;
  const costPerUser = users > 0 ? totalMonthlyCost / users : 0;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        4. Cost Projection Model
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Interactive calculator — adjust the usage factors below to estimate
        monthly unit economics at scale.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Inputs ─────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
            Usage Factors
          </h3>

          <SliderInput
            label="Active Users"
            value={users}
            onChange={setUsers}
            min={100}
            max={500000}
            step={1000}
          />
          <SliderInput
            label="Blogs per User (yearly)"
            value={blogsPerUserYearly}
            onChange={setBlogsPerUserYearly}
            min={0.1}
            max={24}
            step={0.1}
          />
          <SliderInput
            label="Photos per Blog"
            value={photosPerBlog}
            onChange={setPhotosPerBlog}
            min={1}
            max={200}
            step={1}
          />
          <SliderInput
            label="Places per Blog"
            value={placesPerBlog}
            onChange={setPlacesPerBlog}
            min={1}
            max={50}
            step={1}
          />
          <SliderInput
            label="POI Selection Rate per Place"
            value={poiSelectionPct}
            onChange={setPoiSelectionPct}
            min={0}
            max={100}
            step={5}
            suffix="%"
          />
          <SliderInput
            label="Views per Blog (monthly)"
            value={viewsPerBlog}
            onChange={setViewsPerBlog}
            min={1}
            max={500}
            step={1}
          />

          {/* Derived volume summary */}
          <div className="mt-4 rounded-lg bg-gray-50 border border-gray-100 p-4 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700 mb-2 uppercase tracking-wide text-[11px]">
              Derived Monthly Volumes
            </p>
            <Row label="New blogs / month" value={fmt(monthlyNewBlogs)} />
            <Row
              label="Total photos stored"
              value={`${fmt(totalPhotosStored)} (${storageGb.toFixed(1)} GB)`}
            />
            <Row
              label="Bandwidth served"
              value={`${monthlyBandwidthGb.toFixed(1)} GB`}
            />
            <Row label="Mapbox map loads" value={fmt(monthlyMapLoads)} />
            <Row
              label="Search autocomplete requests"
              value={fmt(monthlySearches)}
            />
          </div>
        </div>

        {/* ── Outputs ────────────────────────────────────────────────── */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 flex flex-col">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2 mb-5">
            Estimated Monthly Costs
          </h3>

          <dl className="space-y-3 flex-grow text-sm">
            <CostRow
              label="Photo Storage (S3)"
              amount={projStorageCost}
              note={`${storageGb.toFixed(1)} GB × $0.023/GB`}
            />
            <CostRow
              label="Photo Consumption (Bandwidth)"
              amount={projBandwidthCost}
              note={
                monthlyBandwidthGb <= FREE_BANDWIDTH_GB
                  ? `${monthlyBandwidthGb.toFixed(1)} GB — within 500 GB free tier`
                  : `${billableBandwidthGb.toFixed(1)} GB billable (${monthlyBandwidthGb.toFixed(1)} GB − 500 GB free) × $0.09/GB`
              }
              warn={monthlyBandwidthGb > 10 * 1024 + FREE_BANDWIDTH_GB}
              warnNote="exceeds 10 TB billable tier"
            />
            <CostRow
              label="Mapbox (Map Loads)"
              amount={projMapboxCost}
              note={
                monthlyMapLoads <= 50000
                  ? `${fmt(monthlyMapLoads)} loads — within free tier`
                  : `${fmt(Math.round(monthlyMapLoads - 50000))} billable × $0.005`
              }
            />
            <CostRow
              label="Search Autocomplete"
              amount={projSearchCost}
              note={
                monthlySearches <= 100000
                  ? `${fmt(monthlySearches)} req — within free tier`
                  : `${fmt(Math.round(monthlySearches - 100000))} billable × $0.75/1K`
              }
            />
            <div className="border-t border-dashed border-gray-200 pt-3 mt-1">
              <CostRow
                label="MongoDB Atlas"
                amount={projMongoCost}
                note={`${schemaGb.toFixed(2)} GB schema (Year 1) — M10 + $0.10/GB independent storage scaling`}
                muted
              />
              <CostRow
                label="Heroku Dynos"
                amount={projHerokuCost}
                note={`${defaultHerokuSizing.dynoCount}× ${defaultHerokuSizing.dynoType} — ${defaultHerokuSizing.peakRps.toFixed(0)} peak RPS`}
                muted
              />
            </div>
          </dl>

          <div className="mt-6 bg-sky-50 rounded-lg p-4 border border-sky-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-sky-900">
                Total Monthly Cost
              </span>
              <span className="text-2xl font-bold text-sky-900">
                $
                {totalMonthlyCost.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="uppercase font-semibold tracking-wider text-sky-700">
                Cost Per Active User
              </span>
              <span className="font-bold text-sky-800">
                ${costPerUser.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Pricing reference */}
          <div className="mt-4 text-[11px] text-gray-400 space-y-0.5 leading-relaxed">
            <p className="font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Pricing Reference
            </p>
            <p>Photo Storage · $0.023/GB (first 50 TB)</p>
            <p>Photo Bandwidth · 500 GB free/mo, then $0.09/GB (up to 10 TB)</p>
            <p>Mapbox · 50K free, then $0.005/load</p>
            <p>Search Autocomplete · 100K free/mo, then $0.75/1K</p>
          </div>
        </div>
      </div>
      {/* ── Heroku Dyno Analysis ──────────────────────────────────────── */}
      <HerokuDynoAnalysis users={users} />
      {/* ── MongoDB Document Analysis ─────────────────────────────────── */}
      <MongoDBDocumentAnalysis
        users={users}
        tripsPerYear={blogsPerUserYearly}
        placesPerTrip={placesPerBlog}
        photosPerPlace={photosPerBlog}
        docSizeKb={docSizeKb}
        annualKbPerUser={annualKbPerUser}
        schemaGb={schemaGb}
      />
    </section>
  );
}

// ── MongoDB Document Analysis Panel ───────────────────────────────────────────

const MONGO_16MB_KB = 16 * 1024;

function MongoDBDocumentAnalysis({
  users,
  tripsPerYear,
  placesPerTrip,
  photosPerPlace,
  docSizeKb,
  annualKbPerUser,
  schemaGb,
}: {
  users: number;
  tripsPerYear: number;
  placesPerTrip: number;
  photosPerPlace: number;
  docSizeKb: (years: number) => number;
  annualKbPerUser: number;
  schemaGb: number;
}) {
  // Year at which doc hits 16 MB limit
  const yearsToLimit =
    annualKbPerUser > 0
      ? Math.ceil((MONGO_16MB_KB - 8) / annualKbPerUser)
      : null;

  const limitWarning =
    yearsToLimit != null && yearsToLimit <= 5
      ? `⚠ At current usage, documents hit the 16 MB hard limit around Year ${yearsToLimit}.`
      : null;

  // Projection table: rows = user counts, cols = year 1 / year 3
  const USER_COUNTS = [1_000, 10_000, 100_000, 1_000_000];
  const toGb = (count: number, yr: number) =>
    (count * docSizeKb(yr)) / (1024 * 1024);

  const fmtGb = (gb: number) =>
    gb >= 1000
      ? `${(gb / 1024).toFixed(1)} TB`
      : `${gb.toFixed(gb >= 10 ? 0 : 1)} GB`;

  const fmtCost = (gb: number) => {
    const c = atlasCostEstimate(gb);
    return c >= 1000 ? `$${(c / 1000).toFixed(1)}K` : `$${Math.round(c)}`;
  };

  return (
    <div className="mt-8 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        MongoDB Document Size Analysis
      </h3>
      <p className="text-xs text-gray-500 mb-5">
        Based on UserSchema model — uses trip/place/photo values from sliders
        above. MongoDB hard limit: 16 MB per document.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Per-user doc growth */}
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Per-User Document Size
          </p>
          <div className="rounded-lg border border-gray-100 overflow-hidden text-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <th className="text-left px-3 py-2">Year</th>
                  <th className="text-right px-3 py-2">Doc Size</th>
                  <th className="text-right px-3 py-2">% of 16 MB limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[1, 3, 5, 10].map((yr) => {
                  const kb = docSizeKb(yr);
                  const pct = (kb / MONGO_16MB_KB) * 100;
                  const over = kb > MONGO_16MB_KB;
                  return (
                    <tr key={yr} className={over ? "bg-red-50" : ""}>
                      <td className="px-3 py-2 text-gray-700">Year {yr}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">
                        {kb >= 1024
                          ? `${(kb / 1024).toFixed(1)} MB`
                          : `${Math.round(kb)} KB`}
                        {over && (
                          <span className="ml-1 text-red-600 font-bold">
                            ✕ over limit
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span
                          className={`text-xs font-semibold ${
                            pct >= 100
                              ? "text-red-600"
                              : pct >= 70
                                ? "text-amber-600"
                                : "text-green-600"
                          }`}
                        >
                          {pct >= 100 ? ">100" : pct.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {limitWarning && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {limitWarning}
            </p>
          )}

          {/* Formula breakdown */}
          <div className="mt-4 rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700 mb-1 uppercase tracking-wide text-[10px]">
              Size Formula (current inputs)
            </p>
            <p>
              place_bytes = 1,200 + {photosPerPlace} × 1,500 ={" "}
              <span className="font-medium text-gray-800">
                {(1200 + photosPerPlace * 1500).toLocaleString()}
              </span>
            </p>
            <p>
              trip_bytes = 1,300 + {placesPerTrip} × 70 ={" "}
              <span className="font-medium text-gray-800">
                {(1300 + placesPerTrip * 70).toLocaleString()}
              </span>
            </p>
            <p>
              annual_bytes/user = {tripsPerYear} trips × {placesPerTrip} places
              × place_bytes + {tripsPerYear} trips × trip_bytes ={" "}
              <span className="font-medium text-gray-800">
                {annualKbPerUser >= 1024
                  ? `${(annualKbPerUser / 1024).toFixed(1)} MB`
                  : `${Math.round(annualKbPerUser)} KB`}
                /yr
              </span>
            </p>
          </div>
        </div>

        {/* Storage projection table */}
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Total Storage &amp; Atlas Cost by User Count
          </p>
          <div className="rounded-lg border border-gray-100 overflow-hidden text-xs">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-500 uppercase">
                  <th className="text-left px-3 py-2">Users</th>
                  <th className="text-right px-2 py-2">Year 1 Storage</th>
                  <th className="text-right px-2 py-2">Year 1 Cost</th>
                  <th className="text-right px-2 py-2">Year 3 Storage</th>
                  <th className="text-right px-2 py-2">Year 3 Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {USER_COUNTS.map((count) => {
                  const gb1 = toGb(count, 1);
                  const gb3 = toGb(count, 3);
                  const isCurrentScale =
                    users >= count * 0.5 && users < count * 5;
                  return (
                    <tr
                      key={count}
                      className={isCurrentScale ? "bg-indigo-50" : ""}
                    >
                      <td className="px-3 py-2 font-medium text-gray-700">
                        {count.toLocaleString()}
                        {isCurrentScale && (
                          <span className="ml-1 text-[9px] text-indigo-500 font-bold uppercase">
                            ←now
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-right text-gray-700">
                        {fmtGb(gb1)}
                      </td>
                      <td className="px-2 py-2 text-right font-semibold text-gray-900">
                        {fmtCost(gb1)}/mo
                      </td>
                      <td className="px-2 py-2 text-right text-gray-700">
                        {fmtGb(gb3)}
                      </td>
                      <td className="px-2 py-2 text-right font-semibold text-gray-900">
                        {fmtCost(gb3)}/mo
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-[11px] text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600 uppercase tracking-wide text-[10px]">
              Atlas Tier Reference
            </p>
            <p>M10 · $57/mo · 2 GB RAM · 10 GB storage included</p>
            <p>M20 · $144/mo · 4 GB RAM · 20 GB storage included</p>
            <p>M30 · $389/mo · 8 GB RAM · 40 GB storage included</p>
            <p className="text-gray-400 italic">
              Storage scales independently at ~$0.10/GB — stay on M10 until
              RAM/IOPS demand a tier upgrade (~100 GB working set).
            </p>
            <p className="text-gray-400 mt-1">
              Current estimate: {fmtGb(schemaGb)} →{" "}
              <span className="font-semibold text-gray-600">
                {fmtCost(schemaGb)}/mo
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Heroku sizing model ───────────────────────────────────────────────────────

const DYNO_TYPES = [
  { name: "Standard-1X", price: 25, ramMb: 512 },
  { name: "Standard-2X", price: 50, ramMb: 1024 },
  { name: "Performance-M", price: 250, ramMb: 2560 },
  { name: "Performance-L", price: 500, ramMb: 14336 },
] as const;

type DynoOption = {
  dynoType: string;
  dynoPrice: number;
  dynoCount: number;
  monthlyCost: number;
  peakRps: number;
  rpsCapacityPerDyno: number;
  maxConcurrentPerDyno: number;
};

function herokuSizing(
  activeUsers: number,
  peakConcurrentPct: number,
  apiCallsPerMin: number,
  avgResponseMs: number,
  baseAppMemoryMb: number,
  memPerRequestMb: number,
): DynoOption {
  const peakConcurrentUsers = activeUsers * (peakConcurrentPct / 100);
  const peakRps = (peakConcurrentUsers * apiCallsPerMin) / 60;

  let best: DynoOption | null = null;
  for (const dyno of DYNO_TYPES) {
    const usableRam = dyno.ramMb * 0.85 - baseAppMemoryMb;
    if (usableRam <= 0) continue;
    const maxConcurrentPerDyno = usableRam / memPerRequestMb;
    const rpsCapacityPerDyno = maxConcurrentPerDyno / (avgResponseMs / 1000);
    const dynoCount = Math.max(
      2,
      Math.ceil(peakRps / Math.max(rpsCapacityPerDyno, 0.1)),
    );
    const monthlyCost = dynoCount * dyno.price;
    if (!best || monthlyCost < best.monthlyCost) {
      best = {
        dynoType: dyno.name,
        dynoPrice: dyno.price,
        dynoCount,
        monthlyCost,
        peakRps,
        rpsCapacityPerDyno,
        maxConcurrentPerDyno,
      };
    }
  }
  return best!;
}

// ── Heroku Dyno Analysis Panel ────────────────────────────────────────────────

const APP_PROFILES = [
  {
    id: "lightweight",
    label: "Lightweight API",
    description: "Express.js, simple REST, no SSR",
    baseAppMemoryMb: 150,
    memPerRequestMb: 1,
  },
  {
    id: "standard",
    label: "Standard Node.js",
    description: "Express + Mongoose + middleware",
    baseAppMemoryMb: 250,
    memPerRequestMb: 2,
  },
  {
    id: "nextjs",
    label: "Next.js Full-stack",
    description: "SSR + API routes + Mongoose (this app)",
    baseAppMemoryMb: 350,
    memPerRequestMb: 3,
  },
  {
    id: "heavy",
    label: "Heavy Full-stack",
    description: "Next.js + image processing / AI calls",
    baseAppMemoryMb: 500,
    memPerRequestMb: 6,
  },
] as const;

type AppProfileId = (typeof APP_PROFILES)[number]["id"];

function HerokuDynoAnalysis({ users }: { users: number }) {
  const [peakConcurrentPct, setPeakConcurrentPct] = useState(5);
  const [apiCallsPerMin, setApiCallsPerMin] = useState(3);
  const [avgResponseMs, setAvgResponseMs] = useState(300);
  const [profileId, setProfileId] = useState<AppProfileId>("nextjs");

  const profile = APP_PROFILES.find((p) => p.id === profileId)!;
  const { baseAppMemoryMb, memPerRequestMb } = profile;

  const recommended = herokuSizing(
    users,
    peakConcurrentPct,
    apiCallsPerMin,
    avgResponseMs,
    baseAppMemoryMb,
    memPerRequestMb,
  );

  // All options for comparison table
  const allOptions: DynoOption[] = DYNO_TYPES.map((dyno) => {
    const usableRam = dyno.ramMb * 0.85 - baseAppMemoryMb;
    const maxConcurrentPerDyno = Math.max(usableRam, 0) / memPerRequestMb;
    const rpsCapacityPerDyno = maxConcurrentPerDyno / (avgResponseMs / 1000);
    const dynoCount = Math.max(
      2,
      Math.ceil(recommended.peakRps / Math.max(rpsCapacityPerDyno, 0.1)),
    );
    return {
      dynoType: dyno.name,
      dynoPrice: dyno.price,
      dynoCount,
      monthlyCost: dynoCount * dyno.price,
      peakRps: recommended.peakRps,
      rpsCapacityPerDyno,
      maxConcurrentPerDyno,
    };
  });

  const USER_COUNTS = [1_000, 10_000, 100_000, 1_000_000];

  return (
    <div className="mt-8 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Heroku Dyno Sizing Analysis
      </h3>
      <p className="text-xs text-gray-500 mb-5">
        Little&apos;s Law model — dyno count driven by peak RPS and memory per
        in-flight request, not user count directly.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Inputs ── */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Traffic Parameters
          </p>
          <SliderInput
            label="Peak concurrent % of active users"
            value={peakConcurrentPct}
            onChange={setPeakConcurrentPct}
            min={1}
            max={30}
            step={1}
            suffix="%"
          />
          <SliderInput
            label="API calls per user/min (while active)"
            value={apiCallsPerMin}
            onChange={setApiCallsPerMin}
            min={1}
            max={20}
            step={1}
          />
          <SliderInput
            label="Avg API response time"
            value={avgResponseMs}
            onChange={setAvgResponseMs}
            min={50}
            max={3000}
            step={50}
            suffix="ms"
          />

          {/* App profile selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              App Profile
            </p>
            <div className="grid grid-cols-2 gap-2">
              {APP_PROFILES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProfileId(p.id)}
                  className={`text-left rounded-lg border px-3 py-2 text-xs transition-colors ${
                    profileId === p.id
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold">{p.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-75">
                    {p.description}
                  </p>
                </button>
              ))}
            </div>
            <div className="mt-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-500 flex gap-4">
              <span>
                Base process:{" "}
                <strong className="text-gray-700">{baseAppMemoryMb} MB</strong>
              </span>
              <span>
                Per request:{" "}
                <strong className="text-gray-700">{memPerRequestMb} MB</strong>
              </span>
            </div>
          </div>

          {/* Derived summary */}
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700 mb-1 uppercase tracking-wide text-[10px]">
              Derived (at {users.toLocaleString()} active users)
            </p>
            <Row
              label="Peak concurrent users"
              value={Math.round(
                (users * peakConcurrentPct) / 100,
              ).toLocaleString()}
            />
            <Row label="Peak RPS" value={recommended.peakRps.toFixed(1)} />
            <Row
              label="Max concurrent req/dyno"
              value={`${recommended.maxConcurrentPerDyno.toFixed(0)} (${recommended.dynoType})`}
            />
            <Row
              label="RPS capacity/dyno"
              value={recommended.rpsCapacityPerDyno.toFixed(0)}
            />
          </div>
        </div>

        {/* ── Options table ── */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Dyno Options at Current User Count
          </p>
          <div className="rounded-lg border border-gray-100 overflow-hidden text-xs">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-500 uppercase">
                  <th className="text-left px-3 py-2">Type</th>
                  <th className="text-right px-2 py-2">RAM</th>
                  <th className="text-right px-2 py-2">RPS/dyno</th>
                  <th className="text-right px-2 py-2">Count</th>
                  <th className="text-right px-2 py-2">Cost/mo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allOptions.map((opt) => {
                  const dynoSpec = DYNO_TYPES.find(
                    (d) => d.name === opt.dynoType,
                  )!;
                  const isRecommended =
                    opt.monthlyCost === recommended.monthlyCost &&
                    opt.dynoType === recommended.dynoType;
                  const isOom = dynoSpec.ramMb * 0.85 - baseAppMemoryMb <= 0;
                  return (
                    <tr
                      key={opt.dynoType}
                      className={
                        isRecommended
                          ? "bg-emerald-50"
                          : isOom
                            ? "opacity-40"
                            : ""
                      }
                    >
                      <td className="px-3 py-2 font-medium text-gray-700">
                        {opt.dynoType}
                        {isRecommended && (
                          <span className="ml-1 text-[9px] text-emerald-600 font-bold uppercase">
                            ✓ cheapest
                          </span>
                        )}
                        {isOom && (
                          <span className="ml-1 text-[9px] text-red-500">
                            OOM
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-right text-gray-500">
                        {dynoSpec.ramMb >= 1024
                          ? `${(dynoSpec.ramMb / 1024).toFixed(1)} GB`
                          : `${dynoSpec.ramMb} MB`}
                      </td>
                      <td className="px-2 py-2 text-right text-gray-700">
                        {isOom ? "—" : opt.rpsCapacityPerDyno.toFixed(0)}
                      </td>
                      <td className="px-2 py-2 text-right text-gray-700">
                        {isOom ? "—" : opt.dynoCount}
                      </td>
                      <td className="px-2 py-2 text-right font-semibold text-gray-900">
                        ${opt.monthlyCost}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Scale projection */}
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-4">
            Recommended Config by User Scale
          </p>
          <div className="rounded-lg border border-gray-100 overflow-hidden text-xs">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-500 uppercase">
                  <th className="text-left px-3 py-2">Users</th>
                  <th className="text-right px-2 py-2">Peak RPS</th>
                  <th className="text-right px-2 py-2">Config</th>
                  <th className="text-right px-2 py-2">Cost/mo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {USER_COUNTS.map((count) => {
                  const s = herokuSizing(
                    count,
                    peakConcurrentPct,
                    apiCallsPerMin,
                    avgResponseMs,
                    baseAppMemoryMb,
                    memPerRequestMb,
                  );
                  const isCurrentScale =
                    users >= count * 0.5 && users < count * 5;
                  return (
                    <tr
                      key={count}
                      className={isCurrentScale ? "bg-emerald-50" : ""}
                    >
                      <td className="px-3 py-2 font-medium text-gray-700">
                        {count.toLocaleString()}
                        {isCurrentScale && (
                          <span className="ml-1 text-[9px] text-emerald-500 font-bold uppercase">
                            ←now
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-right text-gray-600">
                        {s.peakRps.toFixed(0)}
                      </td>
                      <td className="px-2 py-2 text-right text-gray-700">
                        {s.dynoCount}× {s.dynoType}
                      </td>
                      <td className="px-2 py-2 text-right font-semibold text-gray-900">
                        ${s.monthlyCost.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-gray-400 italic">
            Minimum 2 dynos enforced for zero-downtime deploys. Upgrade tier
            only when Standard-1X count exceeds ~8–10 dynos (operational
            overhead). Autoscaling available on Performance tiers.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Atlas independent storage scaling model (AWS us-east-1):
 * - M10 ($57/mo, 2 GB RAM) handles most storage needs — scale disk independently at ~$0.10/GB over 10 GB.
 * - Upgrade to M20 ($144/mo) only when RAM pressure demands it (~100 GB+ working set).
 * - Upgrade to M30 ($389/mo) at ~300 GB+.
 * Additional storage beyond each tier's default: ~$0.10/GB.
 */
function atlasCostEstimate(gb: number): number {
  if (gb <= 100) return 57 + Math.max(0, gb - 10) * 0.1; // M10 + extra storage
  if (gb <= 300) return 144 + Math.max(0, gb - 20) * 0.1; // M20 + extra storage
  return 389 + Math.max(0, gb - 40) * 0.1; // M30 + extra storage
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

function CostRow({
  label,
  amount,
  note,
  muted,
  warn,
  warnNote,
}: {
  label: string;
  amount: number;
  note?: string;
  muted?: boolean;
  warn?: boolean;
  warnNote?: string;
}) {
  return (
    <div
      className={`flex justify-between items-start border-b border-gray-200 pb-2 ${muted ? "opacity-60" : ""}`}
    >
      <div>
        <dt
          className={`font-medium ${muted ? "text-gray-500" : "text-gray-700"}`}
        >
          {label}
        </dt>
        {note && <p className="text-[11px] text-gray-400 mt-0.5">{note}</p>}
        {warn && warnNote && (
          <p className="text-[11px] text-amber-600 mt-0.5">⚠ {warnNote}</p>
        )}
      </div>
      <dd
        className={`font-semibold ml-4 shrink-0 ${amount === 0 ? "text-green-600" : "text-gray-900"}`}
      >
        ${amount.toFixed(2)}
      </dd>
    </div>
  );
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  const handleNumberInput = (raw: string) => {
    const parsed = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(parsed)) return;
    onChange(Math.min(max, Math.max(min, parsed)));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleNumberInput(e.target.value)}
            className="w-24 rounded border border-gray-300 bg-white px-2 py-0.5 text-sm font-bold text-sky-600 text-right focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300"
          />
          {suffix && (
            <span className="text-sm font-bold text-sky-600">{suffix}</span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
      />
    </div>
  );
}
