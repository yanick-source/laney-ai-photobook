import { FeatureSteps } from "@/components/ui/feature-section";
import stepPickSize from "@/assets/features/step-pick-size.jpg";
import stepLaneyDesigns from "@/assets/features/step-laney-designs.jpg";
import stepMakeYours from "@/assets/features/step-make-yours.jpg";

const features = [
  {
    step: "Step 1: Pick your size",
    title: "Choose the format that fits your story",
    content: "Square, landscape or portrait — select the perfect book size for your memories.",
    image: stepPickSize,
  },
  {
    step: "Step 2: Laney designs",
    title: "Layout + captions, automatically",
    content: "Our AI arranges your photos with smart layouts and generates beautiful captions.",
    image: stepLaneyDesigns,
  },
  {
    step: "Step 3: Make it yours",
    title: "Fine-tune and perfect every page",
    content: "Drag, drop, swap and edit — you have full control to make it exactly right.",
    image: stepMakeYours,
  },
];

export function FeatureStepsSection() {
  return (
    <section className="py-8 md:py-12 bg-background">
      <FeatureSteps
        features={features}
        title="How Laney works"
        autoPlayInterval={4000}
        imageHeight="h-[300px] md:h-[380px]"
      />
    </section>
  );
}
