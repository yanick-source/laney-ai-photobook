import { MainLayout } from "@/components/laney/MainLayout";
import { HeroSection } from "@/components/laney/HeroSection";
import { CategoryBar } from "@/components/laney/CategoryBar";
import { TemplateGrid } from "@/components/laney/TemplateGrid";

const Index = () => (
  <MainLayout>
    <HeroSection />
    <CategoryBar />
    <TemplateGrid />
  </MainLayout>
);

export default Index;
