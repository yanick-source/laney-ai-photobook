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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
  Palette,
  Trash2,
  Type,
  SlidersHorizontal,
} from 'lucide-react';
import { TextElement, FONT_FAMILIES } from './types';

interface FloatingTextControlsProps {
  element: TextElement;
  onUpdateElement: (id: string, updates: Partial<TextElement>) => void;
  onDeleteElement: (id: string) => void;
}

const TEXT_COLORS = [
  '#000000', '#333333', '#666666', '#999999',
  '#FFFFFF', '#E66016', '#AA3016', '#1a5f7a',
];

export function FloatingTextControls({
  element,
  onUpdateElement,
  onDeleteElement,
}: FloatingTextControlsProps) {
  return (
    <div
      className="absolute z-50 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: `${element.x + element.width / 2}%`,
        top: `${element.y - 4}%`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/95 px-2 py-1.5 shadow-xl backdrop-blur-xl">
        <TooltipProvider delayDuration={200}>
          {/* Font Family */}
          <Select
            value={element.fontFamily}
            onValueChange={(value) => onUpdateElement(element.id, { fontFamily: value })}
          >
            <SelectTrigger className="h-7 w-24 border-0 bg-transparent text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span style={{ fontFamily: font.value }}>{font.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Font Size */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onUpdateElement(element.id, { fontSize: Math.max(8, element.fontSize - 2) })}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-xs font-medium">{element.fontSize}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onUpdateElement(element.id, { fontSize: Math.min(120, element.fontSize + 2) })}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Bold */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 w-7 p-0',
                  element.fontWeight === 'bold' && 'bg-muted'
                )}
                onClick={() =>
                  onUpdateElement(element.id, {
                    fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold',
                  })
                }
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Bold</TooltipContent>
          </Tooltip>

          {/* Italic */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 w-7 p-0',
                  element.fontStyle === 'italic' && 'bg-muted'
                )}
                onClick={() =>
                  onUpdateElement(element.id, {
                    fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic',
                  })
                }
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Italic</TooltipContent>
          </Tooltip>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn('h-7 w-7 p-0', element.textAlign === 'left' && 'bg-muted')}
              onClick={() => onUpdateElement(element.id, { textAlign: 'left' })}
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn('h-7 w-7 p-0', element.textAlign === 'center' && 'bg-muted')}
              onClick={() => onUpdateElement(element.id, { textAlign: 'center' })}
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn('h-7 w-7 p-0', element.textAlign === 'right' && 'bg-muted')}
              onClick={() => onUpdateElement(element.id, { textAlign: 'right' })}
            >
              <AlignRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Color */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <div
                      className="h-4 w-4 rounded border border-border"
                      style={{ backgroundColor: element.color }}
                    />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Color</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-auto p-3" align="center">
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-1.5">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        'h-6 w-6 rounded-md border-2 transition-all hover:scale-110',
                        element.color === color ? 'border-primary' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => onUpdateElement(element.id, { color })}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={element.color}
                  onChange={(e) => onUpdateElement(element.id, { color: e.target.value })}
                  className="h-8 w-full cursor-pointer rounded border-0"
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Advanced */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">More options</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-56 p-4" align="center">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Opacity</label>
                  <Slider
                    value={[element.opacity * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) =>
                      onUpdateElement(element.id, { opacity: value / 100 })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Line Height</label>
                  <Slider
                    value={[element.lineHeight * 100]}
                    min={80}
                    max={200}
                    step={5}
                    onValueChange={([value]) =>
                      onUpdateElement(element.id, { lineHeight: value / 100 })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Rotation</label>
                  <div className="mt-2 flex items-center gap-2">
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

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Delete */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                onClick={() => onDeleteElement(element.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Delete</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
