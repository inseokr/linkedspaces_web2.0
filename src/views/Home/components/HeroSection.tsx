import Button from "@/components/ui/Button";
import Link from "next/link";
import Tilt from "@/components/ui/Tilt";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-24 lg:pt-32 pb-16 lg:pb-24">
        <div className="flex flex-col items-center text-center gap-6 lg:gap-8">
          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight max-w-4xl">
            <span className="block">Never Forget a</span>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #2563eb 100%)",
              }}
            >
              Place Again
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl text-[#3a3a5a] max-w-2xl leading-relaxed">
            No more digging through your camera roll to find that place.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <Link href="/#beta-sign-up">
              <button className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 border border-sky-500/30 px-7 py-3.5 text-base rounded-xl active:scale-[0.98]">
                Request For Beta
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </Link>
            <Link href="/learn-more">
              <button className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 bg-black/5 hover:bg-black/10 text-[#0a0a0f] border border-black/10 hover:border-black/20 px-7 py-3.5 text-base rounded-xl active:scale-[0.98]">
                Learn More
              </button>
            </Link>
          </div>

          {/* Video / GIF — now below the CTA buttons */}
          <div className="w-full flex justify-center mt-8 lg:mt-12">
            {/* Mobile: no tilt + constrained size */}
            <div className="lg:hidden w-full max-w-[320px] sm:max-w-[380px]">
              <div className="relative w-full aspect-[3/5]">
                <Image
                  src="/gifs/landing-page.gif?v=2"
                  alt="LinkedSpaces demo"
                  fill
                  className="object-contain"
                  style={{ backgroundColor: "transparent" }}
                  unoptimized
                />
              </div>
            </div>

            {/* Desktop: tilt effect */}
            <div className="hidden lg:block">
              <Tilt className="rounded-2xl">
                <div className="relative w-[380px] aspect-[3/5]">
                  <Image
                    src="/gifs/landing-page.gif?v=2"
                    alt="LinkedSpaces demo"
                    fill
                    className="object-contain"
                    style={{ backgroundColor: "transparent" }}
                    unoptimized
                  />
                </div>
              </Tilt>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative radial gradient (matches Bloggo hero) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none opacity-40"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
        }}
      />
    </section>
  );
}
