import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  RotateCw,
  FlipHorizontal,
  Lock,
  Unlock,
  Trash2,
  SlidersHorizontal,
  ZoomIn,
  Move,
  ImageMinus,
} from 'lucide-react';
import { PhotoElement } from './types';

interface FloatingPhotoControlsProps {
  element: PhotoElement;
  canvasRef: React.RefObject<HTMLDivElement>;
  zoomLevel: number;
  onUpdateElement: (id: string, updates: Partial<PhotoElement>) => void;
  onDeleteElement: (id: string) => void;
  onRemoveFromFrame?: (prefillId: string) => void;
  onReplacePhoto?: (id: string) => void;
}

export function FloatingPhotoControls({
  element,
  canvasRef,
  zoomLevel,
  onUpdateElement,
  onDeleteElement,
  onRemoveFromFrame,
  onReplacePhoto,
}: FloatingPhotoControlsProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showCrop, setShowCrop] = useState(false);

  const isPrefillPhoto = !!element.prefillId;

  const handleRotate = (degrees: number) => {
    onUpdateElement(element.id, { rotation: element.rotation + degrees });
  };

  const handleFlipHorizontal = () => {
    onUpdateElement(element.id, { rotation: element.rotation + 180 });
  };

  const handleLockToggle = () => {
    setIsLocked(!isLocked);
  };

  return (
    <div
      className="absolute z-50 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: `${element.x + element.width / 2}%`,
        top: `${element.y - 4}%`,
        transform: 'translate(-50%, -100%)',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Floating toolbar card */}
      <div className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/95 px-2 py-1.5 shadow-xl backdrop-blur-xl">
        <TooltipProvider delayDuration={200}>
          {/* Crop/Zoom - Only for prefill photos */}
          {isPrefillPhoto && (
            <>
              <Popover open={showCrop} onOpenChange={setShowCrop}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 w-8 p-0 hover:bg-muted',
                      showCrop && 'bg-muted'
                    )}
                    title="Zoom & Pan"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4" align="center">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Zoom & Pan</h4>
                    
                    {/* Zoom slider */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-muted-foreground">Zoom</label>
                        <span className="text-xs font-medium">{Math.round((element.cropZoom || 1) * 100)}%</span>
                      </div>
                      <Slider
                        value={[element.cropZoom || 1]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={([zoom]) =>
                          onUpdateElement(element.id, { cropZoom: zoom })
                        }
                      />
                    </div>
                    
                    {/* Pan controls */}
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <Move className="h-3 w-3 text-muted-foreground" />
                        <label className="text-xs text-muted-foreground">Position</label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Horizontal</label>
                          <Slider
                            value={[element.cropX || 50]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={([x]) =>
                              onUpdateElement(element.id, { cropX: x })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Vertical</label>
                          <Slider
                            value={[element.cropY || 50]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={([y]) =>
                              onUpdateElement(element.id, { cropY: y })
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Reset button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => onUpdateElement(element.id, { cropX: 50, cropY: 50, cropZoom: 1 })}
                    >
                      Reset
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <div className="mx-1 h-5 w-px bg-border" />
            </>
          )}

          {/* Rotate */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={() => handleRotate(90)}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Rotate 90°
            </TooltipContent>
          </Tooltip>

          {/* Flip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={handleFlipHorizontal}
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Flip
            </TooltipContent>
          </Tooltip>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Adjust */}
          <Popover open={showAdjust} onOpenChange={setShowAdjust}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
                title="Adjust"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="center">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Position & Size</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">X (%)</label>
                    <input
                      type="number"
                      value={Math.round(element.x)}
                      onChange={(e) =>
                        onUpdateElement(element.id, { x: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Y (%)</label>
                    <input
                      type="number"
                      value={Math.round(element.y)}
                      onChange={(e) =>
                        onUpdateElement(element.id, { y: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Width (%)</label>
                    <input
                      type="number"
                      value={Math.round(element.width)}
                      onChange={(e) =>
                        onUpdateElement(element.id, { width: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Height (%)</label>
                    <input
                      type="number"
                      value={Math.round(element.height)}
                      onChange={(e) =>
                        onUpdateElement(element.id, { height: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Rotation</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Slider
                      value={[element.rotation]}
                      min={-180}
                      max={180}
                      step={1}
                      onValueChange={([value]) =>
                        onUpdateElement(element.id, { rotation: value })
                      }
                      className="flex-1"
                    />
                    <span className="w-10 text-right text-xs">{element.rotation}°</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Lock */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0 hover:bg-muted',
                  isLocked && 'bg-muted text-primary'
                )}
                onClick={handleLockToggle}
              >
                {isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isLocked ? 'Unlock' : 'Lock'}
            </TooltipContent>
          </Tooltip>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Remove from Frame - Only for prefill photos */}
          {isPrefillPhoto && onRemoveFromFrame && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                  onClick={() => onRemoveFromFrame(element.prefillId!)}
                >
                  <ImageMinus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Remove from frame
              </TooltipContent>
            </Tooltip>
          )}

          {/* Delete */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDeleteElement(element.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Delete
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
