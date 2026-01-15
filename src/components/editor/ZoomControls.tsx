import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ZoomControls({ zoomLevel, onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="fixed bottom-8 right-8 z-40">
      <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-lg backdrop-blur-sm border border-border">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-muted"
          onClick={onZoomOut}
          disabled={zoomLevel <= 25}
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        
        <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-center">
          {Math.round(zoomLevel)}%
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-muted"
          onClick={onZoomIn}
          disabled={zoomLevel >= 200}
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}