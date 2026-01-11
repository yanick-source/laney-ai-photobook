import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LAYOUT_PRESETS, PageLayout } from './types';
import { X } from 'lucide-react';

interface LayoutPanelProps {
  isOpen: boolean;
  currentLayoutId?: string;
  onClose: () => void;
  onSelectLayout: (layoutId: string) => void;
}

export function LayoutPanel({ isOpen, currentLayoutId, onClose, onSelectLayout }: LayoutPanelProps) {
  if (!isOpen) return null;

  const renderLayoutPreview = (layout: PageLayout) => {
    return (
      <div className="relative aspect-[4/3] w-full bg-muted rounded overflow-hidden">
        {layout.slots.map((slot, i) => (
          <div
            key={i}
            className="absolute bg-primary/20 border border-primary/30 rounded-sm"
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: `${slot.width}%`,
              height: `${slot.height}%`
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="absolute left-20 top-0 bottom-0 z-30 w-64 border-r border-border bg-card shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-semibold">Layouts</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Layouts grid */}
      <ScrollArea className="h-[calc(100%-52px)]">
        <div className="grid grid-cols-2 gap-3 p-4">
          {LAYOUT_PRESETS.map((layout) => (
            <button
              key={layout.id}
              onClick={() => onSelectLayout(layout.id)}
              className={cn(
                "group rounded-lg border-2 p-2 transition-all hover:border-primary",
                currentLayoutId === layout.id
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:bg-muted/50"
              )}
            >
              {renderLayoutPreview(layout)}
              <p className="mt-2 text-xs text-center text-muted-foreground group-hover:text-foreground">
                {layout.name}
              </p>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
