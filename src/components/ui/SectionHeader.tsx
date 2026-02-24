import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkTitle?: string;
}

export function SectionHeader({ title, href, linkTitle }: SectionHeaderProps) {
  return (
    <div className="flex flex-row items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-[#1a1a1a] md:text-[28px]">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-sm font-semibold text-[#007AFF] hover:underline"
        >
          {linkTitle || "View All"}
        </Link>
      )}
    </div>
  );
}
