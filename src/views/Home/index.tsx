import { HeroSection } from "./components/HeroSection";
import { OurStorySection } from "./components/OurStorySection";
import BetaSignUpSection from "./components/BetaSignupSection";
import { ScrollManager } from "@/components/behavior/ScrollManager";

export default function HomeView() {
  return (
    <>
      <div id="top-sentinel" />
      <ScrollManager topSentinelId="top-sentinel" />

      <HeroSection />
      <OurStorySection />
      <BetaSignUpSection />
    </>
  );
}
