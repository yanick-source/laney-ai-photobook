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

// Template images using Unsplash URLs
const templateAutumn = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=500&fit=crop";
const templateAdventure = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop";
const templateHoliday = "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=500&fit=crop";
const templateBeach = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop";
const templateMountain = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=500&fit=crop";
const templateCity = "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop";
const templateWedding = "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop";
const templateBaby = "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=300&fit=crop";
const templateGraduation = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=500&fit=crop";
const templateParty = "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop";

interface Template {
  id: string;
  image: string;
  titleKey: string;
  usageCount: number;
  tagKey?: string;
  orientation: "vertical" | "horizontal";
}

// Templates organized for asymmetric grid - alternating vertical/horizontal
const templatesRow1: Template[] = [
  { id: "1", image: templateAutumn, titleKey: "templates.categories.family", usageCount: 12453, tagKey: "Trending", orientation: "vertical" },
  { id: "2", image: coverMiami, titleKey: "templates.categories.wedding", usageCount: 8921, tagKey: "Popular", orientation: "horizontal" },
  { id: "3", image: templateHoliday, titleKey: "templates.categories.holiday", usageCount: 7234, orientation: "vertical" },
  { id: "4", image: templateAdventure, titleKey: "templates.categories.travel", usageCount: 5612, orientation: "horizontal" },
  { id: "5", image: templateMountain, titleKey: "templates.categories.travel", usageCount: 9845, tagKey: "New", orientation: "vertical" },
  { id: "6", image: coverSpain, titleKey: "templates.categories.holiday", usageCount: 6789, orientation: "horizontal" },
  { id: "7", image: templateWedding, titleKey: "templates.categories.wedding", usageCount: 11234, tagKey: "Popular", orientation: "vertical" },
];

const templatesRow2: Template[] = [
  { id: "8", image: templateBeach, titleKey: "templates.categories.travel", usageCount: 8234, orientation: "horizontal" },
  { id: "9", image: templateGraduation, titleKey: "templates.categories.graduation", usageCount: 4567, tagKey: "New", orientation: "vertical" },
  { id: "10", image: templateCity, titleKey: "templates.categories.travel", usageCount: 7890, orientation: "horizontal" },
  { id: "11", image: coverLondon, titleKey: "templates.categories.holiday", usageCount: 9123, tagKey: "Trending", orientation: "horizontal" },
  { id: "12", image: templateBaby, titleKey: "templates.categories.baby", usageCount: 6543, orientation: "horizontal" },
  { id: "13", image: templateParty, titleKey: "templates.categories.birthday", usageCount: 5432, orientation: "horizontal" },
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
    <section className={`py-8 ${className}`}>
      {/* Header with category selector */}
      <div className="px-6 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
      <div className="relative">
        {/* Left scroll button */}
        {canScrollLeft && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white shadow-xl hover:bg-white hover:scale-105 transition-all duration-200"
            onClick={() => scrollBy("left")}
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </Button>
        )}

        {/* Right scroll button */}
        {canScrollRight && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white shadow-xl hover:bg-white hover:scale-105 transition-all duration-200"
            onClick={() => scrollBy("right")}
          >
            <ChevronRight className="h-6 w-6 text-foreground" />
          </Button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "overflow-x-auto hide-scrollbar px-6 cursor-grab active:cursor-grabbing",
            isDragging && "cursor-grabbing select-none"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onScroll={handleScroll}
        >
          {/* Two-row asymmetric grid */}
          <div className="flex flex-col gap-4 pb-4" style={{ width: "max-content" }}>
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