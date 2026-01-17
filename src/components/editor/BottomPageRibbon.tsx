import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Copy, Trash2, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { PhotobookPage } from './types';

interface BottomPageRibbonProps {
  pages: PhotobookPage[];
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
}

export function BottomPageRibbon({
  pages,
  currentPageIndex,
  onPageSelect,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onReorderPages,
}: BottomPageRibbonProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const THUMBNAIL_WIDTH = 120;
  const THUMBNAIL_HEIGHT = 90;

  // Check scroll position
  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, [pages]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = THUMBNAIL_WIDTH * 3;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    onReorderPages(draggedIndex, index);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-white/95 backdrop-blur-xl">
      <div className="flex h-32 items-center gap-2 px-4">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full bg-white shadow-md hover:bg-gray-50"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Pages Container */}
        <div
          ref={scrollContainerRef}
          className="flex flex-1 gap-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {pages.map((page, index) => {
            const isActive = index === currentPageIndex;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={page.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'group relative shrink-0 cursor-pointer transition-all duration-200',
                  isDragging && 'opacity-50',
                  isDragOver && 'scale-105'
                )}
                style={{ width: THUMBNAIL_WIDTH }}
              >
                {/* Thumbnail */}
                <div
                  onClick={() => onPageSelect(index)}
                  className={cn(
                    'relative overflow-hidden rounded-lg border-2 bg-white shadow-sm transition-all duration-200',
                    isActive
                      ? 'border-primary shadow-lg ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50 hover:shadow-md'
                  )}
                  style={{ height: THUMBNAIL_HEIGHT }}
                >
                  {/* Page Preview */}
                  <div
                    className="h-full w-full"
                    style={{
                      background: page.background.type === 'solid'
                        ? page.background.value
                        : page.background.type === 'gradient'
                        ? `linear-gradient(${page.background.gradientAngle || 0}deg, ${page.background.value}, ${page.background.secondaryValue})`
                        : '#FFFFFF',
                    }}
                  >
                    {/* Simplified element preview */}
                    {page.elements.slice(0, 4).map((element) => (
                      <div
                        key={element.id}
                        className="absolute"
                        style={{
                          left: `${element.x}%`,
                          top: `${element.y}%`,
                          width: `${element.width}%`,
                          height: `${element.height}%`,
                        }}
                      >
                        {element.type === 'photo' && (
                          <img
                            src={element.src}
                            alt=""
                            className="h-full w-full object-cover"
                            style={{ opacity: 0.8 }}
                            draggable={false}
                          />
                        )}
                        {element.type === 'text' && (
                          <div
                            className="flex items-center justify-center text-[4px] font-medium"
                            style={{ color: element.color, opacity: 0.6 }}
                          >
                            {element.content.substring(0, 20)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Page Number */}
                  <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {index === 0 ? 'Cover' : index}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full bg-white/90 hover:bg-white"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        side="top"
                        sideOffset={6}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            onDuplicatePage(index);
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy page
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={pages.length <= 1}
                          onSelect={(e) => {
                            e.preventDefault();
                            if (pages.length > 1) onDeletePage(index);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete page
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </div>
            );
          })}

          {/* Add Page Button */}
          <button
            onClick={onAddPage}
            className="flex shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-border bg-gray-50 transition-all hover:border-primary hover:bg-primary/5"
            style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_HEIGHT }}
          >
            <div className="flex flex-col items-center gap-1">
              <Plus className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground">Add Page</span>
            </div>
          </button>
        </div>

        {/* Scroll Right Button */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full bg-white shadow-md hover:bg-gray-50"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
