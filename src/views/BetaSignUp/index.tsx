import BetaSignUpSection from "@/components/BetaSignupCard";

export default function BetaSignUpView() {
  return (
    <div className="relative min-h-dvh">
      <div className="fixed inset-0 -z-10">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/videos/invite-friends.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative mt-16 z-10 flex items-center justify-center px-4">
        <div className="w-full ">
          <BetaSignUpSection />
        </div>
      </div>
    </div>
  );
}
