import { HeroSection } from "./components/HeroSection";
import { OurStorySection } from "./components/OurStorySection";
import BetaSignUpSection from "./components/BetaSignupSection";
import { VideoSection } from "./components/VideoSection";

export default function HomeView() {
  return (
    <>
      <HeroSection />
      <OurStorySection />
      <BetaSignUpSection />
      <VideoSection />
    </>
  );
}
