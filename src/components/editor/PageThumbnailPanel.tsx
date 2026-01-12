import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { PhotobookPage, PhotoElement, TextElement } from './types';
import { GripVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PageThumbnailPanelProps {
  pages: PhotobookPage[];
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onAddPage: () => void;
}

export function PageThumbnailPanel({
  pages,
  currentPageIndex,
  onPageSelect,
  onReorder,
  onAddPage
}: PageThumbnailPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (index === 0) return; // Can't drag cover
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

  const renderPagePreview = (page: PhotobookPage, index: number) => {
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;
    const THUMB_SCALE = 0.22;

    const backgroundStyle = {
      backgroundColor: page.background.value,
      background:
        page.background.type === 'gradient'
          ? `linear-gradient(${page.background.gradientAngle || 135}deg, ${page.background.value}, ${page.background.secondaryValue})`
          : page.background.value,
    };

    const elementsSorted = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);

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
          "group relative cursor-pointer rounded-lg border-2 transition-all duration-200",
          currentPageIndex === index
            ? "border-primary shadow-lg ring-2 ring-primary/20"
            : "border-border hover:border-primary/50",
          draggedIndex === index && "opacity-50",
          dragOverIndex === index && draggedIndex !== index && "border-primary border-dashed"
        )}
      >
        {/* Drag handle */}
        {index !== 0 && (
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Page number badge */}
        <div className={cn(
          "absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium",
          currentPageIndex === index
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}>
          {index === 0 ? 'C' : index}
        </div>

        {/* Page preview */}
        <div className="aspect-[4/3] overflow-hidden rounded-md bg-muted">
          <div className="relative h-full w-full" style={backgroundStyle}>
            <div
              className="absolute left-0 top-0 pointer-events-none"
              style={{
                width: `${CANVAS_WIDTH}px`,
                height: `${CANVAS_HEIGHT}px`,
                transform: `scale(${THUMB_SCALE})`,
                transformOrigin: 'top left',
                ...backgroundStyle,
              }}
            >
              {elementsSorted.map((element) =>
                element.type === 'photo' ? (
                  <div
                    key={element.id}
                    className="absolute overflow-hidden"
                    style={{
                      left: `${(element as PhotoElement).x}%`,
                      top: `${(element as PhotoElement).y}%`,
                      width: `${(element as PhotoElement).width}%`,
                      height: `${(element as PhotoElement).height}%`,
                      transform: `rotate(${(element as PhotoElement).rotation}deg)`,
                      zIndex: (element as PhotoElement).zIndex + 10,
                    }}
                  >
                    <img
                      src={(element as PhotoElement).src}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: `${50 - (element as PhotoElement).cropX}% ${50 - (element as PhotoElement).cropY}%`,
                        transform: `scale(${100 / Math.max(1, (element as PhotoElement).cropWidth)})`,
                      }}
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div
                    key={element.id}
                    className="absolute"
                    style={{
                      left: `${(element as TextElement).x}%`,
                      top: `${(element as TextElement).y}%`,
                      width: `${(element as TextElement).width}%`,
                      height: `${(element as TextElement).height}%`,
                      transform: `rotate(${(element as TextElement).rotation}deg)`,
                      zIndex: (element as TextElement).zIndex + 10,
                      opacity: (element as TextElement).opacity,
                    }}
                  >
                    <div
                      className="h-full w-full flex items-center justify-center"
                      style={{
                        fontFamily: (element as TextElement).fontFamily,
                        fontSize: `${(element as TextElement).fontSize}px`,
                        fontWeight: (element as TextElement).fontWeight,
                        fontStyle: (element as TextElement).fontStyle,
                        color: (element as TextElement).color,
                        textAlign: (element as TextElement).textAlign,
                        lineHeight: (element as TextElement).lineHeight,
                      }}
                    >
                      {(element as TextElement).content}
                    </div>
                  </div>
                )
              )}

              {page.elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Leeg</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page label */}
        <div className="px-1 py-0.5 text-center">
          <span className="text-[10px] text-muted-foreground truncate block">
            {index === 0 ? 'Cover' : `Pagina ${index}`}
          </span>
        </div>

        {/* Photo count badge */}
        {page.elements.filter(el => el.type === 'photo').length > 1 && (
          <div className="absolute bottom-6 left-1 rounded bg-black/60 px-1 text-[9px] text-white">
            {page.elements.filter(el => el.type === 'photo').length} foto's
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-card/50 backdrop-blur-sm w-48">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <h3 className="text-sm font-semibold text-foreground">Pagina's</h3>
        <span className="text-xs text-muted-foreground">{pages.length}</span>
      </div>

      {/* Thumbnails */}
      <ScrollArea className="flex-1 p-2">
        <div ref={containerRef} className="space-y-3">
          {pages.map((page, index) => renderPagePreview(page, index))}
        </div>
      </ScrollArea>

      {/* Footer actions */}
      <div className="border-t border-border p-2">
        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={onAddPage}>
          <Plus className="mr-1 h-3 w-3" />
          Pagina toevoegen
        </Button>
      </div>
    </div>
  );
}
