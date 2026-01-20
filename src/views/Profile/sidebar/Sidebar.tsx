import ProfileSection from "@/views/Profile/sidebar/ProfileSection";
import MenuSection from "@/views/Profile/sidebar/MenuSection";
import FooterSection from "@/views/Profile/sidebar/FooterSection";

const MENU_ITEMS = [
  {
    key: "stats",
    label: "Travel Stats",
    href: "/profile/stats",
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
    <aside className="fixed left-0 top-[77px] z-40 h-[calc(100dvh-77px)] w-80 bg-white b">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="shrink-0">
          <ProfileSection
            name="USER"
            handle="user"
            avatarSrc="/images/profileImg.png"
            stats={[
              { label: "Countries", value: 4 },
              { label: "Cities", value: 102 },
              { label: "Places", value: 129 },
            ]}
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
