import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="px-6 py-12 text-center">
      <h1 className="mb-4 text-5xl tracking-tight md:text-6xl">
        <span className="font-display italic text-foreground">Wat ga je vandaag </span>
        <span className="font-semibold text-foreground">creëren?</span>
      </h1>
      
      <p className="mb-8 text-lg text-muted-foreground">
        Maak in minuten een professioneel fotoboek met AI
      </p>
      
      <Link to="/create">
        <Button 
          size="lg" 
          className="gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-8 py-6 text-lg font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:opacity-95"
        >
          <Sparkles className="h-5 w-5" />
          Binnen 5 minuten je eigen fotoboek!
        </Button>
      </Link>
    </section>
  );
}
