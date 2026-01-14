import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import { PageBackground, BACKGROUND_COLORS } from './types';

interface BackgroundPanelProps {
  isOpen: boolean;
  background: PageBackground;
  onClose: () => void;
  onUpdateBackground: (background: PageBackground) => void;
}

const GRADIENT_PRESETS = [
  { start: '#FFFFFF', end: '#F8F5F2', angle: 180 },
  { start: '#FFF5EB', end: '#E6E0D8', angle: 135 },
  { start: '#F5F5F5', end: '#D4C4B0', angle: 180 },
  { start: '#E6E0D8', end: '#8B7355', angle: 135 },
  { start: '#4A3728', end: '#2C1810', angle: 180 },
  { start: '#1A1A1A', end: '#000000', angle: 135 },
];

export function BackgroundPanel({
  isOpen,
  background,
  onClose,
  onUpdateBackground,
}: BackgroundPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-6 top-1/2 z-40 -translate-y-1/2 animate-in slide-in-from-right-4 fade-in-0 duration-200">
      <div className="w-64 rounded-2xl border border-white/20 bg-white/95 shadow-xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <h3 className="text-sm font-medium">Background</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-4">
          {/* Solid Colors */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Solid Colors
            </label>
            <div className="grid grid-cols-5 gap-2">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    'aspect-square rounded-lg border-2 transition-all hover:scale-105',
                    background.type === 'solid' && background.value === color
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => onUpdateBackground({ type: 'solid', value: color })}
                />
              ))}
            </div>
          </div>

          {/* Gradients */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Gradients
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  className={cn(
                    'aspect-square rounded-lg border-2 transition-all hover:scale-105',
                    background.type === 'gradient' &&
                      background.value === preset.start &&
                      background.secondaryValue === preset.end
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent'
                  )}
                  style={{
                    background: `linear-gradient(${preset.angle}deg, ${preset.start}, ${preset.end})`,
                  }}
                  onClick={() =>
                    onUpdateBackground({
                      type: 'gradient',
                      value: preset.start,
                      secondaryValue: preset.end,
                      gradientAngle: preset.angle,
                    })
                  }
                />
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Custom Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={background.value}
                onChange={(e) => onUpdateBackground({ type: 'solid', value: e.target.value })}
                className="h-10 w-full cursor-pointer rounded-lg border-0"
              />
            </div>
          </div>

          {/* Gradient Angle (if gradient) */}
          {background.type === 'gradient' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Gradient Angle
              </label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[background.gradientAngle || 135]}
                  min={0}
                  max={360}
                  step={15}
                  onValueChange={([value]) =>
                    onUpdateBackground({ ...background, gradientAngle: value })
                  }
                  className="flex-1"
                />
                <span className="w-10 text-right text-xs">{background.gradientAngle || 135}°</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
