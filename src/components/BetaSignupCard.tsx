"use client";

export default function BetaSignupSection() {
  const appStoreUrl = "https://apps.apple.com/us/app/bloggo/id6759849314";

  return (
    <section id="beta-sign-up" className="scroll-mt-28 w-full py-4">
      <div className="mx-auto w-full max-w-[980px] px-6">
        <div className="rounded-[32px] bg-white/85 backdrop-blur-xl p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/20 text-gray-900 transition-all duration-300 hover:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.15)]">
          <div className="flex flex-col gap-6">
            <h2 className="text-[35px] [font-family:var(--font-poppins)] font-bold">
              Tri Beta — Bloggo is Live!
            </h2>

            <p className="text-xl font-medium leading-relaxed text-gray-600/90 max-w-2xl">
              Bloggo is now available on the App Store. Grab the Tri Beta and
              start creating and sharing your stories.
            </p>

            <div className="flex flex-col gap-4">
              <a
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <img
                  src="/images/app-store-badge.svg"
                  alt="Download on the App Store"
                  className="h-12"
                />
              </a>
              <p className="text-sm text-gray-500">Only available on iOS</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
