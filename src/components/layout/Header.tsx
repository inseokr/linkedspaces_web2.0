import Link from "next/link";

export function Header() {
  return (
    <header>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/#our-story">Our Story</Link>
        <Link href="/learn-more">Learn More</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/profile">Profile</Link>
      </nav>
    </header>
  );
}
