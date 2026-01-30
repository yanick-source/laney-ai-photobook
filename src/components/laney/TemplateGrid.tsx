import { TemplateCard } from "./TemplateCard";
import "./TemplateGrid.css";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTemplates, Template } from "@/hooks/useTemplates";
import { Skeleton } from "@/components/ui/skeleton";

// Helper to split templates into two rows for the asymmetric grid
const splitIntoRows = (templates: Template[]): [Template[], Template[]] => {
  const row1: Template[] = [];
  const row2: Template[] = [];
  templates.forEach((template, index) => {
    if (index % 2 === 0) {
      row1.push(template);
    } else {
      row2.push(template);
    }
  });
  return [row1, row2];
};

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

  // Fetch templates from database
  const { data: templates = [], isLoading, isError } = useTemplates({ 
    category: activeCategory 
  });

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

  // Split templates into two rows for the grid
  const [templatesRow1, templatesRow2] = splitIntoRows(templates);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
    // Reset scroll position when category changes
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
    // Check scroll position after animation completes
    setTimeout(checkScrollPosition, 300);
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

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="inline-flex flex-col gap-4 pb-4">
      <div className="flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton 
            key={i} 
            className={cn(
              "flex-shrink-0 rounded-2xl",
              i % 2 === 0 ? "w-[200px] h-[267px]" : "w-[280px] h-[210px]"
            )} 
          />
        ))}
      </div>
      <div className="flex gap-4">
        {[5, 6, 7].map((i) => (
          <Skeleton 
            key={i} 
            className={cn(
              "flex-shrink-0 rounded-2xl",
              i % 2 === 0 ? "w-[280px] h-[210px]" : "w-[200px] h-[267px]"
            )} 
          />
        ))}
      </div>
    </div>
  );

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
          {/* Loading state */}
          {isLoading && <LoadingSkeleton />}

          {/* Error state */}
          {isError && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>{t('common.error')}</p>
            </div>
          )}

          {/* Two-row asymmetric grid */}
          {!isLoading && !isError && templates.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex flex-col gap-4 pb-4"
              >
                {/* Row 1 */}
                <div className="flex gap-4 items-start min-h-[180px]">
                  {templatesRow1.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.25 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      className={cn(
                        "flex-shrink-0 transition-shadow duration-300 hover:shadow-2xl rounded-2xl overflow-hidden",
                        template.orientation === "vertical" ? "w-[200px]" : "w-[280px]"
                      )}
                      onClick={() => !isDragging && onTemplateClick?.(template)}
                    >
                      <TemplateCard
                        image={template.cover_image_path}
                        spreadImage={template.spread_image_path || undefined}
                        title={template.name}
                        usageCount={template.usage_count}
                        tag={template.tag || undefined}
                        orientation={template.orientation}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Row 2 */}
                {templatesRow2.length > 0 && (
                  <div className="flex gap-4 items-start min-h-[180px]">
                    {templatesRow2.map((template, index) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (index + templatesRow1.length) * 0.05, duration: 0.25 }}
                        whileHover={{ scale: 1.03, y: -4 }}
                        className={cn(
                          "flex-shrink-0 transition-shadow duration-300 hover:shadow-2xl rounded-2xl overflow-hidden",
                          template.orientation === "vertical" ? "w-[200px]" : "w-[280px]"
                        )}
                        onClick={() => !isDragging && onTemplateClick?.(template)}
                      >
                        <TemplateCard
                          image={template.cover_image_path}
                          spreadImage={template.spread_image_path || undefined}
                          title={template.name}
                          usageCount={template.usage_count}
                          tag={template.tag || undefined}
                          orientation={template.orientation}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Empty state */}
          {!isLoading && !isError && templates.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>{t('templates.noTemplates')}</p>
            </div>
          )}
        </div>

        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
};
