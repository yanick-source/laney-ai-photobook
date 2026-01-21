import { MainLayout } from "@/components/laney/MainLayout";
import { HeroSection } from "@/components/laney/HeroSection";
import { TemplateGrid } from "@/components/laney/TemplateGrid";
import { FeatureGrid } from "@/components/laney/FeatureGrid";

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <TemplateGrid />
      <FeatureGrid />
    </MainLayout>
  );
};

export default Index;
