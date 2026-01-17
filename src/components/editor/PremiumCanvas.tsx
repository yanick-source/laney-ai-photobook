import { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PhotobookPage, PageElement, PhotoElement, TextElement, EditorTool, ImagePrefill } from './types';
import { FloatingPhotoControls } from './FloatingPhotoControls';
import { FloatingTextControls } from './FloatingTextControls';
import { BookFormat, getCanvasDimensions } from '@/lib/photobookStorage';
import { ImageIcon, Replace, ArrowLeftRight } from 'lucide-react';

interface PremiumCanvasProps {
  page: PhotobookPage;
  zoomLevel: number;
  selectedElementId: string | null;
  activeTool: EditorTool;
  showBleedGuides: boolean;
  showSafeArea: boolean;
  showGridLines: boolean;
  bookFormat: BookFormat;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (elementId: string, updates: Partial<PageElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onDropPhoto: (src: string) => void;
  onDropPhotoIntoPrefill?: (src: string, prefillId: string) => void;
  onReplacePhotoInPrefill?: (src: string, prefillId: string) => void;
  onSwapPhotosInPrefills?: (sourcePrefillId: string, targetPrefillId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function PremiumCanvas({
  page,
  zoomLevel,
  selectedElementId,
  activeTool,
  showBleedGuides,
  showSafeArea,
  showGridLines,
  bookFormat,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDropPhoto,
  onDropPhotoIntoPrefill,
  onReplacePhotoInPrefill,
  onSwapPhotosInPrefills,
  onDragStart,
  onDragEnd,
}: PremiumCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [elementStart, setElementStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
  
  // Prefill drag state
  const [hoveredPrefill, setHoveredPrefill] = useState<string | null>(null);
  const [dragOverPrefill, setDragOverPrefill] = useState<string | null>(null);
  const [dragOverPhoto, setDragOverPhoto] = useState<string | null>(null);
  const [draggingFromPrefill, setDraggingFromPrefill] = useState<string | null>(null);

  // Canvas constraints
  const PADDING = 64;
  const BLEED_SIZE = 3;
  const SAFE_AREA = 5;

  // Update canvas dimensions when book format changes
  useEffect(() => {
    const dimensions = getCanvasDimensions(bookFormat);
    setCanvasDimensions(dimensions);
  }, [bookFormat]);

  const selectedElement = selectedElementId
    ? page.elements.find((el) => el.id === selectedElementId)
    : null;

  // Get empty prefills (not filled with a photo)
  const emptyPrefills = page.prefills?.filter(p => p.isEmpty) || [];
  
  // Get filled prefills for replacement hints
  const filledPrefills = page.prefills?.filter(p => !p.isEmpty) || [];

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
    setDragOverPrefill(null);
    setDragOverPhoto(null);
    
    const photoSrc = e.dataTransfer.getData('photo-src');
    if (photoSrc) {
      // If not dropped on a specific prefill, use the legacy behavior
      onDropPhoto(photoSrc);
    }
  };

  // Prefill-specific drag handlers
  const handlePrefillDragOver = useCallback((e: React.DragEvent, prefillId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPrefill(prefillId);
    setIsDragOver(false);
  }, []);

  const handlePrefillDragLeave = useCallback((e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverPrefill(null);
  }, []);

  const handleDropIntoPrefill = useCallback((e: React.DragEvent, prefillId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPrefill(null);
    setIsDragOver(false);
    
    const photoSrc = e.dataTransfer.getData('photo-src');
    if (photoSrc && onDropPhotoIntoPrefill) {
      onDropPhotoIntoPrefill(photoSrc, prefillId);
    }
  }, [onDropPhotoIntoPrefill]);

  // Photo element drag handlers (for replacement or swap)
  const handlePhotoDragOver = useCallback((e: React.DragEvent, element: PhotoElement) => {
    if (!element.prefillId) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverPhoto(element.id);
    setIsDragOver(false);
  }, []);

  const handlePhotoDragLeave = useCallback((e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverPhoto(null);
  }, []);

  const handleDropOnPhoto = useCallback((e: React.DragEvent, element: PhotoElement) => {
    if (!element.prefillId) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverPhoto(null);
    setIsDragOver(false);
    
    // Check if this is a swap (dragging from another prefill)
    const sourcePrefillId = e.dataTransfer.getData('source-prefill-id');
    if (sourcePrefillId && sourcePrefillId !== element.prefillId && onSwapPhotosInPrefills) {
      onSwapPhotosInPrefills(sourcePrefillId, element.prefillId);
      setDraggingFromPrefill(null);
      return;
    }
    
    // Otherwise it's a replacement from the sidebar
    const photoSrc = e.dataTransfer.getData('photo-src');
    if (photoSrc && onReplacePhotoInPrefill) {
      onReplacePhotoInPrefill(photoSrc, element.prefillId);
    }
  }, [onReplacePhotoInPrefill, onSwapPhotosInPrefills]);

  // Handle dragging a photo FROM a prefill (to swap)
  const handlePhotoElementDragStart = useCallback((e: React.DragEvent, element: PhotoElement) => {
    if (!element.prefillId) return;
    e.dataTransfer.setData('source-prefill-id', element.prefillId);
    e.dataTransfer.setData('photo-src', element.src);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingFromPrefill(element.prefillId);
    onDragStart?.();
  }, [onDragStart]);

  const handlePhotoElementDragEnd = useCallback(() => {
    setDraggingFromPrefill(null);
    setDragOverPhoto(null);
    onDragEnd?.();
  }, [onDragEnd]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Canvas click is now handled globally by PhotobookEditor
  };

  const handleElementMouseDown = useCallback((
    e: React.MouseEvent,
    element: PageElement,
    handle?: string
  ) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(element.id);

    if (activeTool !== 'select') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragStart({ x: e.clientX, y: e.clientY });
    onDragStart?.();
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
  }, [activeTool, onSelectElement, onDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStart || !elementStart || !selectedElementId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    if (isResizing && resizeHandle) {
      let newWidth = elementStart.width;
      let newHeight = elementStart.height;
      let newX = elementStart.x;
      let newY = elementStart.y;

      if (resizeHandle.includes('e')) newWidth = Math.max(5, elementStart.width + deltaX);
      if (resizeHandle.includes('w')) {
        newWidth = Math.max(5, elementStart.width - deltaX);
        newX = elementStart.x + deltaX;
      }
      if (resizeHandle.includes('s')) newHeight = Math.max(5, elementStart.height + deltaY);
      if (resizeHandle.includes('n')) {
        newHeight = Math.max(5, elementStart.height - deltaY);
        newY = elementStart.y + deltaY;
      }

      onUpdateElement(selectedElementId, { x: newX, y: newY, width: newWidth, height: newHeight });
    } else {
      let newX = elementStart.x + deltaX;
      let newY = elementStart.y + deltaY;

      // Magnetic snapping to edges and center
      const snapThreshold = 2;
      const centerX = 50 - elementStart.width / 2;
      const centerY = 50 - elementStart.height / 2;

      if (Math.abs(newX) < snapThreshold) newX = 0;
      if (Math.abs(newX + elementStart.width - 100) < snapThreshold) newX = 100 - elementStart.width;
      if (Math.abs(newX - centerX) < snapThreshold) newX = centerX;
      if (Math.abs(newY) < snapThreshold) newY = 0;
      if (Math.abs(newY + elementStart.height - 100) < snapThreshold) newY = 100 - elementStart.height;
      if (Math.abs(newY - centerY) < snapThreshold) newY = centerY;

      onUpdateElement(selectedElementId, { x: newX, y: newY });
    }
  }, [dragStart, elementStart, isResizing, resizeHandle, selectedElementId, onUpdateElement]);

  const handleMouseUp = useCallback(() => {
    setDragStart(null);
    setElementStart(null);
    setIsResizing(false);
    setResizeHandle(null);
    onDragEnd?.();
  }, [onDragEnd]);

  // Calculate responsive canvas dimensions
  useEffect(() => {
    const calculateDimensions = () => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const availableWidth = containerRect.width - PADDING * 2;
      const availableHeight = containerRect.height - PADDING * 2;

      const formatDimensions = getCanvasDimensions(bookFormat);
      const aspectRatio = formatDimensions.width / formatDimensions.height;

      let width = availableWidth;
      let height = width / aspectRatio;

      if (height > availableHeight) {
        height = availableHeight;
        width = height * aspectRatio;
      }

      width = Math.max(600, Math.min(1400, width));
      height = width / aspectRatio;

      setCanvasDimensions({ width: Math.round(width), height: Math.round(height) });
    };

    calculateDimensions();

    const handleResize = () => {
      calculateDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [bookFormat]);

  // Add global event listeners for drag and resize
  useEffect(() => {
    if (dragStart) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragStart, handleMouseMove, handleMouseUp]);

  const scale = zoomLevel / 100;

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="relative transition-transform duration-200"
        style={{ 
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Canvas Container with Premium Shadow */}
        <div
          ref={canvasRef}
          className={cn(
            'relative overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300',
            isDragOver && 'ring-4 ring-primary/50 shadow-3xl'
          )}
          style={{
            width: canvasDimensions.width,
            height: canvasDimensions.height,
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleCanvasClick}
        >
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              background: page.background.type === 'solid'
                ? page.background.value
                : page.background.type === 'gradient'
                ? `linear-gradient(${page.background.gradientAngle || 0}deg, ${page.background.value}, ${page.background.secondaryValue})`
                : '#FFFFFF',
            }}
          />

          {/* Bleed Guides */}
          {showBleedGuides && (
            <div
              className="pointer-events-none absolute border-2 border-dashed border-red-400/50"
              style={{
                left: `${BLEED_SIZE}%`,
                top: `${BLEED_SIZE}%`,
                right: `${BLEED_SIZE}%`,
                bottom: `${BLEED_SIZE}%`,
              }}
            />
          )}

          {/* Safe Area */}
          {showSafeArea && (
            <div
              className="pointer-events-none absolute border-2 border-dashed border-blue-400/50"
              style={{
                left: `${SAFE_AREA}%`,
                top: `${SAFE_AREA}%`,
                right: `${SAFE_AREA}%`,
                bottom: `${SAFE_AREA}%`,
              }}
            />
          )}

          {/* Grid Lines */}
          {showGridLines && (
            <div className="pointer-events-none absolute inset-0">
              {[...Array(9)].map((_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute h-full w-px bg-gray-300/30"
                  style={{ left: `${(i + 1) * 10}%` }}
                />
              ))}
              {[...Array(9)].map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute h-px w-full bg-gray-300/30"
                  style={{ top: `${(i + 1) * 10}%` }}
                />
              ))}
            </div>
          )}

          {/* Empty Prefill Slots - Visible placeholder frames */}
          {emptyPrefills.map((prefill) => (
            <div
              key={prefill.id}
              data-prefill-id={prefill.id}
              className={cn(
                'absolute flex items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer',
                hoveredPrefill === prefill.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-gray-300 bg-gray-100/50',
                dragOverPrefill === prefill.id && 'border-primary border-solid bg-primary/20 scale-[1.02] shadow-lg'
              )}
              style={{
                left: `${prefill.x}%`,
                top: `${prefill.y}%`,
                width: `${prefill.width}%`,
                height: `${prefill.height}%`,
                zIndex: 5
              }}
              onMouseEnter={() => setHoveredPrefill(prefill.id)}
              onMouseLeave={() => setHoveredPrefill(null)}
              onDragOver={(e) => handlePrefillDragOver(e, prefill.id)}
              onDragLeave={handlePrefillDragLeave}
              onDrop={(e) => handleDropIntoPrefill(e, prefill.id)}
            >
              <div className="flex flex-col items-center justify-center text-center p-2">
                <ImageIcon className={cn(
                  'h-8 w-8 transition-colors',
                  dragOverPrefill === prefill.id ? 'text-primary' : 'text-gray-400'
                )} />
                <span className={cn(
                  'text-xs mt-1 transition-colors',
                  dragOverPrefill === prefill.id ? 'text-primary font-medium' : 'text-gray-400'
                )}>
                  {dragOverPrefill === prefill.id ? 'Drop here' : 'Drag photo'}
                </span>
              </div>
            </div>
          ))}

          {/* Page Elements */}
          {page.elements.map((element) => {
            const isSelected = element.id === selectedElementId;
            const isPhotoElement = element.type === 'photo';
            const photoElement = isPhotoElement ? element as PhotoElement : null;
            const isPhotoBeingReplaced = isPhotoElement && dragOverPhoto === element.id;
            const isSwapTarget = isPhotoBeingReplaced && draggingFromPrefill && photoElement?.prefillId !== draggingFromPrefill;
            const isDraggingThis = isPhotoElement && photoElement?.prefillId === draggingFromPrefill;

            return (
              <div
                key={element.id}
                data-element-id={element.id}
                className={cn(
                  'absolute cursor-move transition-all duration-100',
                  isDraggingThis && 'opacity-50 scale-95'
                )}
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  width: `${element.width}%`,
                  height: `${element.height}%`,
                  transform: `rotate(${element.rotation}deg)`,
                  zIndex: element.zIndex + 10,
                }}
                draggable={isPhotoElement && !!photoElement?.prefillId}
                onDragStart={(e) => isPhotoElement && photoElement?.prefillId && handlePhotoElementDragStart(e, photoElement)}
                onDragEnd={() => isPhotoElement && handlePhotoElementDragEnd()}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
                onDragOver={(e) => isPhotoElement && handlePhotoDragOver(e, photoElement!)}
                onDragLeave={(e) => isPhotoElement && handlePhotoDragLeave(e)}
                onDrop={(e) => isPhotoElement && handleDropOnPhoto(e, photoElement!)}
              >
                {isPhotoElement && photoElement && (
                  <div className={cn(
                    "relative h-full w-full overflow-hidden rounded-sm transition-all",
                    isSwapTarget && "ring-2 ring-primary ring-offset-2"
                  )}>
                    <img
                      src={photoElement.src}
                      alt=""
                      className="pointer-events-none"
                      draggable={false}
                      style={{
                        width: `${(photoElement.cropZoom || 1) * 100}%`,
                        height: `${(photoElement.cropZoom || 1) * 100}%`,
                        objectFit: 'cover',
                        objectPosition: `${photoElement.cropX || 50}% ${photoElement.cropY || 50}%`,
                        transform: `translate(
                          ${-((photoElement.cropX || 50) - 50) * ((photoElement.cropZoom || 1) - 1) * 0.02}%, 
                          ${-((photoElement.cropY || 50) - 50) * ((photoElement.cropZoom || 1) - 1) * 0.02}%
                        )`
                      }}
                    />
                    {/* Swap/Replace overlay when dragging a photo over */}
                    {isPhotoBeingReplaced && (
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center backdrop-blur-[2px]",
                        isSwapTarget ? "bg-blue-500/40" : "bg-primary/30"
                      )}>
                        <div className="flex flex-col items-center text-white">
                          {isSwapTarget ? (
                            <>
                              <ArrowLeftRight className="h-8 w-8" />
                              <span className="text-sm font-medium mt-1">Swap</span>
                            </>
                          ) : (
                            <>
                              <Replace className="h-8 w-8" />
                              <span className="text-sm font-medium mt-1">Replace</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {element.type === 'text' && (
                  <div
                    className="flex h-full w-full items-center justify-center p-2 outline-none"
                    style={{
                      fontFamily: element.fontFamily,
                      fontSize: `${element.fontSize}px`,
                      fontWeight: element.fontWeight,
                      fontStyle: element.fontStyle,
                      color: element.color,
                      textAlign: element.textAlign,
                      lineHeight: element.lineHeight,
                      opacity: element.opacity,
                    }}
                    contentEditable={isSelected}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      onUpdateElement(element.id, { content: e.currentTarget.textContent || '' });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                    onClick={(e) => {
                      if (isSelected) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    {element.content}
                  </div>
                )}

                {/* Selection Outline */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-sm border-2 border-primary shadow-lg pointer-events-none" style={{ zIndex: 1000 }}>
                    {/* Resize Handles */}
                    {[
                      'nw', 'n', 'ne',
                      'w', 'e',
                      'sw', 's', 'se'
                    ].map((position) => (
                      <div
                        key={position}
                        className={cn(
                          'absolute h-3 w-3 rounded-full border-2 border-primary bg-white shadow-md pointer-events-auto',
                          position.includes('n') && '-top-1.5',
                          position.includes('s') && '-bottom-1.5',
                          position.includes('w') && '-left-1.5',
                          position.includes('e') && '-right-1.5',
                          position === 'n' && 'left-1/2 -translate-x-1/2 cursor-n-resize',
                          position === 's' && 'left-1/2 -translate-x-1/2 cursor-s-resize',
                          position === 'w' && 'top-1/2 -translate-y-1/2 cursor-w-resize',
                          position === 'e' && 'top-1/2 -translate-y-1/2 cursor-e-resize',
                          position === 'nw' && 'cursor-nw-resize',
                          position === 'ne' && 'cursor-ne-resize',
                          position === 'sw' && 'cursor-sw-resize',
                          position === 'se' && 'cursor-se-resize'
                        )}
                        onMouseDown={(e) => handleElementMouseDown(e, element, position)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Drop Overlay - Only show when not over a prefill */}
          {isDragOver && !dragOverPrefill && !dragOverPhoto && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm pointer-events-none">
              <div className="rounded-2xl bg-white/90 px-6 py-4 text-center shadow-xl">
                <p className="text-lg font-semibold text-primary">Drop photo here</p>
              </div>
            </div>
          )}
        </div>

        {/* Floating Controls */}
        {selectedElement && selectedElement.type === 'photo' && (
          <FloatingPhotoControls
            element={selectedElement as PhotoElement}
            canvasRef={canvasRef}
            zoomLevel={zoomLevel}
            onUpdateElement={onUpdateElement}
            onDeleteElement={onDeleteElement}
          />
        )}

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