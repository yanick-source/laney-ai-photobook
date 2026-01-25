import { TemplateCard } from "./TemplateCard";
import "./TemplateGrid.css";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import coverLondon from "@/assets/General/cover-london.jpg";
import coverMiami from "@/assets/General/cover-miami.jpg";
import coverSpain from "@/assets/General/cover-spain.jpg";

// Template cover images - optimized for book cover aspect ratios with focal point
const templateFamily = "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=800&fit=crop&crop=faces";
const templateTravel = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop&crop=center";
const templateHoliday = "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=600&h=800&fit=crop&crop=center";
const templateBeach = "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop&crop=center";
const templateMountain = "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&h=800&fit=crop&crop=center";
const templateCity = "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop&crop=center";
const templateWedding = "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop&crop=faces";
const templateBaby = "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&h=600&fit=crop&crop=faces";
const templateGraduation = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=800&fit=crop&crop=faces";
const templateParty = "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&h=600&fit=crop&crop=center";

// Inside spread images - different photos for realism
const spreadFamily = "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=300&fit=crop";
const spreadTravel = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop";
const spreadHoliday = "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&h=300&fit=crop";
const spreadBeach = "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400&h=300&fit=crop";
const spreadMountain = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop";
const spreadCity = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop";
const spreadWedding = "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop";
const spreadBaby = "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=300&fit=crop";
const spreadGraduation = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop";
const spreadParty = "https://images.unsplash.com/photo-1496843916299-590492c751f4?w=400&h=300&fit=crop";

interface Template {
  id: string;
  image: string;
  spreadImage: string;
  titleKey: string;
  usageCount: number;
  tagKey?: string;
  orientation: "vertical" | "horizontal";
}

// Templates organized for asymmetric grid - alternating vertical/horizontal
const templatesRow1: Template[] = [
  { id: "1", image: templateFamily, spreadImage: spreadFamily, titleKey: "templates.categories.family", usageCount: 12453, tagKey: "Trending", orientation: "vertical" },
  { id: "2", image: coverMiami, spreadImage: spreadTravel, titleKey: "templates.categories.wedding", usageCount: 8921, tagKey: "Popular", orientation: "horizontal" },
  { id: "3", image: templateHoliday, spreadImage: spreadHoliday, titleKey: "templates.categories.holiday", usageCount: 7234, orientation: "vertical" },
  { id: "4", image: templateTravel, spreadImage: spreadTravel, titleKey: "templates.categories.travel", usageCount: 5612, orientation: "horizontal" },
  { id: "5", image: templateMountain, spreadImage: spreadMountain, titleKey: "templates.categories.travel", usageCount: 9845, tagKey: "New", orientation: "vertical" },
  { id: "6", image: coverSpain, spreadImage: spreadHoliday, titleKey: "templates.categories.holiday", usageCount: 6789, orientation: "horizontal" },
  { id: "7", image: templateWedding, spreadImage: spreadWedding, titleKey: "templates.categories.wedding", usageCount: 11234, tagKey: "Popular", orientation: "vertical" },
];

const templatesRow2: Template[] = [
  { id: "8", image: templateBeach, spreadImage: spreadBeach, titleKey: "templates.categories.travel", usageCount: 8234, orientation: "horizontal" },
  { id: "9", image: templateGraduation, spreadImage: spreadGraduation, titleKey: "templates.categories.graduation", usageCount: 4567, tagKey: "New", orientation: "vertical" },
  { id: "10", image: templateCity, spreadImage: spreadCity, titleKey: "templates.categories.travel", usageCount: 7890, orientation: "horizontal" },
  { id: "11", image: coverLondon, spreadImage: spreadCity, titleKey: "templates.categories.holiday", usageCount: 9123, tagKey: "Trending", orientation: "horizontal" },
  { id: "12", image: templateBaby, spreadImage: spreadBaby, titleKey: "templates.categories.baby", usageCount: 6543, orientation: "horizontal" },
  { id: "13", image: templateParty, spreadImage: spreadParty, titleKey: "templates.categories.birthday", usageCount: 5432, orientation: "horizontal" },
];

interface TemplateGridProps {
  title?: string;
  onTemplateClick?: (template: Template) => void;
  onCategoryChange?: (category: string) => void;
  className?: string;
}

export const TemplateGrid = ({ 
  onTemplateClick,
  onCategoryChange,
  className = ""
}: TemplateGridProps) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const categories = [
    { id: "all", labelKey: "templates.categories.all" },
    { id: "wedding", labelKey: "templates.categories.wedding" },
    { id: "travel", labelKey: "templates.categories.travel" },
    { id: "family", labelKey: "templates.categories.family" },
    { id: "baby", labelKey: "templates.categories.baby" },
    { id: "birthday", labelKey: "templates.categories.birthday" },
    { id: "graduation", labelKey: "templates.categories.graduation" },
    { id: "holiday", labelKey: "templates.categories.holiday" },
  ];

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollBy = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollPosition, 300);
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    checkScrollPosition();
  };

  const handleScroll = () => {
    checkScrollPosition();
  };

  return (
    <section className={`py-8 overflow-hidden ${className}`}>
      {/* Header with category selector */}
      <div className="px-6 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-full">
        <h2 className="text-2xl font-bold text-foreground">{t('templates.explore')}</h2>
        
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 sm:pb-0">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                activeCategory === category.id
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              {t(category.labelKey)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Scrollable asymmetric grid */}
      <div className="relative w-full max-w-full overflow-hidden">
        {/* Left scroll button */}
        {canScrollLeft && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-white shadow-xl hover:bg-white hover:scale-105 transition-all duration-200 border border-border"
            onClick={() => scrollBy("left")}
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </Button>
        )}

        {/* Right scroll button - always visible when scrollable */}
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-white shadow-xl hover:bg-white hover:scale-105 transition-all duration-200 border border-border",
            !canScrollRight && "opacity-30 cursor-not-allowed"
          )}
          onClick={() => scrollBy("right")}
          disabled={!canScrollRight}
        >
          <ChevronRight className="h-6 w-6 text-foreground" />
        </Button>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "overflow-x-auto overflow-y-hidden hide-scrollbar px-6 cursor-grab active:cursor-grabbing",
            isDragging && "cursor-grabbing select-none"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onScroll={handleScroll}
        >
          {/* Two-row asymmetric grid */}
          <div className="inline-flex flex-col gap-4 pb-4">
            {/* Row 1 - Mixed vertical/horizontal */}
            <div className="flex gap-4 items-start">
              {templatesRow1.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className={cn(
                    "flex-shrink-0 transition-shadow duration-300 hover:shadow-2xl rounded-2xl overflow-hidden",
                    template.orientation === "vertical" ? "w-[200px]" : "w-[280px]"
                  )}
                  onClick={() => !isDragging && onTemplateClick?.(template)}
                >
                  <TemplateCard
                    image={template.image}
                    spreadImage={template.spreadImage}
                    title={t(template.titleKey)}
                    usageCount={template.usageCount}
                    tag={template.tagKey}
                    orientation={template.orientation}
                  />
                </motion.div>
              ))}
            </div>

            {/* Row 2 - Mixed horizontal/vertical */}
            <div className="flex gap-4 items-start">
              {templatesRow2.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + templatesRow1.length) * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className={cn(
                    "flex-shrink-0 transition-shadow duration-300 hover:shadow-2xl rounded-2xl overflow-hidden",
                    template.orientation === "vertical" ? "w-[200px]" : "w-[280px]"
                  )}
                  onClick={() => !isDragging && onTemplateClick?.(template)}
                >
                  <TemplateCard
                    image={template.image}
                    spreadImage={template.spreadImage}
                    title={t(template.titleKey)}
                    usageCount={template.usageCount}
                    tag={template.tagKey}
                    orientation={template.orientation}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
};