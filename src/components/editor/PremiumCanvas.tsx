import React, { useState, useRef, useMemo } from 'react';
import { PhotobookPage, PageElement, PhotoElement, TextElement, BookFormat } from './types';
import { FloatingToolbar } from './FloatingToolbar'; // Make sure this imports the new file above
import { Image, Move } from 'lucide-react';
import { ResizeHandle } from './ResizeHandle';
import { getSnapTargets, calculateSnap, snapValue, SnapGuide } from './SnapMath';

interface PremiumCanvasProps {
  page: PhotobookPage | null;
  zoomLevel: number;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<PageElement>) => void;
  onDeleteElement: (id: string) => void;
  onPhotoDrop?: (src: string, x: number, y: number) => void;
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
  onPhotoDrop,
  recentColors,
  onAddRecentColor,
  bookFormat
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const snapTargetsRef = useRef<{ xTargets: number[], yTargets: number[] }>({ xTargets: [], yTargets: [] });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);
  const [dragState, setDragState] = useState<any>(null);

  const canvasDimensions = useMemo(() => {
    const format = bookFormat || { size: 'medium', orientation: 'horizontal' };
    const isVertical = format.orientation === 'vertical';
    
    if (isVertical) return { width: 600, height: 800 };
    if (format.size === 'medium') return { width: 600, height: 600 };
    return { width: 800, height: 600 };
  }, [bookFormat]);

  if (!page) return <div className="h-full flex items-center justify-center text-gray-400">No Page Selected</div>;

  const handleDuplicate = (id: string) => {
    // Basic duplication logic - this typically lives in the parent hook, but can be triggered here
    // For now, we'll just log or pass a custom event if needed, but the toolbar expects a function
    // In a real Redux setup, you'd dispatch a DUPLICATE_ELEMENT action.
    // For this implementation, we will stub it or you can implement the reducer action if you prefer.
    console.log("Duplicate triggered for", id);
  };

  // ... (Keep existing mouse handlers: Frame, DoubleClick, GlobalClick, Resize, Rotate, Pan, Move) ...
  const handleMouseDownFrame = (e: React.MouseEvent, element: PageElement) => {
    if (editingId === element.id) return;
    e.stopPropagation();
    onSelectElement(element.id);
    if (editingId && editingId !== element.id) setEditingId(null);
    snapTargetsRef.current = getSnapTargets(page.elements, element.id);
    setDragState({ type: 'move', id: element.id, startX: e.clientX, startY: e.clientY, initialX: element.x, initialY: element.y, initialWidth: element.width, initialHeight: element.height, initialRotation: element.rotation, initialImageX: 0, initialImageY: 0 });
  };

  const handleDoubleClick = (e: React.MouseEvent, element: PageElement) => { e.stopPropagation(); if (element.type === 'text') { setEditingId(element.id); onSelectElement(element.id); } };
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
        onUpdateElement(dragState.id, { x: newX, y: newY, width: newW, height: newH });
    } else if (dragState.type === 'rotate') {
        onUpdateElement(dragState.id, { rotation: (dragState.initialRotation + (e.clientX - dragState.startX) * 0.5) % 360 });
    } else if (dragState.type === 'pan') {
        // @ts-ignore
        onUpdateElement(dragState.id, { imageX: dragState.initialImageX + deltaX_Percent, imageY: dragState.initialImageY + deltaY_Percent });
    }
  };

  const handleGlobalMouseUp = () => { setDragState(null); setActiveGuides([]); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };
  const handleDrop = (e: React.DragEvent) => { 
    e.preventDefault();
    if (!onPhotoDrop || !containerRef.current) return;
    const src = e.dataTransfer.getData('text/plain');
    if (src) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        onPhotoDrop(src, x, y);
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
            <div key={prefill.id} className="absolute border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 pointer-events-none rounded-lg" style={{ left: `${prefill.x}%`, top: `${prefill.y}%`, width: `${prefill.width}%`, height: `${prefill.height}%` }}>
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

            return (
              <div
                key={el.id}
                onMouseDown={(e) => handleMouseDownFrame(e, el)}
                onDoubleClick={(e) => handleDoubleClick(e, el)}
                onClick={(e) => e.stopPropagation()}
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
                {/* --- FLOATING TOOLBAR INJECTED HERE --- */}
                {(isSelected || isEditing) && !dragState && (
                  <FloatingToolbar 
                    element={el} 
                    allElements={page.elements} // PASS ALL ELEMENTS
                    onUpdate={onUpdateElement} 
                    onDelete={onDeleteElement}
                    onDuplicate={handleDuplicate} 
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

                <div className={`w-full h-full overflow-hidden ${isPhoto ? 'bg-gray-100' : ''} ${isSelected && !isEditing ? 'ring-2 ring-blue-500' : ''} relative`}> 
                  {isPhoto ? (
                    <>
                        <img 
                            src={photoEl.src} 
                            className="absolute max-w-none origin-center pointer-events-none" 
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: `translate(${photoEl.imageX || 0}%, ${photoEl.imageY || 0}%) scale(${photoEl.imageZoom || 1})`,
                                filter: photoEl.filter ? `brightness(${photoEl.filter.brightness}%) contrast(${photoEl.filter.contrast}%) saturate(${photoEl.filter.saturation}%) sepia(${photoEl.filter.sepia}%)` : 'none'
                            }}
                            alt=""
                        />
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
            );
        })}
      </div>
    </div>
  );
};