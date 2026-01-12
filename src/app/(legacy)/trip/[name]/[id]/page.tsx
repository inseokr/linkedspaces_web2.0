import TripRecapView from "@/views/Trip";

type PageProps = {
  params: Promise<{ name: string; id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { name, id } = await params;
  return <TripRecapView userId={name} tripId={id} />;
}
