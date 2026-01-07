import Image from "next/image";

type StoryBlockProps = {
  eyebrow?: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean; // If true, swap text/media positions on desktop
};

export function StoryBlock({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  reverse = false,
}: StoryBlockProps) {
  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Text */}
      <div className={reverse ? "lg:order-2" : "lg:order-1"}>
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-wide text-zinc-500">
            {eyebrow}
          </p>
        ) : null}

        <h2 className="mt-2 text-3xl font-bold leading-tight text-zinc-900">
          {title}
        </h2>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600">
          {description}
        </p>
      </div>

      {/* Media */}
      <div className={reverse ? "lg:order-1" : "lg:order-2"}>
        {/* Use a wrapper to control sizing like in Figma */}
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[560px]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-contain"
            priority={false}
          />
        </div>
      </div>
    </div>
  );
}
