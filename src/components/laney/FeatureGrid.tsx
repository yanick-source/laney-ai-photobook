import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Sparkles, ScanFace, BookHeart, Palette, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import aiLayoutsImg from "@/assets/features/ai-layouts.png";
import photoAnalysisImg from "@/assets/features/photo-analysis.png";
import storyCreationImg from "@/assets/features/story-creation.png";
import styleMatchingImg from "@/assets/features/style-matching.png";

interface FeatureCardProps {
  title: string;
  description: string;
  ctaText: string;
  image: string;
  icon: React.ReactNode;
  variant: "primary" | "soft" | "muted" | "warm";
  isLarge?: boolean;
  delay?: number;
  popupTitle: string;
  popupDescription: string;
}

const variantStyles = {
  primary: "bg-gradient-to-br from-primary/90 via-primary to-accent/90",
  soft: "bg-gradient-to-br from-secondary via-laney-peach to-orange-50",
  muted: "bg-gradient-to-br from-stone-50 via-orange-50/50 to-secondary",
  warm: "bg-gradient-to-br from-primary/80 via-accent/70 to-primary/60",
};

const FeatureCard = ({ 
  title, 
  description, 
  ctaText, 
  image, 
  icon, 
  variant,
  isLarge = false,
  delay = 0,
  popupTitle,
  popupDescription
}: FeatureCardProps) => {
  const navigate = useNavigate();
  const isLight = variant === "soft" || variant === "muted";
  
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          className={`group relative overflow-hidden rounded-3xl cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300 ${variantStyles[variant]} ${
            isLarge ? "row-span-2 min-h-[400px] md:min-h-[480px]" : "min-h-[220px] md:min-h-[230px]"
          }`}
        >
          {/* Hover glow effect */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
            isLight ? "bg-primary/5" : "bg-white/10"
          }`} />
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col p-6 md:p-8">
            {/* Icon with micro-motion */}
            <motion.div 
              className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-md backdrop-blur-sm ${
                isLight 
                  ? "bg-white text-primary" 
                  : "bg-white/95 text-foreground"
              }`}
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
            >
              {icon}
            </motion.div>
            
            {/* Text content */}
            <div className="flex-1">
              <h3 className={`text-xl md:text-2xl font-bold mb-2 ${
                isLight ? "text-foreground" : "text-white drop-shadow-sm"
              }`}>
                {title}
              </h3>
              <p className={`text-sm md:text-base leading-relaxed max-w-xs ${
                isLight ? "text-muted-foreground" : "text-white/90"
              }`}>
                {description}
              </p>
            </div>
            
            {/* CTA Button */}
            <div className="mt-4">
              <Button 
                variant="secondary" 
                size="sm"
                className={`font-medium shadow-md hover:shadow-lg transition-all duration-200 group/btn ${
                  isLight 
                    ? "bg-primary hover:bg-primary/90 text-white" 
                    : "bg-white/95 hover:bg-white text-foreground"
                }`}
              >
                {ctaText}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </div>
          
          {/* Image */}
          <motion.div 
            className={`absolute pointer-events-none ${
              isLarge 
                ? "bottom-0 right-0 w-full h-1/2" 
                : "bottom-0 right-0 w-3/5 h-4/5"
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-contain object-right-bottom drop-shadow-lg"
            />
          </motion.div>
          
          {/* Decorative circle */}
          <div className="absolute top-4 right-4 opacity-10">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                scale: { duration: 4, repeat: Infinity }
              }}
              className={`w-20 h-20 rounded-full border-2 ${
                isLight ? "border-primary/30" : "border-white/30"
              }`}
            />
          </div>
        </motion.div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4" side="top" sideOffset={8}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
            <h4 className="font-semibold text-foreground">{popupTitle}</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {popupDescription}
          </p>
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => navigate('/ai-creation')}
          >
            Create your own photobook
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export const FeatureGrid = () => {
  const { t } = useTranslation();

  const features = [
    {
      titleKey: "index.features.aiDriven.title",
      descriptionKey: "index.features.aiDriven.description",
      ctaText: "Try AI layouts",
      image: aiLayoutsImg,
      icon: <Sparkles className="h-6 w-6" />,
      variant: "primary" as const,
      isLarge: true,
      popupTitle: "AI-Driven Layouts",
      popupDescription: "Our AI analyzes your photos and automatically creates stunning layouts. It considers composition, colors, and visual balance to arrange your memories perfectly—no design skills needed.",
    },
    {
      titleKey: "index.features.photoAnalysis.title",
      descriptionKey: "index.features.photoAnalysis.description",
      ctaText: "See how it works",
      image: photoAnalysisImg,
      icon: <ScanFace className="h-6 w-6" />,
      variant: "soft" as const,
      isLarge: false,
      popupTitle: "Smart Photo Analysis",
      popupDescription: "Laney recognizes faces, locations, and emotions in your photos. It identifies your best shots and groups similar moments together for a coherent story.",
    },
    {
      titleKey: "index.features.storyCreation.title",
      descriptionKey: "index.features.storyCreation.description",
      ctaText: "Create your story",
      image: storyCreationImg,
      icon: <BookHeart className="h-6 w-6" />,
      variant: "muted" as const,
      isLarge: false,
      popupTitle: "Automatic Story Creation",
      popupDescription: "Your photos become a narrative. Laney organizes them chronologically, suggests chapter titles, and creates a flow that captures the journey of your memories.",
    },
    {
      titleKey: "index.features.styleMatching.title",
      descriptionKey: "index.features.styleMatching.description",
      ctaText: "Explore styles",
      image: styleMatchingImg,
      icon: <Palette className="h-6 w-6" />,
      variant: "warm" as const,
      isLarge: true,
      popupTitle: "Intelligent Style Matching",
      popupDescription: "Laney extracts the dominant colors and mood from your photos, then applies matching backgrounds, fonts, and accents to create a cohesive, professional design.",
    },
  ];

  return (
    <section className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t('index.featuresTitle')} <span className="gradient-text">Laney</span>?
          </h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('index.featuresSubtitle')}
          </p>
        </motion.div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {/* Large card - spans 2 rows on left */}
          <div className="lg:row-span-2">
            <FeatureCard
              title={t(features[0].titleKey)}
              description={t(features[0].descriptionKey)}
              ctaText={features[0].ctaText}
              image={features[0].image}
              icon={features[0].icon}
              variant={features[0].variant}
              isLarge={true}
              delay={0}
              popupTitle={features[0].popupTitle}
              popupDescription={features[0].popupDescription}
            />
          </div>
          
          {/* Two smaller cards stacked on right-top */}
          <FeatureCard
            title={t(features[1].titleKey)}
            description={t(features[1].descriptionKey)}
            ctaText={features[1].ctaText}
            image={features[1].image}
            icon={features[1].icon}
            variant={features[1].variant}
            isLarge={false}
            delay={0.1}
            popupTitle={features[1].popupTitle}
            popupDescription={features[1].popupDescription}
          />
          
          <FeatureCard
            title={t(features[2].titleKey)}
            description={t(features[2].descriptionKey)}
            ctaText={features[2].ctaText}
            image={features[2].image}
            icon={features[2].icon}
            variant={features[2].variant}
            isLarge={false}
            delay={0.2}
            popupTitle={features[2].popupTitle}
            popupDescription={features[2].popupDescription}
          />
          
          {/* Large card - spans remaining space */}
          <div className="md:col-span-2">
            <FeatureCard
              title={t(features[3].titleKey)}
              description={t(features[3].descriptionKey)}
              ctaText={features[3].ctaText}
              image={features[3].image}
              icon={features[3].icon}
              variant={features[3].variant}
              isLarge={true}
              delay={0.3}
              popupTitle={features[3].popupTitle}
              popupDescription={features[3].popupDescription}
            />
          </div>
        </div>
      </div>
    </section>
  );
};