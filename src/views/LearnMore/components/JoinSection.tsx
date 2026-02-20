import Tilt from "@/components/ui/Tilt";
import Image from "next/image";

export default function JoinFutureSection() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Title */}

        {/* Content */}
        <div className="flex mt-12 items-start justify-center gap-12">
          {/* Left: Phone image */}
          <Tilt className="rounded-2xl">
            {/* Phone / GIF */}
            <div className="w-[420px] h-[700px]">
              <Image
                src="/gifs/learn-about.gif"
                alt="demo"
                width={420}
                height={700}
                className="block w-full h-full object-contain"
                unoptimized
              />
            </div>
          </Tilt>

          {/* Right: Text */}
          <div className="pt-2 flex flex-col gap-8">
            <h2 className=" text-[55px] font-semibold tracking-tight text-[#324158] [font-family:var(--font-poppins)]">
              Join the Future of Travel Apps.
            </h2>
            <div>
              <h3 className="text-3xl font-semibold text-black">Our Story</h3>
              <ul className="list-disc pl-6 text-lg leading-relaxed text-black">
                <li>Save places effortlessly using your photo</li>
                <li>Build your personal travel map</li>
                <li>Add voice memos or captions to enrich your memories.</li>
                <li>Relive your adventures with automated Recap Blogs.</li>
                <li>Create your own Travel Clone</li>
              </ul>
            </div>

            <div>
              <h4 className="text-2xl font-semibold text-black">
                Powered by AI
              </h4>
              <p className="max-w-xl text-lg leading-relaxed">
                Transforming travel into a smarter, seamless, and more
                meaningful experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
