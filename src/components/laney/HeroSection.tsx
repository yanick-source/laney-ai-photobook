import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAnalytics } from "@/contexts/AnalyticsContext";

export function HeroSection() {
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background: Laney peach at top → white */}
      <div className="absolute inset-0 bg-gradient-to-b from-laney-peach via-laney-peach/50 to-background" />
      
      <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20 text-center">
        {/* Simple headline with gradient on "creating" */}
        <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
          {t('hero.titlePart1', 'What are you ')}
          <span className="gradient-text">{t('hero.titleGradient', 'creating')}</span>
          {t('hero.titlePart2', ' today?')}
        </h1>
        
        {/* CTA Button - prominent, centered */}
        <div className="mt-8">
          <Link to="/ai-creation">
            <Button 
              size="lg" 
              className="gap-2 bg-gradient-to-r from-primary to-accent px-8 py-6 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:opacity-95"
              onClick={() => trackEvent("button_click", { button: "hero_cta", location: "home" })}
            >
              {t('hero.ctaSimple', 'Your own photobook in 5 minutes!')}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        {/* Social proof - directly below CTA */}
        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className="h-4 w-4 fill-yellow-400 text-yellow-400" 
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">4.8</span>
            <span className="text-sm text-muted-foreground">{t('hero.rating')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm">
              <span className="font-semibold text-foreground">50.000+</span> {t('hero.photobooksCreated')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
