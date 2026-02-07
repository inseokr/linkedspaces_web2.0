import ProfileSectionContainer from "./sections/ProfileSectionContainer";
import MenuSection from "@/views/Profile/sidebar/sections/MenuSection";
import FooterSection from "@/views/Profile/sidebar/sections/FooterSection";

const MENU_ITEMS = [
  {
    key: "stats",
    label: "Travel Stats",
    href: "/profile/travel-stats",
    iconSrc: "/icons/stats.svg",
  },
  {
    key: "my-places",
    label: "My Places",
    href: "/profile/my-places",
    iconSrc: "/icons/map.svg",
    /** Also highlight when on View All Places */
    activePaths: ["/profile/my-places", "/profile/places"],
  },
  {
    key: "top-places",
    label: "Top Places",
    href: "/profile/top-places",
    iconSrc: "/icons/star.svg",
  },
  {
    key: "recap",
    label: "Recap Blogs",
    href: "/profile/recap-blog",
    iconSrc: "/icons/book.svg",
  },
  {
    key: "highlights",
    label: "Highlights",
    href: "/profile/highlights",
    iconSrc: "/icons/globe.svg",
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  /** When true, hide sidebar off-screen (e.g. full screen map). */
  forceHidden?: boolean;
}

export default function Sidebar({
  isOpen,
  onToggle,
  forceHidden = false,
}: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-[77px] z-40 h-[calc(100dvh-77px)] w-80 bg-white transition-transform duration-300 ease-in-out ${
        forceHidden
          ? "-translate-x-full invisible pointer-events-none"
          : isOpen
            ? "translate-x-0"
            : "-translate-x-full"
      }`}
      aria-hidden={forceHidden}
    >
      <div className="flex h-full flex-col overflow-hidden pt-0">
        <div className="shrink-0">
          {/* Pass the sidebar state down to the profile section */}
          <ProfileSectionContainer isOpen={isOpen} onToggle={onToggle} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <MenuSection items={MENU_ITEMS} />
        </div>

        <div className="mt-auto shrink-0">
          <FooterSection />
        </div>
      </div>
    </aside>
  );
}
