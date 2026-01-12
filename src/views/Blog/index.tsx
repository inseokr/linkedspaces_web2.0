type Props = { name: string; id: string };

export default function TripDetailView({ name, id }: Props) {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">Trip</h1>
      <p className="mt-2">name: {name}</p>
      <p>id: {id}</p>
    </main>
  );
}
