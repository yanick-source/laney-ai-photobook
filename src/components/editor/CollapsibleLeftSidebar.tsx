import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Image,
  Palette,
  Type,
  Sticker,
  Layers,
  Shapes,
} from 'lucide-react';

interface SidebarTab {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  panel: React.ReactNode;
}

interface CollapsibleLeftSidebarProps {
  tabs: SidebarTab[];
  defaultOpen?: boolean;
}

export function CollapsibleLeftSidebar({
  tabs,
  defaultOpen = false,
}: CollapsibleLeftSidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    timeoutRef.current = setTimeout(() => {
      if (!isHovering) {
        setIsOpen(false);
        setActiveTab(null);
      }
    }, 300);
  };

  const handleTabClick = (tabId: string) => {
    if (activeTab === tabId) {
      setActiveTab(null);
    } else {
      setActiveTab(tabId);
      setIsOpen(true);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div
      ref={sidebarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed left-0 top-16 bottom-32 z-30 flex"
    >
      {/* Tab Bar - Always Visible */}
      <div className="flex w-16 flex-col gap-1 border-r border-border/50 bg-white/95 py-4 backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'group relative flex h-14 w-full flex-col items-center justify-center gap-1 transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
              <span className="text-[9px] font-medium">{tab.label}</span>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}

              {/* Hover Tooltip */}
              {!isOpen && (
                <div className="pointer-events-none absolute left-full ml-2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {tab.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Expandable Panel */}
      <div
        className={cn(
          'overflow-hidden border-r border-border/50 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-out',
          isOpen && activeTab ? 'w-80 opacity-100' : 'w-0 opacity-0'
        )}
      >
        {activeTabData && (
          <div className="h-full w-80 overflow-y-auto">
            {/* Panel Header */}
            <div className="sticky top-0 z-10 border-b border-border/50 bg-white/95 px-4 py-3 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-foreground">
                {activeTabData.label}
              </h3>
            </div>

            {/* Panel Content */}
            <div className="p-4">{activeTabData.panel}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Panel Components

export function PhotosPanel({ photos, onDragStart }: { photos: string[]; onDragStart: (src: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPhotos = photos.filter((photo) =>
    photo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search photos..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      {/* Photo Grid */}
      <div className="grid grid-cols-2 gap-2">
        {filteredPhotos.map((photo, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('photo-src', photo);
              e.dataTransfer.effectAllowed = 'copy';
              onDragStart(photo);
            }}
            className="group relative aspect-square cursor-grab overflow-hidden rounded-lg bg-gray-100 transition-all hover:scale-105 hover:shadow-lg active:cursor-grabbing"
          >
            <img
              src={photo}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No photos found
        </div>
      )}
    </div>
  );
}

export function ThemesPanel() {
  const themes = [
    { id: 'modern', name: 'Modern Minimal', color: '#000000' },
    { id: 'warm', name: 'Warm & Cozy', color: '#D4A574' },
    { id: 'elegant', name: 'Elegant Classic', color: '#2C3E50' },
    { id: 'vibrant', name: 'Vibrant Pop', color: '#FF6B6B' },
  ];

  return (
    <div className="space-y-3">
      {themes.map((theme) => (
        <button
          key={theme.id}
          className="group w-full overflow-hidden rounded-lg border border-border bg-white p-4 text-left transition-all hover:border-primary hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 shrink-0 rounded-lg"
              style={{ backgroundColor: theme.color }}
            />
            <div>
              <h4 className="font-medium text-foreground">{theme.name}</h4>
              <p className="text-xs text-muted-foreground">Click to apply</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export function TextPanel({ onAddText }: { onAddText: (type: 'heading' | 'subheading' | 'body') => void }) {
  const textTypes = [
    { type: 'heading' as const, label: 'Add Heading', preview: 'Heading Text', size: 'text-2xl' },
    { type: 'subheading' as const, label: 'Add Subheading', preview: 'Subheading Text', size: 'text-lg' },
    { type: 'body' as const, label: 'Add Body Text', preview: 'Body text goes here', size: 'text-sm' },
  ];

  return (
    <div className="space-y-3">
      {textTypes.map((item) => (
        <button
          key={item.type}
          onClick={() => onAddText(item.type)}
          className="group w-full rounded-lg border border-border bg-white p-4 text-left transition-all hover:border-primary hover:shadow-md"
        >
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            {item.label}
          </div>
          <div className={cn('font-medium text-foreground', item.size)}>
            {item.preview}
          </div>
        </button>
      ))}
    </div>
  );
}

export function StickersPanel() {
  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-muted-foreground">
        Sticker library coming soon
      </div>
    </div>
  );
}

export function BackgroundsPanel({ onSelectBackground }: { onSelectBackground: (bg: string) => void }) {
  const colors = [
    '#FFFFFF', '#F8F5F2', '#FFF5EB', '#F5F5F5',
    '#E6E0D8', '#D4C4B0', '#8B7355', '#4A3728',
    '#000000', '#1A1A1A', '#333333', '#666666',
  ];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-3 text-xs font-medium text-muted-foreground">Solid Colors</h4>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onSelectBackground(color)}
              className="group relative aspect-square overflow-hidden rounded-lg border-2 border-border transition-all hover:scale-105 hover:border-primary"
              style={{ backgroundColor: color }}
            >
              {color === '#FFFFFF' && (
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%,transparent_75%,#f0f0f0_75%,#f0f0f0),linear-gradient(45deg,#f0f0f0_25%,transparent_25%,transparent_75%,#f0f0f0_75%,#f0f0f0)] bg-[length:10px_10px] bg-[position:0_0,5px_5px]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ElementsPanel() {
  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-muted-foreground">
        Shapes and elements coming soon
      </div>
    </div>
  );
}
