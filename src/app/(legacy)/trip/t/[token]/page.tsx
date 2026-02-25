import { decryptShareToken } from "@/lib/shareToken";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function Page({ params }: PageProps) {
  const { token } = await params;
  const result = decryptShareToken(token);

  if (!result) notFound();

  const { username, blogKey } = result;
  redirect(`/trip/${username}/${blogKey}`);
}
