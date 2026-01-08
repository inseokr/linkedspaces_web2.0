import Button from "@/components/ui/Button";
import Link from "next/link";
import Tilt from "@/components/ui/Tilt";
import Image from "next/image";

export function HeroSection() {
  return (
    <div className="flex justify-between items-center">
      <section className="flex flex-col gap-8 ml-20 ">
        <h1 className="text-[clamp(32px,5vw,85px)] font-bold">
          <span className="block">Never Forget a</span>
          <span className="block">Place Again</span>
        </h1>
        <p className="text-2xl">
          No more digging through your camera roll to find that place.
        </p>
        <section className="flex gap-12">
          <Button
            radius="md"
            asChild
            className="justify-center items-center px-[26px] py-3 w-[275px] h-[59px] text-2xl"
          >
            <Link href="/#beta-sign-up">Request For Beta</Link>
          </Button>

          <Button
            radius="md"
            asChild
            className="justify-center items-center px-[26px] py-3 w-[275px] h-[59px] text-2xl"
          >
            <Link href="/learn-more">Learn More</Link>
          </Button>
        </section>
      </section>

      <div className="relative mr-[116px] mt-4 shrink-0">
        <Tilt className="rounded-2xl">
          <div className="flex items-center gap-8">
            {/* Phone / GIF */}
            <div className="w-[420px] h-[700px]">
              <Image
                src="/gifs/landing-page.gif"
                alt="demo"
                width={420}
                height={700}
                className="block w-full h-full object-contain"
                unoptimized
              />
            </div>

            {/* Side text (participates in layout + tilts together) */}
            <div
              className="
                absolute
                bottom-12
                left-full
                ml-6
                -rotate-90 origin-left
                text-5xl font-semibold 
                whitespace-pre-line leading-none text-[#324158]
              "
            >
              {"LinkedSpaces\n2025"}
            </div>
          </div>
        </Tilt>
      </div>
    </div>
  );
}
