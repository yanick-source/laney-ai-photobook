import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { PhotobookPage, PageElement, PhotoElement, TextElement, EditorTool } from './types';
import { Trash2 } from 'lucide-react';

interface EditorCanvasProps {
  page: PhotobookPage;
  zoomLevel: number;
  selectedElementId: string | null;
  activeTool: EditorTool;
  showBleedGuides: boolean;
  showSafeArea: boolean;
  showGridLines: boolean;
  viewMode: 'single' | 'spread';
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<PageElement>) => void;
  onDeleteElement: (id: string) => void;
  onDropPhoto: (src: string) => void;
}

export function EditorCanvas({
  page,
  zoomLevel,
  selectedElementId,
  activeTool,
  showBleedGuides,
  showSafeArea,
  showGridLines,
  viewMode,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDropPhoto
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [elementStart, setElementStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const BLEED_SIZE = 3; // percentage
  const SAFE_AREA = 5; // percentage

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const photoSrc = e.dataTransfer.getData('photo-src');
    if (photoSrc) {
      onDropPhoto(photoSrc);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
    }
  };

  const handleElementMouseDown = useCallback((
    e: React.MouseEvent,
    element: PageElement,
    handle?: string
  ) => {
    e.stopPropagation();
    onSelectElement(element.id);

    if (activeTool !== 'select') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStart({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    });

    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    }
  }, [activeTool, onSelectElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart || !elementStart || !selectedElementId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    if (isResizing && resizeHandle) {
      let newWidth = elementStart.width;
      let newHeight = elementStart.height;
      let newX = elementStart.x;
      let newY = elementStart.y;

      if (resizeHandle.includes('e')) newWidth = Math.max(10, elementStart.width + deltaX);
      if (resizeHandle.includes('w')) {
        newWidth = Math.max(10, elementStart.width - deltaX);
        newX = elementStart.x + deltaX;
      }
      if (resizeHandle.includes('s')) newHeight = Math.max(10, elementStart.height + deltaY);
      if (resizeHandle.includes('n')) {
        newHeight = Math.max(10, elementStart.height - deltaY);
        newY = elementStart.y + deltaY;
      }

      onUpdateElement(selectedElementId, { x: newX, y: newY, width: newWidth, height: newHeight });
    } else {
      // Moving
      onUpdateElement(selectedElementId, {
        x: Math.max(0, Math.min(100 - elementStart.width, elementStart.x + deltaX)),
        y: Math.max(0, Math.min(100 - elementStart.height, elementStart.y + deltaY))
      });
    }
  }, [dragStart, elementStart, isResizing, resizeHandle, selectedElementId, onUpdateElement]);

  const handleMouseUp = useCallback(() => {
    setDragStart(null);
    setElementStart(null);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  const renderPhotoElement = (element: PhotoElement) => {
    const isSelected = element.id === selectedElementId;

    return (
      <div
        key={element.id}
        className={cn(
          "absolute overflow-hidden cursor-move transition-shadow",
          isSelected && "ring-2 ring-primary shadow-xl"
        )}
        style={{
          left: `${element.x}%`,
          top: `${element.y}%`,
          width: `${element.width}%`,
          height: `${element.height}%`,
          transform: `rotate(${element.rotation}deg)`,
          zIndex: element.zIndex + 10
        }}
        onMouseDown={(e) => handleElementMouseDown(e, element)}
      >
        <img
          src={element.src}
          alt=""
          className="h-full w-full object-cover pointer-events-none"
          style={{
            objectPosition: `${50 - element.cropX}% ${50 - element.cropY}%`,
            transform: `scale(${100 / element.cropWidth})`
          }}
          draggable={false}
        />

        {/* Resize handles */}
        {isSelected && activeTool === 'select' && (
          <>
            {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => (
              <div
                key={handle}
                className={cn(
                  "absolute bg-white border-2 border-primary rounded-full z-20",
                  handle.includes('n') && 'top-0 -translate-y-1/2',
                  handle.includes('s') && 'bottom-0 translate-y-1/2',
                  handle.includes('w') && 'left-0 -translate-x-1/2',
                  handle.includes('e') && 'right-0 translate-x-1/2',
                  handle === 'n' || handle === 's' ? 'left-1/2 -translate-x-1/2 w-3 h-3 cursor-ns-resize' : '',
                  handle === 'e' || handle === 'w' ? 'top-1/2 -translate-y-1/2 w-3 h-3 cursor-ew-resize' : '',
                  (handle === 'nw' || handle === 'se') && 'w-3 h-3 cursor-nwse-resize',
                  (handle === 'ne' || handle === 'sw') && 'w-3 h-3 cursor-nesw-resize'
                )}
                onMouseDown={(e) => handleElementMouseDown(e, element, handle)}
              />
            ))}

            {/* Delete button */}
            <button
              className="absolute -top-3 -right-3 z-30 rounded-full bg-destructive p-1 text-destructive-foreground shadow-lg hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteElement(element.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    );
  };

  const renderTextElement = (element: TextElement) => {
    const isSelected = element.id === selectedElementId;

    return (
      <div
        key={element.id}
        className={cn(
          "absolute cursor-move",
          isSelected && "ring-2 ring-primary"
        )}
        style={{
          left: `${element.x}%`,
          top: `${element.y}%`,
          width: `${element.width}%`,
          height: `${element.height}%`,
          transform: `rotate(${element.rotation}deg)`,
          zIndex: element.zIndex + 10
        }}
        onMouseDown={(e) => handleElementMouseDown(e, element)}
      >
        <div
          className="h-full w-full flex items-center justify-center"
          style={{
            fontFamily: element.fontFamily,
            fontSize: `${element.fontSize}px`,
            fontWeight: element.fontWeight,
            fontStyle: element.fontStyle,
            color: element.color,
            textAlign: element.textAlign,
            lineHeight: element.lineHeight,
            opacity: element.opacity
          }}
          contentEditable={isSelected}
          suppressContentEditableWarning
          onBlur={(e) => {
            onUpdateElement(element.id, { content: e.currentTarget.textContent || '' });
          }}
        >
          {element.content}
        </div>

        {isSelected && (
          <button
            className="absolute -top-3 -right-3 z-30 rounded-full bg-destructive p-1 text-destructive-foreground shadow-lg hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteElement(element.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  };

  if (!page) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Geen pagina geselecteerd</p>
      </div>
    );
  }

  return (
    <div 
      className="flex h-full flex-1 items-center justify-center bg-muted/20 p-8 overflow-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="relative transition-transform duration-200"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'center'
        }}
      >
        {/* Canvas container with shadow */}
        <div
          ref={canvasRef}
          className={cn(
            "relative overflow-hidden rounded-sm shadow-2xl transition-all",
            isDragOver && "ring-4 ring-primary/50"
          )}
          style={{
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            backgroundColor: page.background.value,
            background: page.background.type === 'gradient'
              ? `linear-gradient(${page.background.gradientAngle || 135}deg, ${page.background.value}, ${page.background.secondaryValue})`
              : page.background.value
          }}
          onClick={handleCanvasClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Bleed guides */}
          {showBleedGuides && (
            <div
              className="absolute inset-0 border-2 border-dashed border-red-400/50 pointer-events-none z-50"
              style={{
                margin: `${BLEED_SIZE}%`
              }}
            />
          )}

          {/* Safe area guides */}
          {showSafeArea && (
            <div
              className="absolute inset-0 border border-blue-400/30 pointer-events-none z-50"
              style={{
                margin: `${SAFE_AREA}%`
              }}
            />
          )}

          {/* Grid lines */}
          {showGridLines && (
            <div className="absolute inset-0 pointer-events-none z-50">
              <div className="absolute left-1/3 top-0 bottom-0 border-l border-gray-300/30" />
              <div className="absolute left-2/3 top-0 bottom-0 border-l border-gray-300/30" />
              <div className="absolute top-1/3 left-0 right-0 border-t border-gray-300/30" />
              <div className="absolute top-2/3 left-0 right-0 border-t border-gray-300/30" />
            </div>
          )}

          {/* Elements */}
          {page.elements.map((element) => 
            element.type === 'photo' 
              ? renderPhotoElement(element as PhotoElement)
              : renderTextElement(element as TextElement)
          )}

          {/* Drop indicator */}
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 z-40">
              <div className="rounded-xl bg-white/90 px-6 py-4 shadow-lg">
                <p className="text-sm font-medium text-foreground">Laat los om foto toe te voegen</p>
              </div>
            </div>
          )}
        </div>

        {/* Page label below canvas */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {page.id === 'cover' ? 'Omslag' : page.id.replace('page-', 'Pagina ')}
        </div>
      </div>
    </div>
  );
}
