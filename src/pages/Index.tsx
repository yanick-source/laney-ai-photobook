import { MainLayout } from "@/components/laney/MainLayout";
import { HeroSection } from "@/components/laney/HeroSection";
import { HowItWorks } from "@/components/laney/HowItWorks";
import { TemplateGrid } from "@/components/laney/TemplateGrid";
import { FeatureGrid } from "@/components/laney/FeatureGrid";
import { FAQSection } from "@/components/laney/FAQSection";
import { Footer } from "@/components/laney/Footer";

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <HowItWorks />
      <TemplateGrid />
      <FeatureGrid />
      <FAQSection />
      <Footer />
    </MainLayout>
  );
};

export default Index;