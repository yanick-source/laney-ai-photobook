import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { Upload, Sparkles, Pencil } from "lucide-react";
import showcaseImg from "@/assets/features/laney-showcase.jpg";
import showcaseBg from "@/assets/features/laney-showcase-bg.jpg";

const steps = [
  {
    icon: Upload,
    step: "Step 1: Pick your size",
    description: "Choose the format that fits your story — square, landscape or portrait.",
  },
  {
    icon: Sparkles,
    step: "Step 2: Laney designs",
    description: "Our AI arranges your photos with smart layouts and generates beautiful captions, automatically.",
  },
  {
    icon: Pencil,
    step: "Step 3: Make it yours",
    description: "Drag, drop, swap and edit — fine-tune and perfect every page with full control.",
  },
];

export function FeatureStepsSection() {
  return (
    <ScrollExpandMedia
      mediaSrc={showcaseImg}
      bgImageSrc={showcaseBg}
      title="How Laney Works"
      scrollToExpand="↓ Scroll to explore"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
          Three steps to your perfect photobook
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.step} className="flex flex-col items-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.step}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </ScrollExpandMedia>
  );
}
