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

export default function Sidebar() {
  return (
    <aside className="fixed pl-[11px] top-[77px] z-40 h-[calc(100dvh-77px)] w-80 bg-white b">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="shrink-0 mt-[13px]">
          <ProfileSectionContainer
            name="USER"
            handle="user"
            avatarSrc="/images/profileImg.png"
          />
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
