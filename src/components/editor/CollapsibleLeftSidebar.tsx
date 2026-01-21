import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Image as ImageIcon, 
  Palette, Type, Sticker, Layers, Shapes, LayoutGrid, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { STICKER_LIBRARY } from './data/stickerLibrary';

// --- STICKERS PANEL IMPLEMENTATION ---
export const StickersPanel = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = STICKER_LIBRARY.filter(cat => {
    // 1. Filter by Category Tab
    if (activeCategory !== 'all' && cat.id !== activeCategory) return false;
    
    // 2. Filter by Search Query
    if (searchQuery) {
      const hasMatchingItems = cat.items.some(item => 
        item.alt.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return hasMatchingItems;
    }
    return true;
  });

  const handleDragStart = (e: React.DragEvent, src: string) => {
    // Crucial: This flag tells the canvas "I am a sticker, do not snap me to a photo grid"
    e.dataTransfer.setData('text/plain', src);
    e.dataTransfer.setData('application/laney-sticker', 'true');
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 pb-2">
        <h3 className="font-semibold text-lg mb-4">Stickers</h3>
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search stickers..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Category Pills */}
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex w-max space-x-2">
            <Button 
              variant={activeCategory === 'all' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveCategory('all')}
              className="rounded-full"
            >
              All
            </Button>
            {STICKER_LIBRARY.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className="rounded-full gap-1"
              >
                <span>{cat.icon}</span> {cat.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="pb-8 space-y-6">
          {filteredCategories.map(cat => (
            <div key={cat.id}>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 mt-2">
                {cat.label}
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {cat.items.filter(item => 
                  !searchQuery || item.alt.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(item => (
                  <div 
                    key={item.id}
                    className="aspect-square flex items-center justify-center p-2 bg-gray-50/50 rounded-lg hover:bg-gray-100 hover:scale-105 cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.src)}
                  >
                    <img 
                      src={item.src} 
                      alt={item.alt} 
                      className="w-full h-full object-contain pointer-events-none" 
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No stickers found.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// ... (Existing Panels: PhotosPanel, ThemesPanel, TextPanel, BackgroundsPanel, ElementsPanel) ...
// Ensure you keep your existing export components here as they were!

export const PhotosPanel = ({ photos, onDragStart, onAddPhotos }: any) => (
  <div className="h-full flex flex-col p-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold">Photos</h3>
      <Button size="sm" onClick={onAddPhotos}>+ Add</Button>
    </div>
    <ScrollArea className="flex-1">
      <div className="grid grid-cols-2 gap-2">
        {photos.map((url: string, i: number) => (
          <div key={i} className="aspect-square bg-gray-100 rounded overflow-hidden cursor-grab hover:opacity-80 transition-opacity" draggable onDragStart={(e) => onDragStart(e, url)}>
            <img src={url} className="w-full h-full object-cover pointer-events-none" />
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
);

export const ThemesPanel = () => <div className="p-4">Themes Panel (Coming Soon)</div>;
export const TextPanel = ({ onAddText }: any) => (
  <div className="p-4 space-y-2">
    <div className="text-sm font-medium text-gray-700 mb-3">Standard text styles</div>
    <Button 
      onClick={() => onAddText('heading')} 
      variant="outline" 
      className="w-full h-12 justify-start px-4 border-gray-300 hover:border-gray-400 bg-white"
    >
      <span className="text-lg font-bold text-gray-900">Een titel toevoegen</span>
    </Button>
    <Button 
      onClick={() => onAddText('subtitle')} 
      variant="outline" 
      className="w-full h-12 justify-start px-4 border-gray-300 hover:border-gray-400 bg-white"
    >
      <span className="text-base font-bold text-gray-900">Een subtitel toevoegen</span>
    </Button>
    <Button 
      onClick={() => onAddText('body')} 
      variant="outline" 
      className="w-full h-12 justify-start px-4 border-gray-300 hover:border-gray-400 bg-white"
    >
      <span className="text-sm font-normal text-gray-900">Platte tekst toevoegen</span>
    </Button>
  </div>
);
export const BackgroundsPanel = ({ onSelectBackground }: any) => (
  <div className="p-4 grid grid-cols-2 gap-2">
    {['#ffffff', '#f0f9ff', '#fdf2f8', '#f0fdf4', '#fffbeb'].map(c => (
      <button key={c} className="h-16 rounded border" style={{ background: c }} onClick={() => onSelectBackground(c)} />
    ))}
  </div>
);
export const ElementsPanel = () => <div className="p-4">Shapes & Lines (Coming Soon)</div>;

// --- MAIN SIDEBAR COMPONENT ---
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

export const CollapsibleLeftSidebar = ({ tabs, defaultOpen = false }: CollapsibleLeftSidebarProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="flex h-full border-r border-gray-200 bg-white shadow-sm z-10 transition-all duration-300 ease-in-out" style={{ width: isOpen ? '400px' : '70px' }}>
      {/* Icon Rail */}
      <div className="w-[70px] flex flex-col items-center py-4 gap-4 bg-gray-50 border-r border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTabId(tab.id);
              if (!isOpen) setIsOpen(true);
            }}
            className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${
              activeTabId === tab.id ? 'text-blue-600 bg-white shadow-sm border-r-2 border-blue-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Panel */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="flex items-center justify-between p-2 border-b border-gray-100 bg-white/50 backdrop-blur">
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setIsOpen(false)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden bg-white">
          {activeTab?.panel}
        </div>
      </div>
    </div>
  );
};