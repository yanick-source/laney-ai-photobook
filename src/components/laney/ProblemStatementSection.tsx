import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import heroVideo from "@/assets/General/hero-video.mp4";

export function ProblemStatementSection() {
  const { t } = useTranslation();
  const strikeRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: strikeRef,
    offset: ["start end", "center center"],
  });

  const strikethroughWidth = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"]);

  return (
    <section ref={strikeRef}>
      <ContainerScroll
        titleComponent={
          <div className="space-y-4 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-[4rem] lg:leading-tight font-bold tracking-tight">
              {t('problemStatement.title1', 'Creating a ')}{' '}
              <span className="text-primary">
                {t('problemStatement.titleHighlight', 'photobook')}
              </span>
              <br />
              <span className="relative inline-block">
                <span className="text-primary">{t('problemStatement.is', 'is')}</span>
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

            <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto">
              {t('problemStatement.subtitle', 'But not anymore! With Laney AI you now have your professional photobook in 5 minutes.')}
            </p>

            <div className="flex justify-center">
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
          </div>
        }
      >
        {/* Video card inside the 3D rotating container */}
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      </ContainerScroll>
    </section>
  );
}
