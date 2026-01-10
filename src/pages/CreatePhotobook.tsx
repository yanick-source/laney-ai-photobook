import { MainLayout } from "@/components/laney/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Upload, Palette, Gift, ArrowRight, Check } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload foto's",
    description: "Sleep je foto's naar het uploadgebied of selecteer ze van je apparaat",
  },
  {
    icon: Palette,
    number: "02",
    title: "Kies stijl",
    description: "Selecteer een sjabloon of laat AI de perfecte stijl voor je kiezen",
  },
  {
    icon: Gift,
    number: "03",
    title: "Ontvang resultaat",
    description: "Bekijk je AI-gegenereerde fotoboek en maak aanpassingen indien nodig",
  },
];

const benefits = [
  "AI analyseert automatisch locaties en emoties",
  "Slimme groepering van foto's per thema",
  "Automatische tekst generatie voor elk hoofdstuk",
  "Professionele layouts in minuten",
];

const CreatePhotobook = () => {
  return (
    <MainLayout>
      <div className="px-6 py-12">
        {/* Hero Section */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
            <Sparkles className="h-10 w-10 text-primary-foreground" />
          </div>
          
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Je fotoboek creëren met <span className="gradient-text">AI</span>
          </h1>
          
          <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground">
            Onze geavanceerde AI analyseert je foto's, herkent gezichten en locaties, 
            en creëert automatisch een prachtig fotoboek met passende teksten en layouts.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mx-auto mb-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
            >
              <div className="absolute -right-4 -top-4 text-8xl font-bold text-primary/5">
                {step.number}
              </div>
              <div className="relative">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mx-auto mb-12 max-w-3xl rounded-2xl border border-border bg-gradient-to-br from-card to-secondary/30 p-8">
          <h2 className="mb-6 text-center text-2xl font-bold text-foreground">
            Wat onze AI voor je doet
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/ai-creation">
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-accent px-10 py-6 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:opacity-95"
            >
              Begin met creëren
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            Geen account nodig • Gratis te proberen
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreatePhotobook;
