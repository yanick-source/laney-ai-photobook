import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroVideo from "@/assets/General/hero-video.mp4";

export function ProblemStatementSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const strikeRef = useRef<HTMLSpanElement>(null);
  
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  // Animation starts later (0.5+) so it only triggers after meaningful scroll
  const strikethroughWidth = useTransform(scrollYProgress, [0.5, 0.7], ["0%", "100%"]);
  // "is" fades out after strikethrough completes
  const isOpacity = useTransform(scrollYProgress, [0.7, 0.8], [1, 0]);
  // "was" fades in after "is" disappears
  const wasOpacity = useTransform(scrollYProgress, [0.75, 0.9], [0, 1]);
  const wasY = useTransform(scrollYProgress, [0.75, 0.9], [6, 0]);

  return (
    <motion.section 
      ref={sectionRef}
      className="py-8 md:py-12 px-6 bg-background"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-center justify-center">
          {/* Left side - Problem statement */}
          <div className="space-y-4 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
              {t('problemStatement.title1', 'Creating a ')}{' '}
              <span className="text-primary">
                {t('problemStatement.titleHighlight', 'photobook')}
              </span>
              <br />
              {/* "is" with strikethrough, fades out */}
              <motion.span className="relative inline-block" ref={strikeRef} style={{ opacity: isOpacity }}>
                <span className="text-foreground">{t('problemStatement.is', 'is')}</span>
                <motion.span
                  className="absolute left-0 top-1/2 h-[3px] bg-primary rounded-full origin-left"
                  style={{ 
                    width: strikethroughWidth,
                    transform: "translateY(-50%)",
                  }}
                />
              </motion.span>{' '}
              {/* "was" appears after strikethrough */}
              <motion.span
                className="text-primary inline-block"
                style={{ opacity: wasOpacity, y: wasY }}
              >
                {t('problemStatement.was', 'was')}
              </motion.span>{' '}
              <span className="text-foreground">
                {t('problemStatement.hard', 'hard.')}
              </span>
            </h2>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
              {t('problemStatement.subtitle', 'But not anymore! With Laney AI you now have your professional photobook in 5 minutes.')}
            </p>
            
            <div className="flex justify-center lg:justify-start">
              <a href="https://app.uselaney.com" target="_blank" rel="noopener noreferrer">
                <Button 
                  size="default" 
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-5 text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25"
                >
                  {t('problemStatement.cta', 'Create photobook')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
          
          {/* Right side - Promotional video */}
          <div className="shrink-0">
            <div className="aspect-[9/16] rounded-xl overflow-hidden bg-muted shadow-lg w-40 md:w-48 lg:w-52">
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
    </motion.section>
  );
}