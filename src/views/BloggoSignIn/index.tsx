import Image from "next/image";
import BloggoSignInSection from "./components/BloggoSignInSection";

export default function BloggoSignInView() {
  return (
    <div className="min-h-screen w-full">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-5">
        {/* LEFT: image (3/5) */}
        <div className="relative lg:col-span-3 overflow-hidden">
          <Image
            src="/images/sign-in-bg2.png"
            alt="Sign in background"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover -scale-x-100"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 lg:block bg-gradient-to-r from-transparent to-white" />
        </div>

        {/* RIGHT: form (2/5) */}
        <div className="lg:col-span-2 bg-white flex items-center justify-center px-6 py-10 lg:px-14">
          <div className="w-full max-w-[420px]">
            <BloggoSignInSection />
          </div>
        </div>
      </div>
    </div>
  );
}
