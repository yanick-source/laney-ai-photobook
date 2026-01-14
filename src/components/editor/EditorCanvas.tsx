import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { PhotobookPage, PageElement, PhotoElement, TextElement, EditorTool } from './types';
import { FloatingPhotoControls } from './FloatingPhotoControls';
import { FloatingTextControls } from './FloatingTextControls';

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
  const BLEED_SIZE = 3;
  const SAFE_AREA = 5;

  const selectedElement = selectedElementId
    ? page.elements.find((el) => el.id === selectedElementId)
    : null;

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
          "absolute overflow-hidden cursor-move transition-all duration-150",
          isSelected && "ring-2 ring-primary/80 shadow-2xl"
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
        {/* Smart crop rendering:
            - cropWidth/cropHeight: percentage of image visible (100 = full, 50 = half = 2x zoom)
            - cropX/cropY: offset from top-left corner to center the focal point
        */}
        <img
          src={element.src}
          alt=""
          className="h-full w-full object-cover pointer-events-none"
          style={{
            // Calculate the scale: 100/cropWidth means smaller cropWidth = more zoom
            transform: `scale(${100 / Math.max(element.cropWidth, element.cropHeight)})`,
            // Position the visible area: cropX/Y represents the offset percentage
            transformOrigin: `${element.cropX + element.cropWidth / 2}% ${element.cropY + element.cropHeight / 2}%`
          }}
          draggable={false}
        />

        {/* Corner resize handles */}
        {isSelected && activeTool === 'select' && (
          <>
            {['nw', 'ne', 'se', 'sw'].map((handle) => (
              <div
                key={handle}
                className={cn(
                  "absolute h-3 w-3 rounded-full bg-white border-2 border-primary shadow-lg z-20 transition-transform hover:scale-125",
                  handle === 'nw' && 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
                  handle === 'ne' && 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
                  handle === 'se' && 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
                  handle === 'sw' && 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize'
                )}
                onMouseDown={(e) => handleElementMouseDown(e, element, handle)}
              />
            ))}
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
          "absolute cursor-move transition-all duration-150",
          isSelected && "ring-2 ring-primary/80"
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

        {/* Corner resize handles */}
        {isSelected && activeTool === 'select' && (
          <>
            {['nw', 'ne', 'se', 'sw'].map((handle) => (
              <div
                key={handle}
                className={cn(
                  "absolute h-3 w-3 rounded-full bg-white border-2 border-primary shadow-lg z-20 transition-transform hover:scale-125",
                  handle === 'nw' && 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
                  handle === 'ne' && 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
                  handle === 'se' && 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
                  handle === 'sw' && 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize'
                )}
                onMouseDown={(e) => handleElementMouseDown(e, element, handle)}
              />
            ))}
          </>
        )}
      </div>
    );
  };

  if (!page) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No page selected</p>
      </div>
    );
  }

  return (
    <div 
      className="relative flex h-full flex-1 items-center justify-center overflow-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="relative transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'center'
        }}
      >
        {/* Canvas with floating effect */}
        <div
          ref={canvasRef}
          className={cn(
            "relative overflow-hidden rounded-lg transition-all duration-200",
            isDragOver && "ring-4 ring-primary/30"
          )}
          style={{
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            backgroundColor: page.background.value,
            background: page.background.type === 'gradient'
              ? `linear-gradient(${page.background.gradientAngle || 135}deg, ${page.background.value}, ${page.background.secondaryValue})`
              : page.background.value,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
          onClick={handleCanvasClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Bleed guides */}
          {showBleedGuides && (
            <div
              className="absolute inset-0 border-2 border-dashed border-red-400/40 pointer-events-none z-50"
              style={{ margin: `${BLEED_SIZE}%` }}
            />
          )}

          {/* Safe area guides */}
          {showSafeArea && (
            <div
              className="absolute inset-0 border border-blue-400/30 pointer-events-none z-50"
              style={{ margin: `${SAFE_AREA}%` }}
            />
          )}

          {/* Grid lines */}
          {showGridLines && (
            <div className="absolute inset-0 pointer-events-none z-50">
              <div className="absolute left-1/3 top-0 bottom-0 border-l border-muted-foreground/10" />
              <div className="absolute left-2/3 top-0 bottom-0 border-l border-muted-foreground/10" />
              <div className="absolute top-1/3 left-0 right-0 border-t border-muted-foreground/10" />
              <div className="absolute top-2/3 left-0 right-0 border-t border-muted-foreground/10" />
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
            <div className="absolute inset-0 flex items-center justify-center bg-primary/5 z-40">
              <div className="rounded-2xl bg-white/95 px-6 py-4 shadow-xl backdrop-blur-sm">
                <p className="text-sm font-medium text-foreground">Drop to add photo</p>
              </div>
            </div>
          )}
        </div>

        {/* Page label */}
        <div className="mt-6 text-center">
          <span className="text-xs font-medium text-muted-foreground/60">
            {page.id === 'cover' ? 'Cover' : `Page ${page.id.replace('page-', '')}`}
          </span>
        </div>

        {/* Floating photo controls */}
        {selectedElement && selectedElement.type === 'photo' && (
          <FloatingPhotoControls
            element={selectedElement as PhotoElement}
            canvasRef={canvasRef}
            zoomLevel={zoomLevel}
            onUpdateElement={onUpdateElement}
            onDeleteElement={onDeleteElement}
          />
        )}

        {/* Floating text controls */}
        {selectedElement && selectedElement.type === 'text' && (
          <FloatingTextControls
            element={selectedElement as TextElement}
            onUpdateElement={onUpdateElement}
            onDeleteElement={onDeleteElement}
          />
        )}
      </div>
    </div>
  );
}
