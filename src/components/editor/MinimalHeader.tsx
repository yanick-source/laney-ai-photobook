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
  FileText,
  BookOpen,
} from 'lucide-react';
import { EditorTool } from './types';
import { useEffect, useState } from 'react';

interface MinimalHeaderProps {
  title: string;
  currentPage: number;
  totalPages: number;
  activeTool: EditorTool;
  viewMode: 'single' | 'spread';
  onClose: () => void;
  onToolChange: (tool: EditorTool) => void;
  onViewModeChange: (mode: 'single' | 'spread') => void;
  onOrder: () => void;
  onTitleChange?: (nextTitle: string) => void;
}

export function MinimalHeader({
  title,
  currentPage,
  totalPages,
  activeTool,
  viewMode,
  onClose,
  onToolChange,
  onViewModeChange,
  onOrder,
  onTitleChange,
}: MinimalHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  useEffect(() => {
    if (!isEditingTitle) {
      setDraftTitle(title);
    }
  }, [title, isEditingTitle]);

  const commitTitle = () => {
    const next = draftTitle.trim();
    if (onTitleChange && next && next !== title) {
      onTitleChange(next);
    }
    setIsEditingTitle(false);
  };

  const tools = [
    { id: 'select' as EditorTool, icon: MousePointer2, label: 'Select' },
    { id: 'text' as EditorTool, icon: Type, label: 'Text' },
    { id: 'layout' as EditorTool, icon: LayoutGrid, label: 'Layouts' },
    { id: 'background' as EditorTool, icon: Palette, label: 'Background' },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex h-12 items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-white/80 shadow-sm backdrop-blur-sm hover:bg-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute left-24 top-1/2 flex min-w-0 max-w-[42vw] -translate-y-1/2 items-center gap-2">
        {onTitleChange ? (
          isEditingTitle ? (
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTitle();
                if (e.key === 'Escape') {
                  setDraftTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              className="h-8 w-56 rounded-full border border-border bg-white/90 px-3 text-sm font-medium text-foreground shadow-sm outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64"
              autoFocus
            />
          ) : (
            <button
              type="button"
              className="min-w-0 text-left"
              onClick={() => setIsEditingTitle(true)}
            >
              <h1 className="truncate text-sm font-medium text-foreground/80">{title}</h1>
            </button>
          )
        ) : (
          <h1 className="truncate text-sm font-medium text-foreground/80">{title}</h1>
        )}

        <span className="shrink-0 text-xs text-muted-foreground">
          · Page {currentPage + 1} of {totalPages}
        </span>
      </div>

      {/* Center - Tools + View Mode */}
      <div className="flex items-center gap-2">
        {/* Tools */}
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

        {/* View Mode Toggle */}
        <div className="flex items-center gap-0.5 rounded-full bg-white/90 px-1 py-1 shadow-md backdrop-blur-xl">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 w-7 rounded-full p-0 transition-all',
                    viewMode === 'single'
                      ? 'bg-muted'
                      : 'hover:bg-muted/50'
                  )}
                  onClick={() => onViewModeChange('single')}
                >
                  <FileText className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Single page
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 w-7 rounded-full p-0 transition-all',
                    viewMode === 'spread'
                      ? 'bg-muted'
                      : 'hover:bg-muted/50'
                  )}
                  onClick={() => onViewModeChange('spread')}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Spread view
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
