import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  image: string;
  spreadImage?: string;
  title: string;
  usageCount: number;
  tag?: string;
  orientation?: "vertical" | "horizontal";
  onClick?: () => void;
}

export const TemplateCard = ({ 
  image, 
  spreadImage,
  title, 
  usageCount, 
  tag, 
  orientation = "horizontal",
  onClick 
}: TemplateCardProps) => {
  const { t } = useTranslation();

  // Use spread image if provided, otherwise use cover with different positioning
  const insideImage = spreadImage || image;

  return (
    <div 
      className={cn(
        "template-card group relative w-full overflow-hidden rounded-2xl bg-muted cursor-pointer",
        orientation === "vertical" ? "aspect-[3/4]" : "aspect-[4/3]"
      )}
      onClick={onClick}
    >
      {/* Book effect container */}
      <div className="laney-book-scene" aria-label={title}>
        <div className="laney-book">
          {/* Cover - uses cover image with smart positioning */}
          <div
            className="laney-book__cover"
            style={{ backgroundImage: `url(${image})` }}
          />
          {/* Inside spread - shows layout structure */}
          <div className="laney-book__pages">
            <div className="laney-book__page laney-book__page--left">
              <div 
                className="laney-book__page-photo laney-book__page-photo--main"
                style={{ backgroundImage: `url(${insideImage})` }}
              />
              <div className="laney-book__page-placeholder laney-book__page-placeholder--small" />
            </div>
            <div className="laney-book__page laney-book__page--right">
              <div className="laney-book__page-text-area">
                <div className="laney-book__page-text-line laney-book__page-text-line--title" />
                <div className="laney-book__page-text-line" />
                <div className="laney-book__page-text-line laney-book__page-text-line--short" />
              </div>
              <div 
                className="laney-book__page-photo laney-book__page-photo--secondary"
                style={{ backgroundImage: `url(${insideImage})` }}
              />
            </div>
          </div>
          <div className="laney-book__spine" />
        </div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80" />
      
      {/* Tag badge */}
      {tag && (
        <div className="absolute left-3 top-3 z-20">
          <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-lg backdrop-blur-sm">
            {tag}
          </span>
        </div>
      )}
      
      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-20">
        <h3 className={cn(
          "font-bold text-white drop-shadow-lg mb-1.5",
          orientation === "vertical" ? "text-base" : "text-lg"
        )}>
          {title}
        </h3>
        <div className="flex items-center gap-1.5 text-white/90 drop-shadow">
          <Users className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{usageCount.toLocaleString()} {t('templates.usedCount')}</span>
        </div>
      </div>
      
      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:border-white/40 group-hover:shadow-lg" />
    </div>
  );
};