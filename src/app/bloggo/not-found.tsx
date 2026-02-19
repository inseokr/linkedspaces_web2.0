import Link from "next/link";
import Container from "@/bloggo/components/ui/Container";
import Button from "@/bloggo/components/ui/Button";

export default function BloggoNotFound() {
  return (
    <Container className="py-32 flex flex-col items-center text-center gap-6">
      <div className="text-8xl font-black gradient-text">404</div>
      <h1 className="text-3xl font-bold text-[var(--bloggo-text-primary)]">
        Page Not Found
      </h1>
      <p className="text-[var(--bloggo-text-secondary)] max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <div className="flex gap-3">
        <Link href="/bloggo">
          <Button variant="primary">Go Home</Button>
        </Link>
        <Link href="/bloggo/support">
          <Button variant="secondary">Get Support</Button>
        </Link>
      </div>
    </Container>
  );
}
