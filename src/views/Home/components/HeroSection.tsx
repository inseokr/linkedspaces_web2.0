import Button from "@/components/ui/Button";
import Link from "next/link";
import Tilt from "@/components/ui/Tilt";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-10 lg:pt-14">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
          {/* Copy */}
          <div className="w-full lg:max-w-[560px] flex flex-col gap-6 lg:gap-8 text-center lg:text-left">
            <h1 className="text-[clamp(34px,8vw,85px)] leading-[1.02] font-bold">
              <span className="block">Never Forget a</span>
              <span className="block">Place Again</span>
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl">
              No more digging through your camera roll to find that place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
              <Button
                variant="sub"
                radius="md"
                asChild
                className="w-full sm:w-[275px] h-12 sm:h-[59px] text-lg sm:text-2xl"
              >
                <Link href="/#beta-sign-up">Request For Beta</Link>
              </Button>

              <Button
                variant="sub"
                radius="md"
                asChild
                className="w-full sm:w-[275px] h-12 sm:h-[59px] text-lg sm:text-2xl"
              >
                <Link href="/learn-more">Learn More</Link>
              </Button>
            </div>
          </div>

          {/* Media */}
          <div className="w-full lg:w-auto flex justify-center lg:justify-end">
            {/* Mobile: no tilt + constrained size */}
            <div className="lg:hidden w-full max-w-[340px] sm:max-w-[420px]">
              <div className="relative w-full aspect-[3/5]">
                <Image
                  src="/gifs/landing-page.gif?v=2"
                  alt="demo"
                  fill
                  className="object-contain"
                  style={{ backgroundColor: "transparent" }}
                  unoptimized
                />
              </div>
            </div>

            {/* Desktop: tilt + side label */}
            <div className="hidden lg:block relative shrink-0">
              <Tilt className="rounded-2xl">
                <div className="relative overflow-visible">
                  <div className="relative w-[420px] aspect-[3/5]">
                    <Image
                      src="/gifs/landing-page.gif?v=2"
                      alt="demo"
                      fill
                      className="object-contain"
                      style={{ backgroundColor: "transparent" }}
                      unoptimized
                    />
                  </div>

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
        </div>
      </div>
    </section>
  );
}
