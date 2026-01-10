import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-16">
      {/* Background decoration */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-gradient-to-tr from-accent/10 to-primary/10 blur-3xl" />
      
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          AI-gestuurd fotoboek maken
        </div>
        
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Wat ga je vandaag{" "}
          <span className="gradient-text">creëren</span>?
        </h1>
        
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Maak in minuten een professioneel fotoboek met AI. Upload je foto's en laat onze 
          slimme technologie de perfecte layouts, teksten en verhalen voor je maken.
        </p>
        
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
    </section>
  );
}
