export function VideoSection() {
  return (
    <section className="w-full flex justify-center px-6 pb-16 pt-10">
      <video
        className="w-full max-w-[480px] aspect-[480/610] h-auto rounded-2xl shadow-card border border-[var(--card-border)] bg-black"
        controls
        preload="metadata"
        playsInline
      >
        <source src="/videos/download.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
