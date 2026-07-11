const APP_STORE_URL = "https://apps.apple.com/us/app/bloggo/id6759849314";

export default function AppStoreBadge({
  className = "",
}: {
  className?: string;
}) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download Bloggo on the App Store"
      className={className}
    >
      <img
        src="/images/app-store-badge.png"
        alt="Download on the App Store"
        className="h-[54px] w-auto"
      />
    </a>
  );
}
