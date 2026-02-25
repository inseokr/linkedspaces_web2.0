import { decryptShareToken } from "@/lib/shareToken";
import { notFound } from "next/navigation";
import TripRecapView from "@/views/Profile/Trip/index";

type PageProps = {
  params: Promise<{ username: string; id: string }>;
};

/** Share links use .../trip/t/:token; Next.js matches as username=t, id=token. Handle here. */
function isShareTokenPath(username: string, id: string): boolean {
  return username === "t" && /^[A-Za-z0-9_-]{20,}$/.test(id);
}

export default async function Page({ params }: PageProps) {
  const { username, id } = await params;

  if (isShareTokenPath(username, id)) {
    const result = decryptShareToken(id);
    if (!result) notFound();
    // Render directly to keep the token URL in the browser address bar.
    return (
      <TripRecapView
        userId={result.username}
        tripId={String(result.blogKey)}
        basePath="/bloggo/trip"
        brand="bloggo"
      />
    );
  }

  return (
    <TripRecapView
      userId={username}
      tripId={id}
      basePath="/bloggo/trip"
      brand="bloggo"
    />
  );
}
