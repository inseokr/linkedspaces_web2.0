type DescriptionBlockProps = {
  title: string;
  description: string;
  videoSrc: string;
  reverse?: boolean;
};

export function DescriptionBlock({
  title,
  description,
  videoSrc,
  reverse = false,
}: DescriptionBlockProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16 items-stretch">
      {/* Text */}
      <div className={`flex ${reverse ? "lg:order-2" : "lg:order-1"}`}>
        {/* 이 래퍼가 '비디오 높이'를 따라가고, 그 안에서 텍스트를 세로 중앙으로 */}
        <div className="w-full flex flex-col justify-center text-center gap-4 text-black whitespace-pre-line lg:min-h-[560px]">
          <h2 className="text-[38px] font-semibold [font-family:var(--font-poppins)]">
            {title}
          </h2>
          <p className="text-xl font-bold leading-[180%]">{description}</p>
        </div>
      </div>

      {/* Video */}

      <div
        className={`${reverse ? "lg:order-1" : "lg:order-2"} lg:flex lg:justify-end`}
      >
        <div className="w-full flex justify-center lg:justify-end">
          <div className="relative lg:w-[902px] lg:h-[808px] w-full overflow-hidden rounded-2xl bg-white border-0 outline-none ring-0 shadow-none">
            <video
              className="h-full w-full object-cover bg-white border-0 outline-none ring-0 shadow-none pointer-events-none scale-[1.01]"
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              preload="metadata"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}
