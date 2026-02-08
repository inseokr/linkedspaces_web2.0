"use client";

import Link from "next/link";

type Props = {
  onAddPlace?: () => void;
};

export default function TravelStatsEmpty({ onAddPlace }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50/50 px-6 py-12 text-center">
      <p className="text-lg font-medium text-gray-700">
        Save your first place to start building your travel story
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Your stats and highlights will appear here as you add places and trips.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/profile/places"
          className="rounded-lg bg-[var(--color-main)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
        >
          View places
        </Link>
        <Link
          href="/profile/my-places"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:ring-offset-2"
        >
          My places
        </Link>
      </div>
    </div>
  );
}
