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
  ZoomIn,
  ZoomOut,
  Maximize,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
}

const zoomPresets = [25, 50, 75, 100, 125, 150, 200];

export function ZoomControls({ zoomLevel, onZoomChange }: ZoomControlsProps) {
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoomLevel + 25, 200));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoomLevel - 25, 25));
  };

  const handleFitToScreen = () => {
    onZoomChange(100);
  };

  return (
    <div className="fixed bottom-36 right-6 z-50">
      <div className="flex items-center gap-1 rounded-full border-2 border-primary bg-white px-3 py-2 shadow-lg">
        <TooltipProvider delayDuration={200}>
          {/* Zoom Out */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 rounded-full p-0"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 25}
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Zoom Out
            </TooltipContent>
          </Tooltip>

          {/* Zoom Level Dropdown */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 min-w-[3rem] rounded-full px-2 py-0 text-xs font-medium"
                  >
                    {zoomLevel}%
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="min-w-[5rem]">
                  {zoomPresets.map((preset) => (
                    <DropdownMenuItem
                      key={preset}
                      onClick={() => onZoomChange(preset)}
                      className={cn(
                        "text-xs",
                        zoomLevel === preset && "bg-primary text-primary-foreground"
                      )}
                    >
                      {preset}%
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Zoom Level
            </TooltipContent>
          </Tooltip>

          {/* Zoom In */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 rounded-full p-0"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Zoom In
            </TooltipContent>
          </Tooltip>

          {/* Fit to Screen */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 rounded-full p-0"
                onClick={handleFitToScreen}
              >
                <Maximize className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Fit to Screen
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
