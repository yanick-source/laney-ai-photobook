import React from 'react';
import { PageElement, TextElement } from './types';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Trash2, Copy, Layers, ChevronUp, ChevronDown, 
  ChevronsUp, ChevronsDown, Grid3X3 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
  SelectGroup,  // Added
  SelectLabel,  // Added
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FONT_LIBRARY } from '@/assets/Editor/fonts'; // Added import

interface FloatingToolbarProps {
  element: PageElement;
  allElements: PageElement[]; // Needed for calculating Z-Index
  onUpdate: (id: string, updates: Partial<PageElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  recentColors: string[];
  onAddRecentColor: (color: string) => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  element,
  allElements,
  onUpdate,
  onDelete,
  onDuplicate,
  recentColors,
  onAddRecentColor
}) => {
  const isText = element.type === 'text';
  const textEl = element as TextElement;

  // --- LAYERING LOGIC ---
  const handleLayering = (action: 'front' | 'back' | 'forward' | 'backward') => {
    const currentZ = element.zIndex || 0;
    const allZ = allElements.map(e => e.zIndex || 0);
    const maxZ = Math.max(...allZ, 0);
    const minZ = Math.min(...allZ, 0);

    let newZ = currentZ;

    switch (action) {
      case 'front': newZ = maxZ + 1; break;
      case 'back': newZ = minZ - 1; break;
      case 'forward': newZ = currentZ + 1; break;
      case 'backward': newZ = currentZ - 1; break;
    }

    onUpdate(element.id, { zIndex: newZ });
  };

  // --- OPACITY LOGIC ---
  // Convert 0-1 to 0-100 for slider
  const opacityValue = Math.round((element.opacity ?? 1) * 100);
  
  const handleOpacityChange = (val: number[]) => {
    onUpdate(element.id, { opacity: val[0] / 100 });
  };

  // Helper to group fonts for display
  const fontCategories = ['sans-serif', 'serif', 'display', 'handwriting', 'monospace'] as const;

  return (
    <div 
      className="absolute -top-20 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-white rounded-xl shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 z-[100]"
      onMouseDown={(e) => e.stopPropagation()}
    >
      
      {/* --- TEXT TOOLS --- */}
      {isText && (
        <>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onUpdate(element.id, { fontWeight: textEl.fontWeight === 'bold' ? 'normal' : 'bold' })}>
              <Bold className={`h-4 w-4 ${textEl.fontWeight === 'bold' ? 'text-blue-600' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onUpdate(element.id, { fontStyle: textEl.fontStyle === 'italic' ? 'normal' : 'italic' })}>
              <Italic className={`h-4 w-4 ${textEl.fontStyle === 'italic' ? 'text-blue-600' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onUpdate(element.id, { textDecoration: textEl.textDecoration === 'underline' ? 'none' : 'underline' })}>
              <Underline className={`h-4 w-4 ${textEl.textDecoration === 'underline' ? 'text-blue-600' : ''}`} />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Font Family Selector */}
          <Select 
            value={textEl.fontFamily || 'Inter'} 
            onValueChange={(value) => onUpdate(element.id, { fontFamily: value })}
          >
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Select Font">
                <span style={{ fontFamily: textEl.fontFamily || 'Inter' }}>
                  {/* Show current font name (trim if needed) */}
                  {FONT_LIBRARY.find(f => f.value === textEl.fontFamily)?.label || textEl.fontFamily || 'Inter'}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {fontCategories.map((category) => {
                const fontsInCategory = FONT_LIBRARY.filter(f => f.category === category);
                if (fontsInCategory.length === 0) return null;

                return (
                  <SelectGroup key={category}>
                    <SelectLabel className="text-xs font-bold text-muted-foreground mt-2 capitalize">
                      {category.replace('-', ' ')}
                    </SelectLabel>
                    {fontsInCategory.map((font) => (
                      <SelectItem 
                        key={font.value} 
                        value={font.value} 
                        style={{ fontFamily: font.value }}
                      >
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>

          {/* Font Size Controls */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => onUpdate(element.id, { fontSize: Math.max((textEl.fontSize || 16) - 2, 8) })}
              title="Decrease font size"
            >
              <span className="text-xs font-bold">A-</span>
            </Button>
            <span className="text-xs font-medium w-8 text-center">{textEl.fontSize || 16}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => onUpdate(element.id, { fontSize: Math.min((textEl.fontSize || 16) + 2, 72) })}
              title="Increase font size"
            >
              <span className="text-xs font-bold">A+</span>
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Color Picker Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full border border-gray-200 overflow-hidden">
                <div className="w-full h-full" style={{ backgroundColor: textEl.color }} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="center">
              <div className="space-y-3">
                <h4 className="font-medium text-xs text-muted-foreground">Recent Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {recentColors.map(c => (
                    <button 
                      key={c} 
                      className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform" 
                      style={{ backgroundColor: c }}
                      onClick={() => onUpdate(element.id, { color: c })}
                    />
                  ))}
                </div>
                <Separator />
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={textEl.color || '#1a1a1a'} 
                    onChange={(e) => {
                      onUpdate(element.id, { color: e.target.value });
                      onAddRecentColor(e.target.value);
                    }}
                    className="w-full h-8 cursor-pointer"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6 mx-1" />
        </>
      )}

      {/* --- COMMON TOOLS (Position & Opacity) --- */}
      
      {/* Position / Layers */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Position">
            <Layers className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="center">
          <div className="grid gap-1">
            <Button variant="ghost" size="sm" className="justify-start gap-2" onClick={() => handleLayering('front')}>
              <ChevronsUp className="h-4 w-4" /> Bring to Front
            </Button>
            <Button variant="ghost" size="sm" className="justify-start gap-2" onClick={() => handleLayering('forward')}>
              <ChevronUp className="h-4 w-4" /> Bring Forward
            </Button>
            <Button variant="ghost" size="sm" className="justify-start gap-2" onClick={() => handleLayering('backward')}>
              <ChevronDown className="h-4 w-4" /> Send Backward
            </Button>
            <Button variant="ghost" size="sm" className="justify-start gap-2" onClick={() => handleLayering('back')}>
              <ChevronsDown className="h-4 w-4" /> Send to Back
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Transparency / Opacity */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Transparency">
            {/* Using a grid icon to represent transparency checkerboard */}
            <Grid3X3 className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="center">
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span>Transparency</span>
              <span>{opacityValue}%</span>
            </div>
            <Slider 
              value={[opacityValue]} 
              min={0} 
              max={100} 
              step={1} 
              onValueChange={handleOpacityChange} 
            />
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Delete & Duplicate */}
      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600" onClick={() => onDuplicate(element.id)} title="Duplicate">
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => onDelete(element.id)} title="Delete">
        <Trash2 className="h-4 w-4" />
      </Button>

    </div>
  );
};