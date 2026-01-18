import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Image, Palette, Type, Sticker, Layers, Shapes, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarTab {
  id: string;
  icon: any;
  label: string;
  panel: React.ReactNode;
}

interface CollapsibleLeftSidebarProps {
  tabs: SidebarTab[];
  defaultOpen?: boolean;
}

export function CollapsibleLeftSidebar({ tabs, defaultOpen = false }: CollapsibleLeftSidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleTabClick = (tabId: string) => {
    if (activeTab === tabId) {
      setIsOpen(false);
      setActiveTab(null);
    } else {
      setIsOpen(true);
      setActiveTab(tabId);
    }
  };

  return (
    <div className="absolute left-0 top-0 bottom-16 z-40 flex h-full">
      {/* Icon Bar */}
      <div className="flex w-16 flex-col items-center border-r border-border bg-white py-4 shadow-sm z-50">
        <div className="flex flex-col gap-2 w-full px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100",
                activeTab === tab.id ? "bg-primary/10 text-primary" : "text-gray-500"
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Panel */}
      {isOpen && activeTab && (
        <div className="w-80 border-r border-border bg-white shadow-xl animate-in slide-in-from-left-5 duration-200">
          <div className="h-full flex flex-col">
             {tabs.find(t => t.id === activeTab)?.panel}
          </div>
        </div>
      )}
    </div>
  );
}

// --- PHOTOS PANEL with Drag & Drop Fix ---
export function PhotosPanel({ photos, onAddPhotos, onDragStart }: { photos: string[], onAddPhotos: () => void, onDragStart: (src: string) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-medium mb-4">Your Photos</h3>
        <Button onClick={onAddPhotos} className="w-full gap-2">
          <Upload className="w-4 h-4" /> Upload Photos
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-2">
          {photos.map((src, i) => (
            <div 
              key={i} 
              className="relative aspect-square rounded-md overflow-hidden bg-gray-100 cursor-move hover:ring-2 hover:ring-primary group"
              draggable="true" // <--- Critical for drag
              onDragStart={(e) => {
                // HTML5 Drag Data
                e.dataTransfer.setData('text/plain', src);
                e.dataTransfer.effectAllowed = 'copy';
                if(onDragStart) onDragStart(src);
              }}
            >
              <img src={src} className="w-full h-full object-cover pointer-events-none" alt="" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ... (Rest of panels: ThemesPanel, TextPanel, etc. can remain simple stubs or use existing code)
export function ThemesPanel() { return <div className="p-4">Themes coming soon</div>; }
export function TextPanel({ onAddText }: { onAddText: (type: any) => void }) { 
  return (
    <div className="p-4 space-y-2">
      <Button variant="outline" className="w-full justify-start h-12 text-xl font-bold" onClick={() => onAddText('heading')}>Add Heading</Button>
      <Button variant="outline" className="w-full justify-start h-10 text-lg font-medium" onClick={() => onAddText('subheading')}>Add Subheading</Button>
      <Button variant="outline" className="w-full justify-start h-8" onClick={() => onAddText('body')}>Add Body Text</Button>
    </div>
  ); 
}
export function StickersPanel() { return <div className="p-4">Stickers coming soon</div>; }
export function BackgroundsPanel({ onSelectBackground }: { onSelectBackground: (bg: string) => void }) {
  const colors = ['#FFFFFF', '#F8F5F2', '#E6E0D8', '#D4C4B0', '#000000', '#333333'];
  return (
    <div className="p-4 grid grid-cols-3 gap-2">
       {colors.map(c => (
         <button key={c} className="w-full aspect-square rounded border shadow-sm" style={{background: c}} onClick={() => onSelectBackground(c)} />
       ))}
    </div>
  );
}
export function ElementsPanel() { return <div className="p-4">Shapes coming soon</div>; }