import { useState } from "react";
import { cn } from "@/lib/utils";

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

interface CategoryBarProps {
  onCategoryChange?: (category: string) => void;
}

export function CategoryBar({ onCategoryChange }: CategoryBarProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className="px-6 py-4">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
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
  );
}
