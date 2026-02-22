import BloggoRecapEditView from "@/views/Profile/Trip/edit/BloggoRecapEditView";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;
  return <BloggoRecapEditView userId={username} tripId={id} />;
}
