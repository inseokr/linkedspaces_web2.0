import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/bloggo/components/ui/Container";
import Card from "@/bloggo/components/ui/Card";
import Badge from "@/bloggo/components/ui/Badge";
import Button from "@/bloggo/components/ui/Button";
import { demoAuthor, getBlogsByAuthor } from "@/bloggo/lib/mock-data";

const BASE = "/bloggo";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  if (username !== demoAuthor.username) {
    return { title: "Profile Not Found" };
  }
  return {
    title: `${demoAuthor.name} (@${username})`,
    description: demoAuthor.bio,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  if (username !== demoAuthor.username) {
    notFound();
  }

  const posts = getBlogsByAuthor(username);

  return (
    <>
      <section className="border-b border-[var(--bloggo-border)] py-16">
        <Container size="lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Image
              src={demoAuthor.avatar}
              alt={`${demoAuthor.name}'s avatar`}
              width={96}
              height={96}
              className="rounded-2xl border-2 border-sky-500/30 flex-shrink-0"
            />
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-[var(--bloggo-text-primary)]">
                  {demoAuthor.name}
                </h1>
                <Badge variant="violet">@{demoAuthor.username}</Badge>
              </div>
              <p className="text-[var(--bloggo-text-secondary)] max-w-xl leading-relaxed">
                {demoAuthor.bio}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[var(--bloggo-text-primary)]">
                    {demoAuthor.posts}
                  </span>
                  <span className="text-xs text-[var(--bloggo-text-muted)]">
                    Posts
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[var(--bloggo-text-primary)]">
                    {demoAuthor.followers.toLocaleString()}
                  </span>
                  <span className="text-xs text-[var(--bloggo-text-muted)]">
                    Followers
                  </span>
                </div>
              </div>
            </div>
            <Link href={`${BASE}/editor/my-first-post`}>
              <Button variant="primary" size="sm">
                ✍️ Write a Post
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container size="lg">
          <h2 className="text-xl font-semibold text-[var(--bloggo-text-primary)] mb-8">
            All Posts ({posts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`${BASE}/profile/${username}/blog/${post.slug}`}
                className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-2xl"
              >
                <Card
                  hover
                  padding="none"
                  className="overflow-hidden h-full flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="violet">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="font-semibold text-[var(--bloggo-text-primary)] leading-snug group-hover:text-sky-300 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-[var(--bloggo-text-secondary)] line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--bloggo-border)]">
                      <span className="text-xs text-[var(--bloggo-text-muted)]">
                        {new Date(post.publishedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                      <span className="text-xs text-[var(--bloggo-text-muted)]">
                        {post.readingTime} min read
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
