import BetaSignUpCard from "@/components/BetaSignupCard";

export function BetaSignUpSection() {
  return (
    <div className="mt-13 justify-center items-center flex flex-col font-semibold bg-white text-black">
      <h1 className="text-[56px] [font-family:var(--font-poppins)] text-black">
        LinkedSpaces Beta
      </h1>
      <p className="mt-6 items-center text-base text-black">
        Sign Up and Thank Yourself Later!
      </p>
      <BetaSignUpCard />
    </div>
  );
}
