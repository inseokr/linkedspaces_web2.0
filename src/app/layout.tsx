import "./global.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Montserrat, Poppins } from "next/font/google";
import "@fontsource-variable/wix-madefor-text";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${poppins.variable}`}>
      <body className="min-h-dvh flex flex-col overflow-y-auto">
        <Header />

        <main className="flex-1 px-4 md:px-20">{children}</main>

        <div className="pb-[74px]">
          <Footer />
        </div>
      </body>
    </html>
  );
}
