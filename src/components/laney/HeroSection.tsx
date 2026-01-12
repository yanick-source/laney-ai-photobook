import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroVideo from "@/assets/hero-video.mp4";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-8">
      {/* Background decoration */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-gradient-to-tr from-accent/10 to-primary/10 blur-3xl" />
      
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* Video Section - Left */}
          <div className="relative w-full max-w-[180px] flex-shrink-0 lg:max-w-[220px]">
            <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 shadow-xl shadow-primary/20">
              <video
                autoPlay
                loop
                muted
                playsInline
                poster=""
                className="h-full w-full object-cover"
              >
                <source src={heroVideo} type="video/mp4" />
              </video>
              {/* Subtle border glow */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
            </div>
          </div>
          
          {/* Content Section - Right */}
          <div className="flex flex-1 flex-col justify-start text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 self-center rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-sm font-medium text-primary lg:self-start">
              <Sparkles className="h-4 w-4" />
              AI-gestuurd fotoboek maken
            </div>
            
            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
              Wat ga je vandaag{" "}
              <span className="gradient-text">creëren</span>?
            </h1>
            
            <p className="mx-auto mb-6 max-w-2xl text-base text-muted-foreground lg:mx-0">
              Maak in minuten een professioneel fotoboek met AI. Upload je foto's en laat onze 
              slimme technologie de perfecte layouts, teksten en verhalen voor je maken.
            </p>
            
            <div className="flex justify-center lg:justify-start">
              <Link to="/create">
                <Button 
                  size="lg" 
                  className="gap-2 bg-gradient-to-r from-primary to-accent px-8 py-6 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:opacity-95"
                >
                  Binnen 5 minuten je eigen fotoboek!
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
