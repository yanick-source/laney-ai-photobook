import { HeroSection } from "@/components/laney/HeroSection";
import { ProblemStatementSection } from "@/components/laney/ProblemStatementSection";
import { FAQSection } from "@/components/laney/FAQSection";
import { Footer } from "@/components/laney/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ProblemStatementSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;