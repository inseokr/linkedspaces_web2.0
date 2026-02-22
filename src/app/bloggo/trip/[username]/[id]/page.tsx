import TripRecapView from "@/views/Profile/Trip/index";

type PageProps = {
  params: Promise<{ username: string; id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { username, id } = await params;
  return (
    <TripRecapView userId={username} tripId={id} basePath="/bloggo/trip" />
  );
}
