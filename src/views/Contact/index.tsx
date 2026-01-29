import ContactSection from "@/views/Contact/components/ContactSection";
import JoinUsSection from "./components/JoinUsSection";
import Image from "next/image";

// ContactView.tsx
export default function ContactView() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <Image
          className="h-full w-full object-cover"
          src="/images/contact-bg.png"
          alt="Contact background"
          fill
          priority
        />
      </div>

      <div className="relative z-0">
        <ContactSection />
        <JoinUsSection />
      </div>
    </div>
  );
}
