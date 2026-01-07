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
    <div className="flex flex-col items-center lg:flex-row lg:items-center ">
      {/* Text */}
      <div
        className={`flex w-full flex-col gap-4 text-black whitespace-pre-line lg:max-w-[520px] ${reverse ? "lg:order-2" : "lg:order-1"}`}
      >
        {eyebrow ? (
          <p className="text-lg font-normal tracking-wide">{eyebrow}</p>
        ) : null}

        <h2 className="text-[32px] font-bold leading-tight ">{title}</h2>

        <p className="text-lg font-normal leading-tight">{description}</p>
      </div>

      {/* Media */}
      <div
        className={`${reverse ? "lg:order-1" : "lg:order-2"} w-full lg:flex-1 lg:flex overflow-visible lg:justify-end`}
      >
        <div className="relative aspect-[4/3] w-full ">
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
