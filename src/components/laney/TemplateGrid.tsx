import { TemplateCard } from "./TemplateCard";
import "./TemplateGrid.css";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Template images using Unsplash URLs
const templateBeach = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop";
const templateWedding = "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop";
const templateBaby = "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=300&fit=crop";
const templateAutumn = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop";
const templateAdventure = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop";
const templateHoliday = "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop";

const categories = [
  { id: "all", label: "Alles" },
  { id: "wedding", label: "Bruiloft" },
  { id: "travel", label: "Reizen" },
  { id: "family", label: "Familie" },
  { id: "baby", label: "Baby" },
  { id: "birthday", label: "Verjaardag" },
  { id: "graduation", label: "Afstuderen" },
  { id: "holiday", label: "Vakantie" },
];

interface Template {
  id: string;
  image: string;
  title: string;
  usageCount: number;
  tag?: string;
}

const templates: Template[] = [
  {
    id: "1",
    image: templateBeach,
    title: "Zomervakantie",
    usageCount: 12453,
    tag: "Trending",
  },
  {
    id: "2", 
    image: templateWedding,
    title: "Bruiloft",
    usageCount: 8921,
    tag: "Populair",
  },
  {
    id: "3",
    image: templateBaby,
    title: "Baby's Eerste Jaar",
    usageCount: 7234,
  },
  {
    id: "4",
    image: templateAutumn,
    title: "Herfst Herinneringen",
    usageCount: 5612,
    tag: "Nieuw",
  },
  {
    id: "5",
    image: templateAdventure,
    title: "Avontuur & Reizen",
    usageCount: 9845,
    tag: "Trending",
  },
  {
    id: "6",
    image: templateHoliday,
    title: "Feestdagen",
    usageCount: 6789,
  },
];

interface TemplateGridProps {
  title?: string;
  onTemplateClick?: (template: Template) => void;
  onCategoryChange?: (category: string) => void;
  className?: string;
}

export const TemplateGrid = ({ 
  title = "Sjablonen verkennen", 
  onTemplateClick,
  onCategoryChange,
  className = ""
}: TemplateGridProps) => {
  const [activeCategory, setActiveCategory] = useState("all");

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <section className={`px-6 py-4 ${className}`}>
      {/* Header with title and category buttons */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        
        {/* Category selector buttons */}
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
              {category.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Horizontal carousel */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
          {templates.map((template, index) => (
            <div 
              key={template.id}
              className="animate-fade-up flex-shrink-0"
              style={{ 
                animationDelay: `${index * 100}ms`, 
                animationFillMode: 'backwards',
                width: 'calc(20% - 1.6rem)' // 20% width minus gap
              }}
            >
              <TemplateCard
                image={template.image}
                title={template.title}
                usageCount={template.usageCount}
                tag={template.tag}
                onClick={() => onTemplateClick?.(template)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
