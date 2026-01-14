import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  X,
  MousePointer2,
  Type,
  LayoutGrid,
  Palette,
  ShoppingCart,
} from 'lucide-react';
import { EditorTool } from './types';

interface MinimalHeaderProps {
  title: string;
  activeTool: EditorTool;
  onClose: () => void;
  onToolChange: (tool: EditorTool) => void;
  onOrder: () => void;
}

export function MinimalHeader({
  title,
  activeTool,
  onClose,
  onToolChange,
  onOrder,
}: MinimalHeaderProps) {
  const tools = [
    { id: 'select' as EditorTool, icon: MousePointer2, label: 'Select' },
    { id: 'text' as EditorTool, icon: Type, label: 'Text' },
    { id: 'layout' as EditorTool, icon: LayoutGrid, label: 'Layouts' },
    { id: 'background' as EditorTool, icon: Palette, label: 'Background' },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex h-12 items-center justify-between px-4">
      {/* Left - Close & Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-white/80 shadow-sm backdrop-blur-sm hover:bg-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="hidden sm:block">
          <h1 className="text-sm font-medium text-foreground/80">{title}</h1>
        </div>
      </div>

      {/* Center - Tools */}
      <div className="flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-1 shadow-md backdrop-blur-xl">
        <TooltipProvider delayDuration={200}>
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 w-7 rounded-full p-0 transition-all',
                    activeTool === tool.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted'
                  )}
                  onClick={() => onToolChange(tool.id)}
                >
                  <tool.icon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {tool.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Right - Order button */}
      <Button
        size="sm"
        className="h-8 rounded-full bg-primary px-4 text-xs font-medium shadow-md"
        onClick={onOrder}
      >
        <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
        Order
      </Button>
    </header>
  );
}
