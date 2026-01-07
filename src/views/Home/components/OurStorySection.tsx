import { StoryBlock } from "./StoryBlock";

const STORY_BLOCKS = [
  {
    eyebrow: "MOMENTS FADE. WE MAKE THEM STICK",
    title: "Capture the Moment, Effortlessly",
    description:
      "No more digging through your camera roll. Save places with context so nothing gets lost.",
    imageSrc: "/public/images/studiomode.png",
    imageAlt: "App screens on phones",
    reverse: false,
  },
  {
    eyebrow: "YOUR PERSONAL AI AVATAR",
    title: "Talk to Your Yourself, Literally",
    description:
      "Ask natural questions about past moments and instantly pull up the right place and story.",
    imageSrc: "/public/images/ls-agent.png",
    imageAlt: "AI assistant interface on a phone",
    reverse: true,
  },
  // Add more blocks as needed
];

export function OurStorySection() {
  return (
    <section className="w-full">
      {/* Section container */}
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:px-20">
        <div className="space-y-24">
          {STORY_BLOCKS.map((block) => (
            <StoryBlock
              key={block.title}
              eyebrow={block.eyebrow}
              title={block.title}
              description={block.description}
              imageSrc={block.imageSrc}
              imageAlt={block.imageAlt}
              reverse={block.reverse}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
