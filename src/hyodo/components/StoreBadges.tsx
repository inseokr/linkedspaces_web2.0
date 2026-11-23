import { FaApple, FaGooglePlay } from "react-icons/fa";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/hyodo/lib/site";

const STORES = [
  {
    name: "App Store",
    lead: "Download on the",
    href: APP_STORE_URL,
    Icon: FaApple,
  },
  {
    name: "Google Play",
    lead: "Get it on",
    href: PLAY_STORE_URL,
    Icon: FaGooglePlay,
  },
];

/** App Store / Google Play buttons. A store without a URL yet shows "Coming soon". */
export default function StoreBadges({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {STORES.map(({ name, lead, href, Icon }) => {
        const body = (
          <>
            <Icon aria-hidden="true" className="h-6 w-6 shrink-0" />
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[11px] font-semibold opacity-80">
                {href ? lead : "Coming soon to"}
              </span>
              <span className="text-base font-bold">{name}</span>
            </span>
          </>
        );
        const cls =
          "inline-flex min-h-[52px] min-w-[172px] items-center gap-3 rounded-2xl px-4 py-2 transition-colors";
        return href ? (
          <a
            key={name}
            href={href}
            className={`${cls} bg-[var(--hw-ink)] text-white hover:bg-[#120a2b]`}
          >
            {body}
          </a>
        ) : (
          <span
            key={name}
            aria-disabled="true"
            className={`${cls} border border-[var(--hw-border)] bg-white text-[var(--hw-ink-soft)]`}
          >
            {body}
          </span>
        );
      })}
    </div>
  );
}
