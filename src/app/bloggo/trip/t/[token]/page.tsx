import { decryptShareToken } from "@/lib/shareToken";
import { notFound } from "next/navigation";
import TripRecapView from "@/views/Profile/Trip/index";

type PageProps = {
  params: Promise<{ token: string }>;
};

/**
 * Share-token handler for bloggo (bloggo.linkedspaces.com/trip/t/:token).
 * Middleware rewrites bloggo.linkedspaces.com/trip/t/TOKEN → /bloggo/trip/t/TOKEN,
 * so this page renders the trip content directly — keeping the encrypted token URL
 * in the browser address bar instead of redirecting to the plain /trip/username/id URL.
 */
export default async function Page({ params }: PageProps) {
  const { token } = await params;
  console.log(`[bloggo/trip/t] received token: ${token}`);

  const result = decryptShareToken(token);
  console.log(`[bloggo/trip/t] decryptShareToken result:`, result);

  if (!result) {
    console.log(`[bloggo/trip/t] decryption failed → 404`);
    notFound();
  }

  const { username, blogKey } = result;
  console.log(
    `[bloggo/trip/t] rendering trip for username="${username}", blogKey=${blogKey}`,
  );

  return (
    <TripRecapView
      userId={username}
      tripId={String(blogKey)}
      basePath="/bloggo/trip"
      brand="bloggo"
    />
  );
}
