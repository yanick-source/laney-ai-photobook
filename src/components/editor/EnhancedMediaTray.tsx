import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Search,
  Star,
  Grid,
  List,
  Image,
} from 'lucide-react';

interface EnhancedMediaTrayProps {
  photos: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function EnhancedMediaTray({ photos, isOpen, onClose }: EnhancedMediaTrayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const toggleFavorite = (index: number) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleDragStart = (e: React.DragEvent, photoSrc: string) => {
    e.dataTransfer.setData('photo-src', photoSrc);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredPhotos = photos.filter((_, index) => {
    if (showFavoritesOnly && !favorites.has(index)) return false;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-20 right-6 z-40 animate-in slide-in-from-bottom-4 fade-in-0 duration-200">
      <div className="w-80 rounded-2xl border border-white/20 bg-white/95 shadow-xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Photos</h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
              {filteredPhotos.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 border-0 bg-muted/50 pl-7 text-xs"
            />
          </div>

          <Button
            variant={showFavoritesOnly ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Star className={cn('h-3 w-3', showFavoritesOnly && 'fill-current')} />
          </Button>

          <div className="flex rounded-md border border-border">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Photos Grid/List */}
        <ScrollArea className="h-72">
          <div
            className={cn(
              'p-3',
              viewMode === 'grid'
                ? 'grid grid-cols-3 gap-2'
                : 'flex flex-col gap-2'
            )}
          >
            {filteredPhotos.map((photo, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, photo)}
                className={cn(
                  'group relative cursor-grab overflow-hidden rounded-lg border border-border bg-muted transition-all hover:border-primary hover:shadow-md active:cursor-grabbing',
                  viewMode === 'grid' ? 'aspect-square' : 'flex h-14 items-center gap-3 p-2'
                )}
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className={cn(
                    'object-cover',
                    viewMode === 'grid' ? 'h-full w-full' : 'h-10 w-10 rounded'
                  )}
                  draggable={false}
                />

                {viewMode === 'list' && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">Photo {index + 1}</p>
                    <p className="text-[10px] text-muted-foreground">Drag to canvas</p>
                  </div>
                )}

                {/* Favorite button */}
                <button
                  className={cn(
                    'absolute right-1 top-1 rounded-full p-1 transition-all',
                    viewMode === 'list' && 'relative right-0 top-0',
                    favorites.has(index)
                      ? 'bg-yellow-400/90 text-yellow-900'
                      : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(index);
                  }}
                >
                  <Star className={cn('h-3 w-3', favorites.has(index) && 'fill-current')} />
                </button>

                {/* Photo number overlay */}
                {viewMode === 'grid' && (
                  <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[9px] text-white">
                    {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border/50 px-4 py-2">
          <p className="text-center text-xs text-muted-foreground">
            Drag photos to the canvas
          </p>
        </div>
      </div>
    </div>
  );
}
