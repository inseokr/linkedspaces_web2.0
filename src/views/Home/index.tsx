import { HeroSection } from "./components/HeroSection";
import { OurStorySection } from "./components/OurStorySection";
import { BetaSignupSection } from "./components/BetaSignupSection";

export default function HomeView() {
  return (
    <>
      <HeroSection />
      <OurStorySection />
      <BetaSignupSection />
    </>
  );
}
