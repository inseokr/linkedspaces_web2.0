import Link from "next/link";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Our Story", href: "/#our-story" },
  { label: "Learn More", href: "/learn-more" },
  { label: "Blog", href: "/blog" },
  { label: "Profile", href: "/profile" },
];

export function Header() {
  return (
    <header className="w-full h-[5.5rem] bg-white">
      <div className="mx-auto flex items-center px-0">
        {/* Pills container */}
        <nav
          aria-label="Primary"
          className="flex items-center ml-auto gap-2 bg-white mb-3 mt-7 mr-0 p-1"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-6.5 py-2.5 text-lg font-bold hover:text-[var(--color-main)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
