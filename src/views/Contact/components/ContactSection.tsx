import Image from "next/image";
import { ContactForm } from "./ContactForm";

type Props = {
  heroImageSrc?: string;
  heroImageAlt?: string;
};

export default function ContactSection({
  heroImageSrc,
  heroImageAlt = "App preview",
}: Props) {
  return (
    <section className="w-full">
      <div className="mx-auto px-6 py-14">
        <div className="grid items-start gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative min-h-[520px] overflow-hidden rounded-[18px]">
            {/* <Image src={heroImageSrc} alt={heroImageAlt} fill className="object-cover" /> */}
          </div>

          <div className="flex justify-start lg:justify-end">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
