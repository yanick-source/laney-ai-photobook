import { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PhotobookPage, PageElement, PhotoElement, TextElement, EditorTool } from './types';
import { FloatingPhotoControls } from './FloatingPhotoControls';
import { FloatingTextControls } from './FloatingTextControls';

interface PremiumCanvasProps {
  page: PhotobookPage;
  zoomLevel: number;
  selectedElementId: string | null;
  activeTool: EditorTool;
  showBleedGuides: boolean;
  showSafeArea: boolean;
  showGridLines: boolean;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<PageElement>) => void;
  onDeleteElement: (id: string) => void;
  onDropPhoto: (src: string) => void;
}

export function PremiumCanvas({
  page,
  zoomLevel,
  selectedElementId,
  activeTool,
  showBleedGuides,
  showSafeArea,
  showGridLines,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDropPhoto,
}: PremiumCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [elementStart, setElementStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });

  // Canvas constraints
  const ASPECT_RATIO = 4 / 3;
  const MIN_WIDTH = 600;
  const MAX_WIDTH = 1400;
  const PADDING = 64; // Padding around canvas
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
    // Canvas click is now handled globally by PhotobookEditor
    // This prevents duplicate event handling
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
  }, []);

  // Calculate responsive canvas dimensions
  useEffect(() => {
    const calculateDimensions = () => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const availableWidth = containerRect.width - PADDING * 2;
      const availableHeight = containerRect.height - PADDING * 2;

      // Calculate dimensions based on available space while maintaining aspect ratio
      let width = availableWidth;
      let height = width / ASPECT_RATIO;

      // If height exceeds available space, constrain by height instead
      if (height > availableHeight) {
        height = availableHeight;
        width = height * ASPECT_RATIO;
      }

      // Apply min/max constraints
      width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width));
      height = width / ASPECT_RATIO;

      setCanvasDimensions({ width: Math.round(width), height: Math.round(height) });
    };

    calculateDimensions();

    // Recalculate on window resize
    const handleResize = () => {
      calculateDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Calculate safe zoom scale to prevent overflow
  const scale = zoomLevel / 100;
  const scaledWidth = canvasDimensions.width * scale;
  const scaledHeight = canvasDimensions.height * scale;

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

          {/* Page Elements */}
          {page.elements.map((element) => {
            const isSelected = element.id === selectedElementId;

            return (
              <div
                key={element.id}
                data-element-id={element.id}
                className={cn(
                  'absolute cursor-move transition-all duration-100'
                )}
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  width: `${element.width}%`,
                  height: `${element.height}%`,
                  transform: `rotate(${element.rotation}deg)`,
                  zIndex: element.zIndex,
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
              >
                {element.type === 'photo' && (
                  (() => {
                    const fillMode = element.fillMode || 'contain';
                    
                    if (fillMode === 'contain') {
                      // Show full photo with letterboxing if needed
                      return (
                        <img
                          src={element.src}
                          alt=""
                          className="h-full w-full object-contain pointer-events-none"
                          draggable={false}
                        />
                      );
                    }
                    
                    // Cover mode: fill the slot, crop as needed
                    const hasCrop = 
                      element.cropX !== 0 || 
                      element.cropY !== 0 || 
                      element.cropWidth !== 100 || 
                      element.cropHeight !== 100;
                    
                    if (!hasCrop) {
                      // Simple cover without custom crop
                      return (
                        <img
                          src={element.src}
                          alt=""
                          className="h-full w-full object-cover pointer-events-none"
                          draggable={false}
                        />
                      );
                    }
                    
                    // Cover with custom crop adjustments
                    const scale = 100 / Math.min(element.cropWidth, element.cropHeight);
                    const originX = element.cropX + element.cropWidth / 2;
                    const originY = element.cropY + element.cropHeight / 2;

                    return (
                      <img
                        src={element.src}
                        alt=""
                        className="h-full w-full object-cover pointer-events-none"
                        style={{
                          transform: `scale(${scale})`,
                          transformOrigin: `${originX}% ${originY}%`,
                        }}
                        draggable={false}
                      />
                    );
                  })()
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

          {/* Drop Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm">
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
