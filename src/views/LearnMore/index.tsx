import { TitleSection } from "@/views/LearnMore/components/TitleSection";
import { DescriptionSection } from "@/views/LearnMore/components/DescriptionSection";
import { BetaSignUpSection } from "@/views/LearnMore/components/BetaSignupSection";
import JoinFutureSection from "./components/JoinSection";

export default function LearnMoreView() {
  return (
    <div className="bg-white min-h-screen">
      <TitleSection />
      <DescriptionSection />
      <JoinFutureSection />
      <BetaSignUpSection />
    </div>
  );
}
