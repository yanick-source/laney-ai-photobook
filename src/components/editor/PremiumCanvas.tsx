import React, { useState, useRef } from 'react';
import { PhotobookPage, PageElement } from './types';
import { Image, Move } from 'lucide-react'; // You might need to import icons

interface PremiumCanvasProps {
  page: PhotobookPage | null;
  zoomLevel: number;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<PageElement>) => void;
  // NEW prop for dropping photos
  onPhotoDrop?: (src: string, x: number, y: number) => void;
}

export const PremiumCanvas: React.FC<PremiumCanvasProps> = ({
  page,
  zoomLevel,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onPhotoDrop
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  if (!page) return <div className="h-full flex items-center justify-center text-gray-400">No Page Selected</div>;

  // --- Internal Dragging (Moving elements on canvas) ---
  const handleMouseDown = (e: React.MouseEvent, element: PageElement) => {
    e.stopPropagation();
    onSelectElement(element.id);
    setDragging({
      id: element.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: element.x,
      initialY: element.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragging.startX) / rect.width) * 100;
    const deltaY = ((e.clientY - dragging.startY) / rect.height) * 100;

    let newX = dragging.initialX + deltaX;
    let newY = dragging.initialY + deltaY;

    // Grid Snapping (2.5% grid)
    const gridSize = 2.5; 
    const threshold = 1.0;
    if (Math.abs(newX % gridSize) < threshold) newX = Math.round(newX / gridSize) * gridSize;
    if (Math.abs(newY % gridSize) < threshold) newY = Math.round(newY / gridSize) * gridSize;

    onUpdateElement(dragging.id, { x: newX, y: newY });
  };

  const handleMouseUp = () => setDragging(null);

  // --- External Drop (Dragging photos from sidebar) ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow dropping
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!onPhotoDrop || !containerRef.current) return;

    // Get the photo source passed from the sidebar (assuming it sets dataTransfer text/plain)
    const src = e.dataTransfer.getData('text/plain');
    if (!src) return;

    // Calculate Drop Coordinates in Percentage
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onPhotoDrop(src, x, y);
  };

  return (
    <div 
      className="relative flex items-center justify-center py-8"
      style={{ minHeight: '100%' }}
      onClick={() => onSelectElement(null)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div 
        ref={containerRef}
        className="relative bg-white shadow-2xl overflow-hidden transition-all duration-200 origin-center rounded-3xl ring-1 ring-gray-900/5"
        style={{ 
          width: '800px',
          height: '600px',
          transform: `scale(${zoomLevel / 100})`,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background */}
        <div className="absolute inset-0" style={{ background: page.background?.value || '#fff' }} />

        {/* 1. PREFILLS LAYER (Empty Slots) */}
        {page.prefills?.map(prefill => (
          prefill.isEmpty && (
            <div
              key={prefill.id}
              className="absolute border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 pointer-events-none"
              style={{
                left: `${prefill.x}%`,
                top: `${prefill.y}%`,
                width: `${prefill.width}%`,
                height: `${prefill.height}%`,
                borderRadius: '8px'
              }}
            >
              <Image className="w-8 h-8 opacity-50 mb-2" />
              <span className="text-xs font-medium">Drag photo</span>
            </div>
          )
        ))}

        {/* 2. ELEMENTS LAYER */}
        {page.elements.map(el => (
          <div
            key={el.id}
            onMouseDown={(e) => handleMouseDown(e, el)}
            className={`absolute cursor-move group ${selectedElementId === el.id ? 'z-50' : 'z-10'}`}
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.width}%`,
              height: `${el.height}%`,
              transform: `rotate(${el.rotation}deg)`
            }}
          >
            {/* Selection Ring */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-200 rounded-lg ${
              selectedElementId === el.id 
                ? 'ring-4 ring-blue-500 shadow-lg' 
                : 'group-hover:ring-2 group-hover:ring-blue-300'
            }`} />

            {/* Content */}
            <div className="w-full h-full overflow-hidden rounded-lg bg-gray-100"> 
              {el.type === 'photo' ? (
                <img src={el.src} className="w-full h-full object-cover pointer-events-none" alt="" />
              ) : (
                <div className="w-full h-full p-2" style={{ color: el.color, fontSize: el.fontSize }}>
                  {el.content}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};