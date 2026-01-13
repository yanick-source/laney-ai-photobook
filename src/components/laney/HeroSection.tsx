import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroVideo from "@/assets/hero-video.mp4";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-12">
      {/* Background decoration */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-gradient-to-tr from-accent/10 to-primary/10 blur-3xl" />
      
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-14">
          {/* Video Section - Left */}
          <div className="relative w-full max-w-[280px] flex-shrink-0 lg:max-w-[320px]">
            <div className="relative aspect-[9/16] overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 shadow-2xl shadow-primary/20">
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
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
            </div>
          </div>
          
          {/* Content Section - Right */}
          <div className="flex flex-1 flex-col justify-start text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 self-center rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-sm font-medium text-primary lg:self-start">
              <Sparkles className="h-4 w-4" />
              AI-gestuurd fotoboek maken
            </div>
            
            <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Wat ga je vandaag{" "}
              <span className="gradient-text">creëren</span>?
            </h1>
            
            <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground lg:mx-0">
              Maak in minuten een professioneel fotoboek met Laney. Upload je foto's en kies samen met Laney de perfecte layouts, teksten en verhalen voor je ontwerpen.
            </p>
            
            <div className="flex justify-center lg:justify-start">
              <Link to="/ai-creation">
                <Button 
                  size="lg" 
                  className="gap-2 bg-gradient-to-r from-primary to-accent px-8 py-6 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:opacity-95"
                >
                  Binnen 5 minuten je eigen fotoboek!
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Social proof */}
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:items-start">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-foreground">4.8</span>
                <span className="text-sm text-muted-foreground">uit 2.400+ reviews</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm"><span className="font-semibold text-foreground">50.000+</span> fotoboeken gemaakt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
