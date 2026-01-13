import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";

interface TemplateCardProps {
  image: string;
  title: string;
  usageCount: number;
  tag?: string;
  onClick?: () => void;
}

export const TemplateCard = ({ image, title, usageCount, tag, onClick }: TemplateCardProps) => {
  const { t } = useTranslation();

  return (
    <div 
      className="template-card group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted cursor-pointer"
      onClick={onClick}
    >
      <div className="laney-book-scene" aria-label={title}>
        <div className="laney-book">
          <div
            className="laney-book__cover"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="laney-book__pages">
            <div
              className="laney-book__page laney-book__page--left"
              style={{ backgroundImage: `url(${image})` }}
            />
            <div
              className="laney-book__page laney-book__page--right"
              style={{ backgroundImage: `url(${image})` }}
            />
          </div>
          <div className="laney-book__spine" />
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      
      {tag && (
        <div className="absolute left-4 top-4 z-20">
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black shadow-lg">
            {tag}
          </span>
        </div>
      )}
      
      <div className="absolute inset-x-0 bottom-0 p-4 z-20">
        <h3 className="mb-2 text-xl font-bold text-white drop-shadow-lg">{title}</h3>
        <div className="flex items-center gap-1.5 text-white/90 drop-shadow">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">{usageCount.toLocaleString()} {t('templates.usedCount')}</span>
        </div>
      </div>
      
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300 group-hover:border-white/30" />
    </div>
  );
};
