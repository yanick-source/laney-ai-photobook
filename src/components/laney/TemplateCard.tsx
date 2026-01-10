import { Users } from "lucide-react";

interface TemplateCardProps {
  image: string;
  title: string;
  usageCount: number;
  tag?: string;
  onClick?: () => void;
}

export const TemplateCard = ({ image, title, usageCount, tag, onClick }: TemplateCardProps) => {
  return (
    <div 
      className="template-card group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <img 
        src={image} 
        alt={title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Darker gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      
      {/* Tag */}
      {tag && (
        <div className="absolute left-4 top-4 z-20">
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black shadow-lg">
            {tag}
          </span>
        </div>
      )}
      
      {/* Content - positioned in foreground */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-20">
        <h3 className="mb-2 text-xl font-bold text-white drop-shadow-lg">{title}</h3>
        <div className="flex items-center gap-1.5 text-white/90 drop-shadow">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">{usageCount.toLocaleString('nl-NL')} keer gebruikt</span>
        </div>
      </div>
      
      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300 group-hover:border-white/30" />
    </div>
  );
};
