import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { PhotobookPage, PageElement, PhotoElement, TextElement, BookFormat } from './types';
import { FloatingToolbar } from './FloatingToolbar';
import { Image, Move, Copy, Trash2, Layers, Grid3X3, RefreshCw } from 'lucide-react';
import { ResizeHandle } from './ResizeHandle';
import { getSnapTargets, calculateSnap, snapValue, SnapGuide } from './SnapMath';
import { useKeyboardModifiers, constrainAspectRatio, snapRotation } from './hooks/useKeyboardModifiers';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface PremiumCanvasProps {
  page: PhotobookPage | null;
  zoomLevel: number;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<PageElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement?: (id: string) => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onPhotoDrop?: (src: string, x: number, y: number) => void;
  onStickerDrop?: (src: string, x: number, y: number) => void;
  recentColors: string[];
  onAddRecentColor: (color: string) => void;
  bookFormat?: BookFormat;
}

export const PremiumCanvas: React.FC<PremiumCanvasProps> = ({
  page,
  zoomLevel,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onCopy,
  onPaste,
  onPhotoDrop,
  onStickerDrop,
  recentColors,
  onAddRecentColor,
  bookFormat
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const snapTargetsRef = useRef<{ xTargets: number[], yTargets: number[] }>({ xTargets: [], yTargets: [] });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);
  const [dragState, setDragState] = useState<any>(null);
  const [altDragClone, setAltDragClone] = useState<PageElement | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const [hoverPhotoId, setHoverPhotoId] = useState<string | null>(null);
  
  // Keyboard modifier tracking for Shift+Resize, Alt+Drag, etc.
  const modifiers = useKeyboardModifiers();

  const canvasDimensions = useMemo(() => {
    const format = bookFormat || { size: 'medium', orientation: 'horizontal' };
    const isVertical = format.orientation === 'vertical';
    if (isVertical) return { width: 600, height: 800 };
    if (format.size === 'medium') return { width: 600, height: 600 };
    return { width: 800, height: 600 };
  }, [bookFormat]);

  // RESTORED: Keyboard Shortcuts (Ctrl+C, Ctrl+V, Ctrl+D, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingId) return; // Don't interfere when typing text

      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault();
        onCopy?.();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault();
        onPaste?.();
      }
      // NEW: Ctrl+D to duplicate selected element
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        if (selectedElementId) {
          e.preventDefault();
          onDuplicateElement?.(selectedElementId);
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          onDeleteElement(selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, editingId, onCopy, onPaste, onDeleteElement, onDuplicateElement]);

  // Handle file selection for photo replacement (must be before early return)
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && replaceTargetId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newSrc = event.target?.result as string;
        if (newSrc) {
          // Replace the photo src while preserving position, size, and other properties
          onUpdateElement(replaceTargetId, { 
            src: newSrc,
            // Reset crop/zoom to defaults for new image
            imageX: 0,
            imageY: 0,
            imageZoom: 1,
            cropX: 50,
            cropY: 50,
            cropZoom: 1
          } as Partial<PhotoElement>);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
    setReplaceTargetId(null);
  }, [replaceTargetId, onUpdateElement]);
  
  // Quick replace button click handler (must be before early return)
  const handleQuickReplace = useCallback((elementId: string) => {
    setReplaceTargetId(elementId);
    fileInputRef.current?.click();
  }, []);

  if (!page) return <div className="h-full flex items-center justify-center text-muted-foreground">No Page Selected</div>;

  const handleLayering = (element: PageElement, action: 'front' | 'back' | 'forward' | 'backward') => {
    const currentZ = element.zIndex || 0;
    const allZ = page.elements.map(e => e.zIndex || 0);
    const maxZ = Math.max(...allZ, 0);
    const minZ = Math.min(...allZ, 0);

    let newZ = currentZ;
    switch (action) {
      case 'front': newZ = maxZ + 1; break;
      case 'back': newZ = minZ - 1; break;
      case 'forward': newZ = currentZ + 1; break;
      case 'backward': newZ = currentZ - 1; break;
    }
    onUpdateElement(element.id, { zIndex: newZ });
  };

  const handleMouseDownFrame = (e: React.MouseEvent, element: PageElement) => {
    if (editingId === element.id) return;
    e.stopPropagation();
    onSelectElement(element.id);
    if (editingId && editingId !== element.id) setEditingId(null);
    snapTargetsRef.current = getSnapTargets(page.elements, element.id);
    setDragState({ type: 'move', id: element.id, startX: e.clientX, startY: e.clientY, initialX: element.x, initialY: element.y, initialWidth: element.width, initialHeight: element.height, initialRotation: element.rotation, initialImageX: 0, initialImageY: 0 });
  };

  // Double-click: Text edit mode OR Photo replace via file picker
  const handleDoubleClick = (e: React.MouseEvent, element: PageElement) => { 
    e.stopPropagation(); 
    if (element.type === 'text') { 
      setEditingId(element.id); 
      onSelectElement(element.id); 
    } else if (element.type === 'photo') {
      // PRIORITY #3: Double-click on photo opens file picker to replace
      setReplaceTargetId(element.id);
      fileInputRef.current?.click();
    }
  };
  
  const handleGlobalClick = () => { onSelectElement(null); setEditingId(null); };
  
  const handleMouseDownResize = (e: React.MouseEvent, element: PageElement, handle: string) => {
    e.stopPropagation();
    snapTargetsRef.current = getSnapTargets(page.elements, element.id);
    setDragState({ type: 'resize', id: element.id, startX: e.clientX, startY: e.clientY, initialX: element.x, initialY: element.y, initialWidth: element.width, initialHeight: element.height, initialRotation: element.rotation, initialImageX: 0, initialImageY: 0, handle });
  };
  
  const handleMouseDownRotate = (e: React.MouseEvent, element: PageElement) => { e.stopPropagation(); setDragState({ type: 'rotate', id: element.id, startX: e.clientX, startY: e.clientY, initialX: 0, initialY: 0, initialWidth: 0, initialHeight: 0, initialRotation: element.rotation, initialImageX: 0, initialImageY: 0 }); };
  const handleMouseDownPan = (e: React.MouseEvent, element: PhotoElement) => { e.stopPropagation(); setDragState({ type: 'pan', id: element.id, startX: e.clientX, startY: e.clientY, initialX: 0, initialY: 0, initialWidth: 0, initialHeight: 0, initialRotation: 0, initialImageX: element.imageX || 0, initialImageY: element.imageY || 0 }); };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX_Percent = ((e.clientX - dragState.startX) / rect.width) * 100;
    const deltaY_Percent = ((e.clientY - dragState.startY) / rect.height) * 100;

    if (dragState.type === 'move') {
        const snapResult = calculateSnap(dragState.initialX + deltaX_Percent, dragState.initialY + deltaY_Percent, dragState.initialWidth, dragState.initialHeight, snapTargetsRef.current);
        setActiveGuides(snapResult.guides);
        onUpdateElement(dragState.id, { x: snapResult.x, y: snapResult.y });
        
        // Alt+Drag: Show visual feedback that we'll duplicate on drop
        if (modifiers.isAltPressed && !altDragClone) {
          const element = page?.elements.find(el => el.id === dragState.id);
          if (element) setAltDragClone(element);
        } else if (!modifiers.isAltPressed && altDragClone) {
          setAltDragClone(null);
        }
    } else if (dragState.type === 'resize') {
        const { initialX, initialY, initialWidth, initialHeight, handle } = dragState;
        let newX = initialX; let newY = initialY; let newW = initialWidth; let newH = initialHeight;
        const currentGuides: SnapGuide[] = [];

        if (handle?.includes('right')) {
            let rawRight = initialX + initialWidth + deltaX_Percent;
            const { snapped, guide } = snapValue(rawRight, snapTargetsRef.current.xTargets);
            if (guide !== null) currentGuides.push({ type: 'vertical', position: guide });
            newW = snapped - initialX;
        } else if (handle?.includes('left')) {
            let rawLeft = initialX + deltaX_Percent;
            const { snapped, guide } = snapValue(rawLeft, snapTargetsRef.current.xTargets);
            if (guide !== null) currentGuides.push({ type: 'vertical', position: guide });
            const oldRight = initialX + initialWidth;
            newX = snapped;
            newW = oldRight - snapped;
        }

        if (handle?.includes('bottom')) {
            let rawBottom = initialY + initialHeight + deltaY_Percent;
            const { snapped, guide } = snapValue(rawBottom, snapTargetsRef.current.yTargets);
            if (guide !== null) currentGuides.push({ type: 'horizontal', position: guide });
            newH = snapped - initialY;
        } else if (handle?.includes('top')) {
            let rawTop = initialY + deltaY_Percent;
            const { snapped, guide } = snapValue(rawTop, snapTargetsRef.current.yTargets);
            if (guide !== null) currentGuides.push({ type: 'horizontal', position: guide });
            const oldBottom = initialY + initialHeight;
            newY = snapped;
            newH = oldBottom - snapped;
        }
        
        setActiveGuides(currentGuides);
        if (newW < 1) newW = 1; if (newH < 1) newH = 1;
        
        // SHIFT+RESIZE: Maintain aspect ratio
        if (modifiers.isShiftPressed) {
          const constrained = constrainAspectRatio(initialWidth, initialHeight, newW, newH, handle);
          newW = constrained.width;
          newH = constrained.height;
        }
        
        onUpdateElement(dragState.id, { x: newX, y: newY, width: newW, height: newH });
    } else if (dragState.type === 'rotate') {
        let newRotation = (dragState.initialRotation + (e.clientX - dragState.startX) * 0.5) % 360;
        
        // SHIFT+ROTATE: Snap to 15-degree increments
        if (modifiers.isShiftPressed) {
          newRotation = snapRotation(newRotation);
        }
        
        onUpdateElement(dragState.id, { rotation: newRotation });
    } else if (dragState.type === 'pan') {
        // Pan adjusts object-position to shift visible crop area
        // Constrain to ±50% so the image edges stay within the frame
        // object-position: 0% = left/top edge, 100% = right/bottom edge
        // We allow ±50 from center (50%), so range is 0-100%
        const maxPan = 50;
        
        const newX = Math.max(-maxPan, Math.min(maxPan, dragState.initialImageX + deltaX_Percent));
        const newY = Math.max(-maxPan, Math.min(maxPan, dragState.initialImageY + deltaY_Percent));
        
        onUpdateElement(dragState.id, { imageX: newX, imageY: newY } as Partial<PhotoElement>);
    }
  };

  const handleGlobalMouseUp = () => { 
    // ALT+DRAG: Duplicate element on drop
    if (dragState?.type === 'move' && modifiers.isAltPressed && altDragClone) {
      onDuplicateElement?.(dragState.id);
    }
    setDragState(null); 
    setActiveGuides([]); 
    setAltDragClone(null);
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };
  
  const handleDrop = (e: React.DragEvent) => { 
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if it's a sticker (from sidebar) or a photo
    const isSticker = e.dataTransfer.getData('application/laney-sticker') === 'true';
    const src = e.dataTransfer.getData('text/plain');

    if (src) {
        if (isSticker && onStickerDrop) {
            onStickerDrop(src, x, y);
        } else if (onPhotoDrop) {
            onPhotoDrop(src, x, y);
        }
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center min-w-fit min-h-fit"
      onClick={handleGlobalClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      onMouseUp={handleGlobalMouseUp}
      onMouseLeave={handleGlobalMouseUp}
    >
      {/* Hidden file input for photo replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {/* Modifier Key Indicator */}
      {(modifiers.isShiftPressed || modifiers.isAltPressed) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex gap-2 animate-in fade-in zoom-in-95 duration-150">
          {modifiers.isShiftPressed && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/95 border border-border rounded-full shadow-lg backdrop-blur-sm">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono font-medium">⇧</kbd>
              <span className="text-xs font-medium text-foreground">Constrain</span>
            </div>
          )}
          {modifiers.isAltPressed && dragState?.type === 'move' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/95 border border-primary rounded-full shadow-lg backdrop-blur-sm">
              <kbd className="px-1.5 py-0.5 bg-primary-foreground/20 rounded text-xs font-mono font-medium text-primary-foreground">⌥</kbd>
              <span className="text-xs font-medium text-primary-foreground">Duplicate</span>
            </div>
          )}
        </div>
      )}
      <div 
        ref={containerRef}
        className="relative bg-white shadow-2xl overflow-visible transition-all duration-500 ease-in-out origin-center rounded-sm ring-1 ring-gray-900/5"
        style={{ 
          width: `${canvasDimensions.width}px`, 
          height: `${canvasDimensions.height}px`, 
          transform: `scale(${zoomLevel / 100})` 
        }}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="absolute inset-0 overflow-hidden" style={{ background: page.background?.value || '#fff' }} />

        {activeGuides.map((guide, i) => (
            <div key={i} className="absolute bg-pink-500 z-[100] pointer-events-none" style={{ backgroundColor: '#ec4899', left: guide.type === 'vertical' ? `${guide.position}%` : 0, top: guide.type === 'horizontal' ? `${guide.position}%` : 0, width: guide.type === 'vertical' ? '1px' : '100%', height: guide.type === 'horizontal' ? '1px' : '100%', boxShadow: '0 0 2px rgba(236, 72, 153, 0.8)' }} />
        ))}

        {page.prefills?.map(prefill => (
  prefill.isEmpty && (
    <div 
      key={prefill.id} 
      className="absolute border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 rounded-lg" 
      style={{ left: `${prefill.x}%`, top: `${prefill.y}%`, width: `${prefill.width}%`, height: `${prefill.height}%` }}
      onClick={() => onSelectElement?.(prefill.id)}
    >
      <Image className="w-8 h-8 opacity-50 mb-2" />
    </div>
  )
))}

        {page.elements.map(el => {
            const isSelected = selectedElementId === el.id;
            const isEditing = editingId === el.id;
            const isPhoto = el.type === 'photo';
            const photoEl = el as PhotoElement;
            const textEl = el as TextElement;
            const isHovered = hoverPhotoId === el.id;
            
            // Check if element is a sticker to handle transparency/fit
            const isSticker = (el as any).isSticker || (el as any).subtype === 'sticker';

            return (
              <ContextMenu key={el.id}>
                <ContextMenuTrigger asChild>
                  <div
                    onMouseDown={(e) => handleMouseDownFrame(e, el)}
                    onDoubleClick={(e) => handleDoubleClick(e, el)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={() => isPhoto && !isSticker && setHoverPhotoId(el.id)}
                    onMouseLeave={() => setHoverPhotoId(null)}
                    className={`absolute group ${isSelected ? 'z-50' : 'z-10'}`}
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      width: `${el.width}%`,
                      height: `${el.height}%`,
                      transform: `rotate(${el.rotation}deg)`,
                      opacity: el.opacity ?? 1,
                      zIndex: el.zIndex ?? 10,
                      cursor: isEditing ? 'text' : (isSelected ? 'move' : 'pointer')
                    }}
                  >
                    {(isSelected || isEditing) && !dragState && (
                      <FloatingToolbar 
                        element={el} 
                        allElements={page.elements}
                        onUpdate={onUpdateElement} 
                        onDelete={onDeleteElement}
                        onDuplicate={(id) => onDuplicateElement?.(id)} 
                        recentColors={recentColors}
                        onAddRecentColor={onAddRecentColor}
                      />
                    )}

                    {isSelected && !isEditing && (
                        <>
                            <ResizeHandle position="top-left" cursor="nw-resize" onMouseDown={(e) => handleMouseDownResize(e, el, 'top-left')} />
                            <ResizeHandle position="top-right" cursor="ne-resize" onMouseDown={(e) => handleMouseDownResize(e, el, 'top-right')} />
                            <ResizeHandle position="bottom-left" cursor="sw-resize" onMouseDown={(e) => handleMouseDownResize(e, el, 'bottom-left')} />
                            <ResizeHandle position="bottom-right" cursor="se-resize" onMouseDown={(e) => handleMouseDownResize(e, el, 'bottom-right')} />
                            <ResizeHandle position="rotate" cursor="grab" onMouseDown={(e) => handleMouseDownRotate(e, el)} />
                        </>
                    )}

                    {/* Transparent background for all elements */}
                    <div className={`w-full h-full overflow-hidden ${isSelected && !isEditing ? 'ring-2 ring-blue-500' : ''} relative`}> 
                      {isPhoto ? (
                        <>
                            {/* 
                              Simple photo rendering: object-fit cover fills the frame.
                              Pan adjusts object-position to shift the crop area.
                              No zoom transform - keeps image crisp and predictable.
                            */}
                            <img 
                                src={photoEl.src} 
                                className="absolute w-full h-full pointer-events-none" 
                                style={{
                                    objectFit: isSticker ? 'contain' : 'cover',
                                    // Pan offset via object-position: 50% 50% is centered
                                    // imageX/Y values shift the visible crop area
                                    objectPosition: `${50 + (photoEl.imageX || 0)}% ${50 + (photoEl.imageY || 0)}%`,
                                    filter: photoEl.filter ? `brightness(${photoEl.filter.brightness}%) contrast(${photoEl.filter.contrast}%) saturate(${photoEl.filter.saturation}%) sepia(${photoEl.filter.sepia}%)` : 'none'
                                }}
                                alt=""
                            />
                            {/* Hover overlay with Replace button - appears on hover, not when selected */}
                            {isHovered && !isSelected && !isSticker && (
                                <div className="absolute inset-0 flex items-center justify-center z-20 animate-in fade-in duration-150">
                                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleQuickReplace(el.id); }}
                                        className="relative flex items-center gap-1.5 px-3 py-1.5 bg-background/95 hover:bg-background text-foreground rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-105 border border-border"
                                        title="Double-click to replace"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">Replace</span>
                                    </button>
                                </div>
                            )}
                            {/* Selected state: show pan control */}
                            {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                    <div className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full cursor-move pointer-events-auto transition-transform hover:scale-110 backdrop-blur-sm shadow-md"
                                        onMouseDown={(e) => handleMouseDownPan(e, photoEl)}>
                                        <Move className="w-5 h-5" />
                                    </div>
                                </div>
                            )}
                        </>
                      ) : (
                        isEditing ? (
                          <div 
                            className="w-full h-full p-2 outline-none cursor-text bg-white/20"
                            contentEditable
                            suppressContentEditableWarning
                            autoFocus
                            ref={(node) => node && node.focus()}
                            onBlur={(e) => onUpdateElement(el.id, { content: e.currentTarget.innerText })}
                            onMouseDown={(e) => e.stopPropagation()} 
                            style={{ 
                              fontFamily: textEl.fontFamily,
                              fontSize: textEl.fontSize,
                              fontWeight: textEl.fontWeight,
                              fontStyle: textEl.fontStyle,
                              textDecoration: textEl.textDecoration,
                              textAlign: textEl.textAlign,
                              color: textEl.color,
                              letterSpacing: `${textEl.letterSpacing || 0}em`,
                              lineHeight: textEl.lineHeight || 1.2,
                              textTransform: textEl.textTransform as any || 'none'
                            }}
                          >
                            {textEl.content}
                          </div>
                        ) : (
                          <div 
                            className="w-full h-full p-2 select-none"
                            style={{ 
                              fontFamily: textEl.fontFamily,
                              fontSize: textEl.fontSize,
                              fontWeight: textEl.fontWeight,
                              fontStyle: textEl.fontStyle,
                              textDecoration: textEl.textDecoration,
                              textAlign: textEl.textAlign,
                              color: textEl.color,
                              letterSpacing: `${textEl.letterSpacing || 0}em`,
                              lineHeight: textEl.lineHeight || 1.2,
                              textTransform: textEl.textTransform as any || 'none'
                            }}
                          >
                            {textEl.content}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </ContextMenuTrigger>
                
                {/* CONTEXT MENU ITEMS */}
                <ContextMenuContent className="w-48">
                  <ContextMenuItem onClick={() => { onSelectElement(el.id); onCopy?.(); }}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onDuplicateElement?.(el.id)}>
                    <Grid3X3 className="mr-2 h-4 w-4" /> Duplicate
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuSub>
                    <ContextMenuSubTrigger>
                        <Layers className="mr-2 h-4 w-4" /> Layering
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-40">
                        <ContextMenuItem onClick={() => handleLayering(el, 'front')}>Bring to Front</ContextMenuItem>
                        <ContextMenuItem onClick={() => handleLayering(el, 'forward')}>Bring Forward</ContextMenuItem>
                        <ContextMenuItem onClick={() => handleLayering(el, 'backward')}>Send Backward</ContextMenuItem>
                        <ContextMenuItem onClick={() => handleLayering(el, 'back')}>Send to Back</ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => onDeleteElement(el.id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
        })}
      </div>
    </div>
  );
};