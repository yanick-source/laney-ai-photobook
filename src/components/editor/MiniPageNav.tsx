import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { PhotobookPage, PhotoElement, TextElement } from './types';

interface MiniPageNavProps {
  pages: PhotobookPage[];
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onAddPage: () => void;
}

export function MiniPageNav({
  pages,
  currentPageIndex,
  onPageSelect,
  onReorder,
  onAddPage,
}: MiniPageNavProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (index === 0) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (index === 0 || draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && index !== 0 && draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const renderMiniThumbnail = (page: PhotobookPage, index: number) => {
    const isActive = currentPageIndex === index;

    const backgroundStyle = {
      backgroundColor: page.background.value,
      background:
        page.background.type === 'gradient'
          ? `linear-gradient(${page.background.gradientAngle || 135}deg, ${page.background.value}, ${page.background.secondaryValue})`
          : page.background.value,
    };

    return (
      <div
        key={page.id}
        draggable={index !== 0}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDrop={(e) => handleDrop(e, index)}
        onDragEnd={handleDragEnd}
        onClick={() => onPageSelect(index)}
        className={cn(
          'group relative flex-shrink-0 cursor-pointer transition-all duration-200',
          draggedIndex === index && 'opacity-40',
          dragOverIndex === index && draggedIndex !== index && 'scale-105'
        )}
      >
        {/* Thumbnail */}
        <div
          className={cn(
            'relative h-12 w-16 overflow-hidden rounded-md border-2 transition-all',
            isActive
              ? 'border-primary shadow-lg ring-2 ring-primary/20'
              : 'border-transparent hover:border-muted-foreground/30'
          )}
          style={backgroundStyle}
        >
          {/* Mini elements preview */}
          {page.elements.slice(0, 3).map((element) => {
            if (element.type === 'photo') {
              const photo = element as PhotoElement;
              return (
                <div
                  key={element.id}
                  className="absolute overflow-hidden"
                  style={{
                    left: `${photo.x}%`,
                    top: `${photo.y}%`,
                    width: `${photo.width}%`,
                    height: `${photo.height}%`,
                  }}
                >
                  <img
                    src={photo.src}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </div>
              );
            }
            return null;
          })}

          {/* Page number overlay */}
          <div
            className={cn(
              'absolute bottom-0 right-0 rounded-tl px-1 text-[9px] font-medium',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-black/40 text-white'
            )}
          >
            {index === 0 ? 'C' : index}
          </div>
        </div>
      </div>
    );
  };

  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 z-30 h-8 w-8 -translate-y-1/2 rounded-full bg-white/90 shadow-md backdrop-blur-sm"
        onClick={() => setIsExpanded(true)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="absolute left-4 top-1/2 z-30 -translate-y-1/2">
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/90 p-2 shadow-lg backdrop-blur-xl">
        {/* Collapse button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full"
          onClick={() => setIsExpanded(false)}
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>

        {/* Thumbnails */}
        <ScrollArea className="max-h-[60vh]">
          <div ref={scrollRef} className="flex flex-col gap-2 p-1">
            {pages.map((page, index) => renderMiniThumbnail(page, index))}
          </div>
        </ScrollArea>

        {/* Add page button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full border border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5"
          onClick={onAddPage}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
