import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  X,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Eye,
  Settings,
  Share2,
  ShoppingCart,
  Sparkles,
  MousePointer2,
  Type,
  LayoutGrid,
  Palette,
  Move,
  BookOpen,
  FileText
} from 'lucide-react';
import { EditorTool } from './types';

interface EditorToolbarProps {
  title: string;
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  activeTool: EditorTool;
  viewMode: 'single' | 'spread';
  showBleedGuides: boolean;
  showSafeArea: boolean;
  showGridLines: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isAIPromptOpen: boolean;
  onClose: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomChange: (zoom: number) => void;
  onToolChange: (tool: EditorTool) => void;
  onViewModeChange: (mode: 'single' | 'spread') => void;
  onToggleGuide: (guide: 'bleed' | 'safe' | 'grid') => void;
  onOrder: () => void;
  onToggleAIPrompt: () => void;
}

export function EditorToolbar({
  title,
  currentPage,
  totalPages,
  zoomLevel,
  activeTool,
  viewMode,
  showBleedGuides,
  showSafeArea,
  showGridLines,
  canUndo,
  canRedo,
  isAIPromptOpen,
  onClose,
  onUndo,
  onRedo,
  onZoomChange,
  onToolChange,
  onViewModeChange,
  onToggleGuide,
  onOrder,
  onToggleAIPrompt
}: EditorToolbarProps) {
  const tools = [
    { id: 'select' as EditorTool, icon: MousePointer2, label: 'Selecteren', shortcut: 'V' },
    { id: 'text' as EditorTool, icon: Type, label: 'Tekst', shortcut: 'T' },
    { id: 'layout' as EditorTool, icon: LayoutGrid, label: 'Layouts', shortcut: 'L' },
    { id: 'background' as EditorTool, icon: Palette, label: 'Achtergrond', shortcut: 'B' },
  ];

  const zoomPresets = [25, 50, 75, 100, 125, 150, 200];

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      {/* Left section - Close & Title */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div>
          <h1 className="font-semibold text-foreground text-sm">{title}</h1>
          <p className="text-xs text-muted-foreground">
            Pagina {currentPage + 1} van {totalPages}
          </p>
        </div>
      </div>

      {/* Center section - Tools */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
        <TooltipProvider delayDuration={300}>
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    activeTool === tool.id && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => onToolChange(tool.id)}
                >
                  <tool.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tool.label} ({tool.shortcut})</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onRedo}
            disabled={!canRedo}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Zoom controls */}
        <div className="flex items-center gap-1 rounded-md border border-border">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onZoomChange(zoomLevel - 10)}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 min-w-[60px]">
                {zoomLevel}%
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {zoomPresets.map((preset) => (
                <DropdownMenuItem 
                  key={preset}
                  onClick={() => onZoomChange(preset)}
                >
                  {preset}%
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onZoomChange(zoomLevel + 10)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* View mode */}
        <div className="flex items-center gap-1 rounded-md border border-border">
          <Button
            variant={viewMode === 'single' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onViewModeChange('single')}
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'spread' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onViewModeChange('spread')}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>

        {/* Guides dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onToggleGuide('bleed')}>
              <span className={cn("mr-2", showBleedGuides && "text-primary")}>✓</span>
              Afloophulplijnen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleGuide('safe')}>
              <span className={cn("mr-2", showSafeArea && "text-primary")}>✓</span>
              Veilige zone
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleGuide('grid')}>
              <span className={cn("mr-2", showGridLines && "text-primary")}>✓</span>
              Rasterlijnen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6" />

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isAIPromptOpen ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={onToggleAIPrompt}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI bewerken (alleen deze pagina)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Order button */}
        <Button 
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
          onClick={onOrder}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Bestellen
        </Button>
      </div>
    </header>
  );
}
