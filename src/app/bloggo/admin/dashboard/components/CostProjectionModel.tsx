"use client";

import { useState } from "react";

export function CostProjectionModel({
  awsCostBreakdown,
  storageUsedGb,
  currentMau,
  photoCount,
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
  // Baseline: 354 loads in 2 months = 177/month.
  const baselineMonthlyLoads = 177;
  const initialMapLoadsPerUser =
    currentMau && currentMau > 0
      ? Math.round((baselineMonthlyLoads / currentMau) * 10) / 10
      : 12;

  const [users, setUsers] = useState(10000);
  const [blogsPerUser, setBlogsPerUser] = useState(1.5);
  const [photosPerBlog, setPhotosPerBlog] = useState(25);
  const [percentCloudPublish, setPercentCloudPublish] = useState(40);
  const [mapLoadsPerUser, setMapLoadsPerUser] = useState(
    initialMapLoadsPerUser,
  );
  const [searchesPerUser, setSearchesPerUser] = useState(4);

  // Simple pricing formulas based on standard industry averages
  const cloudUsers = users * (percentCloudPublish / 100);
  const totalPhotos = cloudUsers * blogsPerUser * photosPerBlog;

  // Real baseline calculation for AWS costs
  // Use actual S3 object count (photoCount) as the primary baseline if available.
  // This is the most accurate multiplier baseline because those photos drove the actual bill we see.
  const baselinePhotos =
    photoCount && photoCount > 0
      ? photoCount
      : storageUsedGb && storageUsedGb > 0
        ? storageUsedGb / 0.002
        : 10000 * 0.4 * 1.5 * 25;

  const photoScale = baselinePhotos > 0 ? totalPhotos / baselinePhotos : 0;

  let projAwsCost = 0;

  if (awsCostBreakdown) {
    // Make accurate projection based on actual real-world billing extrapolated to a month
    // storageCost is exact storage pricing currently used, dataTransfer/requests is exact bandwidth/requests.
    // Multiply by scale.
    const scaledStorage = awsCostBreakdown.storageCost * photoScale;
    const scaledBandwidthAndRequests =
      (awsCostBreakdown.dataTransferCost + awsCostBreakdown.requestsCost) *
      photoScale;
    projAwsCost = scaledStorage + scaledBandwidthAndRequests;
  } else {
    // Fallback simple pricing formulas if real data is absent
    const storageGb = totalPhotos * 0.002;
    const storageCost = Math.max(0, storageGb - 5) * 0.023;
    const bandwidthGb = storageGb * 5;
    const bandwidthCost = Math.max(0, bandwidthGb - 100) * 0.09;
    projAwsCost = storageCost + bandwidthCost;
  }

  // Mapbox: Tiered pricing for GL JS v2+ ($5.00, $4.00, $3.00 tiers)
  const totalMapLoads = users * mapLoadsPerUser;
  const projMapboxCost = (() => {
    if (totalMapLoads <= 50000) return 0;
    let remaining = totalMapLoads - 50000;
    let cost = 0;

    // Tier 1: 50,001 - 100,000 loads ($5.00/1k)
    const tier1 = Math.min(remaining, 50000);
    cost += (tier1 / 1000) * 5;
    remaining -= tier1;
    if (remaining <= 0) return cost;

    // Tier 2: 100,001 - 200,000 loads ($4.00/1k)
    const tier2 = Math.min(remaining, 100000);
    cost += (tier2 / 1000) * 4;
    remaining -= tier2;
    if (remaining <= 0) return cost;

    // Tier 3: 200,001+ loads ($3.00/1k)
    cost += (remaining / 1000) * 3;
    return cost;
  })();

  // Mongo Atlas: Tiered pricing (M10, M20, M30) + $0.25/GB for extra storage
  // (estimating 0.5MB db storage per user)
  const schemaGb = users * 0.0005;
  const projMongoCost = (() => {
    if (schemaGb <= 10) return 57; // M10 Base
    if (schemaGb <= 20) return 144; // M20 Base
    if (schemaGb <= 40) return 389; // M30 Base
    // Scale M30 with additional storage overage
    return 389 + (schemaGb - 40) * 0.25;
  })();

  // Heroku: Scaling dynos based on traffic load (1 dyno per 50k users, min 2)
  // Tiers: Standard-1X ($25), Standard-2X ($50), Performance-M ($250)
  const dynoCount = Math.max(2, Math.ceil(users / 50000));
  const projHerokuCost = (() => {
    if (users < 50000) return dynoCount * 25; // Standard-1X
    if (users < 200000) return dynoCount * 50; // Standard-2X
    return dynoCount * 250; // Performance-M (Dedicated)
  })();

  const totalMonthlyCost =
    projAwsCost + projMapboxCost + projMongoCost + projHerokuCost;
  const costPerUser = users > 0 ? totalMonthlyCost / users : 0;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        4. Cost Projection Model
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Interactive calculator to estimate unit economics at scale.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
            Inputs
          </h3>

          <SliderInput
            label="Projected Active Users"
            value={users}
            onChange={setUsers}
            min={100}
            max={500000}
            step={1000}
          />
          <SliderInput
            label="Average Blogs Per User"
            value={blogsPerUser}
            onChange={setBlogsPerUser}
            min={0.1}
            max={10}
            step={0.1}
          />
          <SliderInput
            label="Average Photos Per Blog"
            value={photosPerBlog}
            onChange={setPhotosPerBlog}
            min={1}
            max={200}
            step={1}
          />
          <SliderInput
            label="% Users Publishing to Cloud"
            value={percentCloudPublish}
            onChange={setPercentCloudPublish}
            min={0}
            max={100}
            step={5}
            suffix="%"
          />
          <SliderInput
            label="Map Loads Per User"
            value={mapLoadsPerUser}
            onChange={setMapLoadsPerUser}
            min={0}
            max={1000}
            step={1}
          />
          <SliderInput
            label="Search Autocomplete Per User"
            value={searchesPerUser}
            onChange={setSearchesPerUser}
            min={1}
            max={50}
            step={1}
          />
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2 mb-6">
            Estimated Monthly Costs
          </h3>

          <dl className="space-y-4 flex-grow">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">
                AWS (S3 + Bandwidth)
              </dt>
              <dd className="text-sm font-semibold text-gray-900">
                ${projAwsCost.toFixed(2)}
              </dd>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">Mapbox</dt>
              <dd className="text-sm font-semibold text-gray-900">
                ${projMapboxCost.toFixed(2)}
              </dd>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">
                MongoDB Atlas
              </dt>
              <dd className="text-sm font-semibold text-gray-900">
                ${projMongoCost.toFixed(2)}
              </dd>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">
                Heroku Dynos
              </dt>
              <dd className="text-sm font-semibold text-gray-900">
                ${projHerokuCost.toFixed(2)}
              </dd>
            </div>
          </dl>

          <div className="mt-8 bg-sky-50 rounded-lg p-4 border border-sky-100">
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
        </div>
      </div>
    </section>
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
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-sky-600">
          {value.toLocaleString()}
          {suffix}
        </span>
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
