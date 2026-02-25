import { decryptShareToken } from "@/lib/shareToken";
import { notFound, redirect } from "next/navigation";
import TripRecapView from "@/views/Profile/Trip/index";

type PageProps = {
  params: Promise<{ name: string; id: string }>;
};

/** Share links use /trip/t/:token; Next.js matches that as [name]=t, [id]=token. Handle it here. */
function isShareTokenPath(name: string, id: string): boolean {
  return name === "t" && /^[A-Za-z0-9_-]{20,}$/.test(id);
}

export default async function Page({ params }: PageProps) {
  const { name, id } = await params;

  if (isShareTokenPath(name, id)) {
    const result = decryptShareToken(id);
    if (!result) notFound();
    redirect(`/trip/${result.username}/${result.blogKey}`);
  }

  return <TripRecapView userId={name} tripId={id} />;
}
