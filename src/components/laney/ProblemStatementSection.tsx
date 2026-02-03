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
  const strikethroughWidth = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"]);

  return (
    <section 
      ref={sectionRef}
      className="py-8 md:py-12 px-6 bg-background"
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Problem statement */}
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
              {t('problemStatement.title1', 'Creating a ')}{' '}
              <span className="text-primary">
                {t('problemStatement.titleHighlight', 'photobook')}
              </span>
              <br />
              <span className="relative inline-block">
                <span className="text-primary">{t('problemStatement.is', 'is')}</span>
                {/* Animated strikethrough */}
                <motion.span
                  className="absolute left-0 top-1/2 h-[2px] bg-primary rounded-full"
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
            
            <p className="text-base md:text-lg text-muted-foreground max-w-md">
              {t('problemStatement.subtitle', 'But not anymore! With Laney AI you now have your professional photobook in 5 minutes.')}
            </p>
            
            <Link to="/ai-creation">
              <Button 
                size="default" 
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-5 text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                {t('problemStatement.cta', 'Create photobook')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {/* Right side - Promotional video */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted shadow-lg max-w-sm lg:max-w-md ml-auto">
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