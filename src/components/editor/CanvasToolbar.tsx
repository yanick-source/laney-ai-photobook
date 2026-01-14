import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Eye,
  Grid3X3,
  Sparkles,
} from 'lucide-react';

interface CanvasToolbarProps {
  zoomLevel: number;
  showBleedGuides: boolean;
  showSafeArea: boolean;
  showGridLines: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isAIPromptOpen: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomChange: (zoom: number) => void;
  onToggleGuide: (guide: 'bleed' | 'safe' | 'grid') => void;
  onToggleAIPrompt: () => void;
}

export function CanvasToolbar({
  zoomLevel,
  showBleedGuides,
  showSafeArea,
  showGridLines,
  canUndo,
  canRedo,
  isAIPromptOpen,
  onUndo,
  onRedo,
  onZoomChange,
  onToggleGuide,
  onToggleAIPrompt,
}: CanvasToolbarProps) {
  const zoomPresets = [50, 75, 100, 125, 150, 200];

  return (
    <div className="absolute bottom-6 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-xl">
        <TooltipProvider delayDuration={200}>
          {/* Undo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 rounded-full p-0"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Undo
            </TooltipContent>
          </Tooltip>

          {/* Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 rounded-full p-0"
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Redo
            </TooltipContent>
          </Tooltip>

          <div className="mx-1.5 h-4 w-px bg-border/50" />

          {/* Zoom out */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 rounded-full p-0"
                onClick={() => onZoomChange(Math.max(25, zoomLevel - 10))}
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Zoom out
            </TooltipContent>
          </Tooltip>

          {/* Zoom level dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 min-w-[52px] rounded-full px-2 text-xs font-medium"
              >
                {zoomLevel}%
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[80px]">
              {zoomPresets.map((preset) => (
                <DropdownMenuItem
                  key={preset}
                  onClick={() => onZoomChange(preset)}
                  className="justify-center text-xs"
                >
                  {preset}%
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Zoom in */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 rounded-full p-0"
                onClick={() => onZoomChange(Math.min(300, zoomLevel + 10))}
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Zoom in
            </TooltipContent>
          </Tooltip>

          {/* Fit to screen */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 rounded-full p-0"
                onClick={() => onZoomChange(100)}
              >
                <Maximize className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Fit to screen
            </TooltipContent>
          </Tooltip>

          <div className="mx-1.5 h-4 w-px bg-border/50" />

          {/* Grid toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 w-7 rounded-full p-0',
                  showGridLines && 'bg-muted'
                )}
                onClick={() => onToggleGuide('grid')}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Toggle grid
            </TooltipContent>
          </Tooltip>

          {/* Guides dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-7 w-7 rounded-full p-0',
                      (showBleedGuides || showSafeArea) && 'bg-muted'
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                View guides
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => onToggleGuide('bleed')}>
                <span className={cn('mr-2 text-xs', showBleedGuides && 'text-primary')}>
                  {showBleedGuides ? '✓' : ' '}
                </span>
                Bleed guides
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleGuide('safe')}>
                <span className={cn('mr-2 text-xs', showSafeArea && 'text-primary')}>
                  {showSafeArea ? '✓' : ' '}
                </span>
                Safe area
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="mx-1.5 h-4 w-px bg-border/50" />

          {/* AI */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 w-7 rounded-full p-0',
                  isAIPromptOpen && 'bg-primary/10 text-primary'
                )}
                onClick={onToggleAIPrompt}
              >
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              AI Edit
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
