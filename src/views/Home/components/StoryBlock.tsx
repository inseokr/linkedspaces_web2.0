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
    <div className="grid grid-cols-1 items-center lg:grid-cols-2 lg:gap-16">
      {/* Text */}
      <div
        className={`flex flex-col gap-4 text-[var(--foreground)] whitespace-pre-line ${reverse ? "lg:order-2" : "lg:order-1"}`}
      >
        {eyebrow ? (
          <p className="text-lg font-normal tracking-wide">{eyebrow}</p>
        ) : null}

        <h2 className="text-[32px] font-bold leading-tight ">{title}</h2>

        <p className="text-lg font-normal leading-tight">{description}</p>
      </div>

      {/* Media */}
      <div
        className={`${reverse ? "lg:order-1" : "lg:order-2"} lg:flex lg:justify-end`}
      >
        <div className="relative aspect-[4/3] w-full max-w-[910px]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
