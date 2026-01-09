import { HeroSection } from "@/views/Home/components/HeroSection";
import { OurStorySection } from "@/views/Home/components/OurStorySection";
import BetaSignUpSection from "@/components/BetaSignupCard";
import { ScrollManager } from "@/components/behavior/ScrollManager";
import { VideoSection } from "@/views/Home/components/VideoSection";

export default function HomeView() {
  return (
    <>
      <div id="top-sentinel" />
      <ScrollManager topSentinelId="top-sentinel" />

      <HeroSection />
      <OurStorySection />
      <BetaSignUpSection />
      <VideoSection />
    </>
  );
}
