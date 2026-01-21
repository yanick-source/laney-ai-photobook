import { TemplateCard } from "./TemplateCard";
import "./TemplateGrid.css";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

import coverLondon from "@/assets/General/cover-london.jpg";
import coverMiami from "@/assets/General/cover-miami.jpg";
import coverSpain from "@/assets/General/cover-spain.jpg";

// Template images using Unsplash URLs
const templateAutumn = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop";
const templateAdventure = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop";
const templateHoliday = "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop";

interface Template {
  id: string;
  image: string;
  titleKey: string;
  usageCount: number;
  tagKey?: string;
}

const templates: Template[] = [
  { id: "1", image: coverLondon, titleKey: "templates.categories.holiday", usageCount: 12453, tagKey: "Trending" },
  { id: "2", image: coverMiami, titleKey: "templates.categories.wedding", usageCount: 8921, tagKey: "Popular" },
  { id: "3", image: coverSpain, titleKey: "templates.categories.baby", usageCount: 7234 },
  { id: "4", image: templateAutumn, titleKey: "templates.categories.family", usageCount: 5612, tagKey: "New" },
  { id: "5", image: templateAdventure, titleKey: "templates.categories.travel", usageCount: 9845, tagKey: "Trending" },
  { id: "6", image: templateHoliday, titleKey: "templates.categories.holiday", usageCount: 6789 },
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

  return (
    <section className={`px-6 py-4 ${className}`}>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
      
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
          {templates.map((template, index) => (
            <div 
              key={template.id}
              className="animate-fade-up flex-shrink-0"
              style={{ 
                animationDelay: `${index * 100}ms`, 
                animationFillMode: 'backwards',
                width: 'calc(20% - 1.6rem)'
              }}
            >
              <TemplateCard
                image={template.image}
                title={t(template.titleKey)}
                usageCount={template.usageCount}
                tag={template.tagKey}
                onClick={() => onTemplateClick?.(template)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
