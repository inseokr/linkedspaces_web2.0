import BetaSignUpSection from "@/components/BetaSignupCard";

export default function BetaSignUpView() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/videos/invite-friends.mp4" type="video/mp4" />
      </video>

      {/* Content */}
      <div className="relative mt-47 z-10 flex items-center justify-center px-4">
        <div className="w-full ">
          <BetaSignUpSection />
        </div>
      </div>
    </div>
  );
}
