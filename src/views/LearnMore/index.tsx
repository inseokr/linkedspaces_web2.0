import { TitleSection } from "@/views/LearnMore/components/TitleSection";
import { DescriptionSection } from "@/views/LearnMore/components/DescriptionSection";
import { BetaSignUpSection } from "@/views/LearnMore/components/BetaSignupSection";

export default function LearnMoreView() {
  return (
    <div>
      <TitleSection />
      <DescriptionSection />
      <BetaSignUpSection />
    </div>
  );
}
