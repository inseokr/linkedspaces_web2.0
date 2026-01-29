import { Suspense } from "react";
import ProfileRecapBlogsView from "@/views/Profile/recap-blogs";

export default function RecapBlogPage() {
  return (
    <Suspense fallback={<div>Loading recap blogs...</div>}>
      <ProfileRecapBlogsView />
    </Suspense>
  );
}
