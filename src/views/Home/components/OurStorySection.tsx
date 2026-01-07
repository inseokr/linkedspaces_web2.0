import { StoryBlock } from "./StoryBlock";

const STORY_BLOCKS = [
  {
    eyebrow: "MOMENTS FADE. WE MAKE THEM STICK",
    title: "Capture the\n Moment, Effortlessly",
    description:
      "We figure out where you were, ranking the most\n likely spots so nothing gets lost. ",
    imageSrc: "/images/studiomode.png",
    imageAlt: "App screens on phones",
    reverse: false,
  },
  {
    eyebrow: "YOUR PERSONAL AI AVATAR",
    title: "Talk to Yourself,\nLiterally",
    description:
      'LinkedSpaces learns your taste, past moments, and how you speak, so later you can ask, "What was that seafood spot last summer?" and we\'ll pull it up instantly.',
    imageSrc: "/images/ls-agent.png",
    imageAlt: "AI assistant interface on a phone",
    reverse: true,
  },
  {
    eyebrow: "WE GENERATE RECAP BLOGS",
    title: "Say Goodbye to Starting \n from Scratch",
    description:
      "As you save places from your trip, your blog builds itself. Wel'll do the rest. Ready to revisit or share.",
    imageSrc: "/images/recap-blog-mockup2.png",
    imageAlt: "Recap blog interface on a phone",
    reverse: false,
  },
];

export function OurStorySection() {
  return (
    <section id="our-story" className="w-full scroll-mt-20">
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
