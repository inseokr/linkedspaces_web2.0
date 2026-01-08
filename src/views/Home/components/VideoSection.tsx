export function VideoSection() {
  return (
    <section className="w-full flex justify-center pb-[66px] pt-4">
      <video
        className="w-[480px] h-[610px]"
        controls
        preload="metadata"
        playsInline
      >
        <source src="/videos/download.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
