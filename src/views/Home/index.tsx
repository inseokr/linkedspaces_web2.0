import { HeroSection } from "./components/HeroSection";
import { OurStorySection } from "./components/OurStorySection";
import BetaSignUpSection from "./components/BetaSignupSection";
import { ScrollManager } from "@/components/behavior/ScrollManager";
import { VideoSection } from "./components/VideoSection";

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
