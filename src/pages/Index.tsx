import { MainLayout } from "@/components/laney/MainLayout";
import { HeroSection } from "@/components/laney/HeroSection";
import { TemplateGrid } from "@/components/laney/TemplateGrid";
import { Sparkles, Image, BookOpen, Palette } from "lucide-react";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Sparkles, titleKey: "index.features.aiDriven.title", descriptionKey: "index.features.aiDriven.description" },
    { icon: Image, titleKey: "index.features.photoAnalysis.title", descriptionKey: "index.features.photoAnalysis.description" },
    { icon: BookOpen, titleKey: "index.features.storyCreation.title", descriptionKey: "index.features.storyCreation.description" },
    { icon: Palette, titleKey: "index.features.styleMatching.title", descriptionKey: "index.features.styleMatching.description" },
  ];

  return (
    <MainLayout>
      <HeroSection />
      <TemplateGrid />
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground">{t('index.featuresTitle')} <span className="gradient-text">Laney</span>?</h2>
            <p className="mt-3 text-muted-foreground">{t('index.featuresSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 text-primary transition-colors group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{t(feature.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(feature.descriptionKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
