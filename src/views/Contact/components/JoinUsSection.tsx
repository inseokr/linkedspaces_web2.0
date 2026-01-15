import WhiteOverlayCard from "@/views/Contact/components/WhiteOverlayCard";
import SectionOverlayFromRefToDocumentEnd from "@/views/Contact/components/SectionOverlay";

export default function JoinUsSection() {
  return (
    <section className="relative">
      <SectionOverlayFromRefToDocumentEnd opacity={0.65} extraBottomPx={300}>
        <WhiteOverlayCard
          title="Join Us Today"
          subtitle="Start Now and Thank Yourself Later!"
          overlayOpacity={0} // Overlay is handled by the wrapper
        />
      </SectionOverlayFromRefToDocumentEnd>
    </section>
  );
}
