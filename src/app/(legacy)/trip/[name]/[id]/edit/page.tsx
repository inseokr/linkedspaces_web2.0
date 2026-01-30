import TripRecapEditView from "@/views/Profile/Trip/edit/TripRecapEditView";

export default async function Page({
  params,
}: {
  params: Promise<{ name: string; id: string }>;
}) {
  const { name, id } = await params;
  return <TripRecapEditView userId={name} tripId={id} />;
}
