import { DescriptionBlock } from "./DescriptionBlock";

const DESCRIPTION_BLOCKS = [
  {
    title: "Mission",
    description:
      "To turn moments into lasting memories while\n seamlessly organizing and sharing them with your\n private network.",
    videoSrc: "/videos/recap-blog.mp4",
    videoAlt: "Studio mode demo video",
    reverse: false,
  },
  {
    title: "Vision",
    description:
      "To be the ultimate platform for travelers, transforming how places are saved, organized, and rediscovered, while fostering a trusted network to share and gain personalized recommendations.",
    videoSrc: "/videos/ls-ig-content.mp4",
    videoAlt: "AI assistant demo video",
    reverse: true,
  },
];

export function DescriptionSection() {
  return (
    <section id="our-story" className="w-full scroll-mt-20">
      <div className="mx-auto px-6 py-20 lg:px-50">
        <div className="space-y-24">
          {DESCRIPTION_BLOCKS.map((block) => (
            <DescriptionBlock
              key={block.title}
              title={block.title}
              description={block.description}
              videoSrc={block.videoSrc}
              reverse={block.reverse}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
