import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronUp,
  ChevronDown,
  Search,
  Star,
  Grid,
  List,
  Image
} from 'lucide-react';

interface MediaTrayProps {
  photos: string[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function MediaTray({ photos, isExpanded, onToggleExpand }: MediaTrayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const toggleFavorite = (index: number) => {
    setFavorites(prev => {
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

  if (!isExpanded) {
    return (
      <div className="flex h-12 items-center justify-between border-t border-border bg-card px-4">
        <div className="flex items-center gap-2">
          <Image className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{photos.length} foto's beschikbaar</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleExpand}>
          <ChevronUp className="h-4 w-4" />
          Toon foto's
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-48 flex-col border-t border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">Foto's</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {photos.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Zoeken..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 w-40 pl-7 text-xs"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex rounded-md border border-border">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('list')}
            >
              <List className="h-3 w-3" />
            </Button>
          </div>

          {/* Collapse */}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleExpand}>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Photo grid */}
      <ScrollArea className="flex-1">
        <div className={cn(
          "p-3",
          viewMode === 'grid' 
            ? "grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2"
            : "flex flex-col gap-2"
        )}>
          {photos.map((photo, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, photo)}
              className={cn(
                "group relative cursor-grab overflow-hidden rounded-lg border border-border bg-muted transition-all hover:border-primary hover:shadow-md active:cursor-grabbing",
                viewMode === 'grid' ? "aspect-square" : "flex h-16 items-center gap-3 p-2"
              )}
            >
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className={cn(
                  "object-cover",
                  viewMode === 'grid' ? "h-full w-full" : "h-12 w-12 rounded"
                )}
                draggable={false}
              />

              {viewMode === 'list' && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">Foto {index + 1}</p>
                  <p className="text-[10px] text-muted-foreground">Sleep naar canvas</p>
                </div>
              )}

              {/* Favorite button */}
              <button
                className={cn(
                  "absolute top-1 right-1 rounded-full p-1 transition-all",
                  favorites.has(index)
                    ? "bg-yellow-400/90 text-yellow-900"
                    : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(index);
                }}
              >
                <Star className={cn("h-3 w-3", favorites.has(index) && "fill-current")} />
              </button>

              {/* Photo number overlay */}
              <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[9px] text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
