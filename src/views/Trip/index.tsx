"use client";

import TripRecap from "@/legacy-blog/pages/TripRecap";

type Props = { userId: string; tripId: string };

export default function TripRecapView({ userId, tripId }: Props) {
  return <TripRecap userId={userId} tripId={tripId} />;
}
