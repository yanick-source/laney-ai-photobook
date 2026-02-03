import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroVideo from "@/assets/General/hero-video.mp4";

export function ProblemStatementSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  // Animate strikethrough width from 0% to 100%
  const strikethroughWidth = useTransform(scrollYProgress, [0.3, 0.7], ["0%", "100%"]);

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 px-6 bg-background"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Problem statement */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              {t('problemStatement.title1', 'Creating a ')}{' '}
              <span className="text-primary">
                {t('problemStatement.titleHighlight', 'photobook')}
              </span>
              <br />
              <span className="relative inline-block">
                <span className="text-primary">{t('problemStatement.is', 'is')}</span>
                {/* Animated strikethrough */}
                <motion.span
                  className="absolute left-0 top-1/2 h-[3px] bg-primary rounded-full"
                  style={{ 
                    width: strikethroughWidth,
                    transform: "translateY(-50%)",
                  }}
                />
              </span>{' '}
              <span className="text-foreground">
                {t('problemStatement.was', 'was')} {t('problemStatement.hard', 'hard.')}
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
              {t('problemStatement.subtitle', 'But not anymore! With Laney AI you now have your professional photobook in 5 minutes.')}
            </p>
            
            <Link to="/ai-creation">
              <Button 
                size="lg" 
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25"
              >
                {t('problemStatement.cta', 'Create photobook')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          {/* Right side - Promotional video */}
          <div className="relative">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted shadow-xl">
              <video
                src={heroVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
