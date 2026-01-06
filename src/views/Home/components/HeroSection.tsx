import SemiRoundButton from "@/components/ui/SemiRoundButton";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="flex flex-col gap-8 ml-20 ">
      <h1 className="text-[clamp(32px,5vw,85px)] mt-36 font-bold">
        <span className="block">Never Forget a</span>
        <span className="block">Place Again</span>
      </h1>
      <p className="text-2xl">
        No more digging through your camera roll to find that place.
      </p>
      <section className="flex gap-12">
        <SemiRoundButton
          asChild
          className="justify-center items-center px-[26px] py-3 w-[275px] h-[59px] text-2xl"
        >
          <Link href="/beta-sign-up">Request For Beta</Link>
        </SemiRoundButton>

        <SemiRoundButton
          asChild
          className="justify-center items-center px-[26px] py-3 w-[275px] h-[59px] text-2xl"
        >
          <Link href="/learn-more">Learn More</Link>
        </SemiRoundButton>
      </section>
    </section>
  );
}
