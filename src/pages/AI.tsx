import { MainLayout } from "@/components/laney/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Scan,
  MessageSquare,
  Layout,
  Palette,
  Users,
  MapPin,
  Heart,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "Foto Analyse",
    description:
      "Onze AI analyseert elke foto op gezichten, objecten, locaties en emoties om de beste plaatsing te bepalen.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: MessageSquare,
    title: "Tekst Generatie",
    description:
      "Automatisch gegenereerde titels, onderschriften en verhalen die perfect passen bij je foto's.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Layout,
    title: "Slimme Layouts",
    description:
      "AI kiest de beste layout voor elke spread, rekening houdend met foto kwaliteit en samenstelling.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Palette,
    title: "Kleur Matching",
    description:
      "Automatische kleuranalyse zorgt voor harmonieuze pagina's en een consistente look.",
    gradient: "from-green-500 to-teal-500",
  },
];

const capabilities = [
  { icon: Users, label: "Gezichtsherkenning", description: "Herkent en groepeert foto's per persoon" },
  { icon: MapPin, label: "Locatie detectie", description: "Organiseert foto's per locatie" },
  { icon: Heart, label: "Emotie analyse", description: "Detecteert stemming en emoties" },
];

const AI = () => {
  return (
    <MainLayout>
      <div className="px-6 py-12">
        {/* Hero */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
            <Sparkles className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            <span className="gradient-text">Laney AI</span> Mogelijkheden
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Ontdek hoe onze geavanceerde AI technologie je helpt om in minuten 
            professionele fotoboeken te maken.
          </p>
        </div>

        {/* Main Features */}
        <div className="mx-auto mb-20 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
            >
              <div
                className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
              >
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Capabilities Section */}
        <div className="mx-auto mb-16 max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
            AI Detectie Mogelijkheden
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {capabilities.map((cap, index) => (
              <div
                key={index}
                className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
                  <cap.icon className="h-6 w-6" />
                </div>
                <h4 className="mb-2 font-semibold text-foreground">{cap.label}</h4>
                <p className="text-sm text-muted-foreground">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Klaar om te beginnen?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Ervaar zelf hoe Laney AI je fotoboeken transformeert
          </p>
          <Link to="/ai-creation">
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-accent px-8 py-6 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:opacity-95"
            >
              Probeer Laney AI
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default AI;
