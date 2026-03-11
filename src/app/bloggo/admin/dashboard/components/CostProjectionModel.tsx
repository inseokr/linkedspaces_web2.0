"use client";

import { useState } from "react";

export function CostProjectionModel() {
  const [users, setUsers] = useState(10000);
  const [blogsPerUser, setBlogsPerUser] = useState(1.5);
  const [photosPerBlog, setPhotosPerBlog] = useState(25);
  const [percentCloudPublish, setPercentCloudPublish] = useState(40);
  const [mapLoadsPerUser, setMapLoadsPerUser] = useState(12);
  const [searchesPerUser, setSearchesPerUser] = useState(4);

  // Simple pricing formulas based on standard industry averages
  const cloudUsers = users * (percentCloudPublish / 100);
  const totalPhotos = cloudUsers * blogsPerUser * photosPerBlog;

  // AWS Cost: $0.023/GB for storage (avg 2MB/photo),
  // bandwidth $0.09/GB (avg 5 views per photo per month)
  const storageGb = totalPhotos * 0.002;
  const storageCost = Math.max(0, storageGb - 5) * 0.023;
  const bandwidthGb = storageGb * 5;
  const bandwidthCost = Math.max(0, bandwidthGb - 100) * 0.09;
  const projAwsCost = storageCost + bandwidthCost;

  // Mapbox: $4 per 1k map loads over 50k
  const totalMapLoads = users * mapLoadsPerUser;
  const projMapboxCost = Math.max(0, (totalMapLoads - 50000) / 1000) * 4;

  // Mongo: $65 for base M10 cluster + $0.20/GB over limit
  // (estimating 0.5MB db storage per user)
  const schemaGb = users * 0.0005;
  const projMongoCost = 65 + Math.max(0, schemaGb - 10) * 0.2;

  // Heroku: Baseline $50 fixed scaling model depending on users (very simplistic: +$25 every 2500 users)
  const projHerokuCost = 50 + Math.floor(users / 2500) * 25;

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
            min={1}
            max={100}
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
