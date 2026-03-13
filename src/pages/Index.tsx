import { HeroSection } from "@/components/laney/HeroSection";
import { ProblemStatementSection } from "@/components/laney/ProblemStatementSection";
import { FeatureStepsSection } from "@/components/laney/FeatureStepsSection";
import { FAQSection } from "@/components/laney/FAQSection";
import { Footer } from "@/components/laney/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ProblemStatementSection />
      <FeatureStepsSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;