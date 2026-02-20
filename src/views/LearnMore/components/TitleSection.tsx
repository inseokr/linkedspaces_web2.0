import Badge from "@/bloggo/components/ui/Badge";
import "../learn_more_theme.css";

export function TitleSection() {
  return (
    <div className="learn-more-root justify-center items-center mt-[88px] mb-[70px] flex flex-col">
      <div className="mb-6">
        <Badge variant="blue">Learn More</Badge>
      </div>
      <h2 className="font-semibold text-2xl [font-family:var(--font-poppins)] text-black">
        Who Are We
      </h2>
      <h1 className="text-[56px] font-semibold [font-family:var(--font-poppins)] text-black">
        LinkedSpaces
      </h1>
      <h2 className="text-2xl font-bold text-center leading-[180%] mt-7 text-black">
        LinkedSpaces is your travel companion! Easily capture, organize, and
        relive
        <br /> your adventures while sharing your stories effortlessly.
      </h2>
    </div>
  );
}
