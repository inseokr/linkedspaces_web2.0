import TripDetailView from "@/views/Blog/index";

type PageProps = {
  params: { name: string; id: string };
};

export default function TripDetailPage({ params }: PageProps) {
  return <TripDetailView name={params.name} id={params.id} />;
}
