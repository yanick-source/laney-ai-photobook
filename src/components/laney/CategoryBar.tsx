import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  BookOpen, Heart, Plane, Baby, PartyPopper, GraduationCap, 
  Camera, Sparkles, MoreHorizontal 
} from "lucide-react";

const categories = [
  { id: "fotoboek", label: "Fotoboek", icon: BookOpen },
  { id: "liefde", label: "Liefde", icon: Heart },
  { id: "reizen", label: "Reizen", icon: Plane },
  { id: "baby", label: "Baby", icon: Baby },
  { id: "feest", label: "Feest", icon: PartyPopper },
  { id: "school", label: "School", icon: GraduationCap },
  { id: "portret", label: "Portret", icon: Camera },
  { id: "ai-magic", label: "AI Magic", icon: Sparkles, isNew: true },
  { id: "meer", label: "Meer", icon: MoreHorizontal, isMore: true },
];

interface CategoryBarProps {
  onCategoryChange?: (category: string) => void;
}

export function CategoryBar({ onCategoryChange }: CategoryBarProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    const newCategory = activeCategory === categoryId ? null : categoryId;
    setActiveCategory(newCategory);
    onCategoryChange?.(newCategory || "all");
  };

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-center gap-4 overflow-x-auto hide-scrollbar">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              "group relative flex flex-col items-center gap-2 transition-all duration-200",
              activeCategory === category.id && "scale-105"
            )}
          >
            {/* New badge */}
            {category.isNew && (
              <span className="absolute -right-2 -top-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                Nieuw
              </span>
            )}
            
            {/* Icon container */}
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all duration-200",
                category.isMore
                  ? "border-accent bg-accent text-accent-foreground"
                  : activeCategory === category.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              <category.icon className="h-6 w-6" />
            </div>
            
            {/* Label */}
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                activeCategory === category.id
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {category.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
