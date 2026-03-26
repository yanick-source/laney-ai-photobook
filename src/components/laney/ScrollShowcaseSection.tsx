import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import heroVideo from "@/assets/General/hero-video.mp4";

export function ScrollShowcaseSection() {
  return (
    <ScrollExpandMedia
      mediaType="video"
      mediaSrc={heroVideo}
      bgImageSrc="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop"
      title="Your Memories Deserve More"
      scrollToExpand="Scroll to explore"
      textBlend
    >
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h3 className="text-2xl md:text-3xl font-bold text-white">
          Turn your photos into a story worth holding
        </h3>
        <p className="text-lg text-blue-100/80">
          Laney uses AI to transform your favorite moments into beautifully designed photobooks — in just minutes, not hours.
        </p>
      </div>
    </ScrollExpandMedia>
  );
}
