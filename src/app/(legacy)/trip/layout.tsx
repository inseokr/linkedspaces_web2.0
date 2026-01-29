"use client";

import ProfileLayout from "@/views/Profile/components/ProfileLayout";

export default function TripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileLayout>{children}</ProfileLayout>;
}
