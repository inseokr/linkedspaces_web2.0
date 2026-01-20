import Sidebar from "@/views/Profile/sidebar/Sidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Sidebar />
      <main className="pl-[280px] min-h-dvh">{children}</main>
    </div>
  );
}
