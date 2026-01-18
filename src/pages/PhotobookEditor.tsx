import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Image, Palette, Type, Sticker, Layers, Shapes, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorState } from "@/components/editor/hooks/useEditorState";
import { PremiumCanvas } from "@/components/editor/PremiumCanvas";
import { BottomPageRibbon } from "@/components/editor/BottomPageRibbon";
import { ZoomControls } from "@/components/editor/ZoomControls";
import { CollapsibleLeftSidebar, PhotosPanel, ThemesPanel, TextPanel, StickersPanel, BackgroundsPanel, ElementsPanel } from "@/components/editor/CollapsibleLeftSidebar";
import { LaneyAvatar } from "@/components/editor/LaneyAvatar";
import { CanvasToolbar } from "@/components/editor/CanvasToolbar";
import { AutoSaveIndicator } from "@/components/editor/AutoSaveIndicator";
import { useToast } from "@/hooks/use-toast";
import { LAYOUT_PRESETS } from "@/components/editor/types";

const PhotobookEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  
  // Ref for the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    state,
    currentPage,
    allPhotos,
    bookTitle,
    updateBookTitle,
    isLoading,
    canUndo,
    canRedo,
    undo,
    redo,
    setCurrentPage,
    selectElement,
    setZoom,
    setTool,
    updateElement,
    deleteElement,
    addTextToPage,
    setPageBackground,
    applyLayoutToPage,
    reorderPages,
    addPage,
    duplicatePage,
    deletePage,
    toggleGuides,
    copyElement,
    cutElement,
    pasteElement,
    addPhotosToBook,
    handlePhotoDrop,
    recentColors,
    addRecentColor,
    bookFormat
  } = useEditorState();

  // --- AUTO-FIT ZOOM LOGIC ---
  useEffect(() => {
    if (!bookFormat) return;

    // Calculate optimal initial zoom based on format
    let optimalZoom = 100;
    if (bookFormat.orientation === 'vertical') {
      optimalZoom = 65; // Start smaller for vertical books to fit viewport
    } else if (bookFormat.size === 'medium') {
      optimalZoom = 75;
    } else {
      optimalZoom = 85;
    }
    
    setZoom(optimalZoom);

    // Center the scroll view after a brief delay to allow rendering
    setTimeout(() => {
        if (scrollContainerRef.current) {
            const { scrollWidth, clientWidth, scrollHeight, clientHeight } = scrollContainerRef.current;
            // Scroll to center
            scrollContainerRef.current.scrollTo({
                left: (scrollWidth - clientWidth) / 2,
                top: (scrollHeight - clientHeight) / 2,
                behavior: 'smooth'
            });
        }
    }, 100);
  }, [bookFormat, setZoom]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
      if (ctrlKey && e.key === 'c') { e.preventDefault(); copyElement(); } 
      else if (ctrlKey && e.key === 'v') { e.preventDefault(); pasteElement(); } 
      else if (ctrlKey && e.key === 'x') { e.preventDefault(); cutElement(); } 
      else if (ctrlKey && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); } 
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedElementId) { e.preventDefault(); deleteElement(state.selectedElementId); }
      }
      else if (e.key === 'ArrowRight') { if (state.currentPageIndex < state.pages.length - 1) setCurrentPage(state.currentPageIndex + 1); }
      else if (e.key === 'ArrowLeft') { if (state.currentPageIndex > 0) setCurrentPage(state.currentPageIndex - 1); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [copyElement, pasteElement, cutElement, undo, redo, deleteElement, state.selectedElementId, state.currentPageIndex, state.pages.length]);

  const handleAddPhotos = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      const readers: Promise<string>[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        readers.push(new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        }));
      }
      Promise.all(readers).then(photoDataUrls => {
        addPhotosToBook(photoDataUrls);
        toast({ title: "Photos Added", description: `Added ${photoDataUrls.length} photos` });
      });
    };
    input.click();
  };

  const handleLayoutSelect = (layoutId: string) => applyLayoutToPage(state.currentPageIndex, layoutId);

  const sidebarTabs = [
    { id: 'photos', icon: Image, label: 'Photos', panel: <PhotosPanel photos={allPhotos} onDragStart={() => {}} onAddPhotos={handleAddPhotos} /> },
    { id: 'layouts', icon: LayoutGrid, label: 'Layouts', panel: (
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3">Choose Layout</h3>
          <div className="grid grid-cols-2 gap-2">
            {LAYOUT_PRESETS.map((layout) => (
              <button key={layout.id} onClick={() => handleLayoutSelect(layout.id)} className={`p-2 border rounded-lg hover:bg-primary/10 hover:border-primary transition-all ${currentPage?.layoutId === layout.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="relative aspect-[4/3] w-full bg-muted rounded overflow-hidden mb-1">
                  {layout.slots.map((slot, i) => (
                    <div key={i} className="absolute bg-primary/20 border border-primary/30 rounded-sm" style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.width}%`, height: `${slot.height}%` }} />
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground">{layout.name}</p>
              </button>
            ))}
          </div>
        </div>
      ) 
    },
    { id: 'themes', icon: Palette, label: 'Themes', panel: <ThemesPanel /> },
    { id: 'text', icon: Type, label: 'Text', panel: <TextPanel onAddText={() => { addTextToPage(); setTool('select'); }} /> },
    { id: 'stickers', icon: Sticker, label: 'Stickers', panel: <StickersPanel /> },
    { id: 'backgrounds', icon: Layers, label: 'Backgrounds', panel: <BackgroundsPanel onSelectBackground={(bg) => setPageBackground(state.currentPageIndex, { type: 'solid', value: bg })} /> },
    { id: 'elements', icon: Shapes, label: 'Elements', panel: <ElementsPanel /> }
  ];

  if (isLoading) return <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!currentPage) return <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center"><Button onClick={() => navigate("/ai-creation")}>Start New Book</Button></div>;

  return (
    <div className="relative h-[calc(100vh-4rem)] bg-[#F8F8F8] flex flex-col">
      <AutoSaveIndicator />
      <div className="absolute left-16 top-4 z-10">
        <input type="text" value={bookTitle} onChange={(e) => updateBookTitle(e.target.value)} className="h-8 w-56 rounded-full border border-border bg-white/90 px-3 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      <CollapsibleLeftSidebar tabs={sidebarTabs} defaultOpen={true} />

      {/* FIXED: Added overflow-auto, flex centering, and padding */}
      <div 
        ref={scrollContainerRef}
        className="absolute left-16 right-0 top-0 bottom-32 overflow-auto flex items-center justify-center p-12 bg-[#F0F0F0]"
      >
        <PremiumCanvas
          page={currentPage}
          zoomLevel={state.zoomLevel}
          selectedElementId={state.selectedElementId}
          onSelectElement={selectElement}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onPhotoDrop={handlePhotoDrop} 
          recentColors={recentColors}
          onAddRecentColor={addRecentColor}
          bookFormat={bookFormat}
        />
      </div>

      <LaneyAvatar onSendPrompt={() => {}} isProcessing={isAIProcessing} />

      <CanvasToolbar
        zoomLevel={state.zoomLevel}
        onZoomChange={setZoom}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        showBleedGuides={state.showBleedGuides}
        showSafeArea={state.showSafeArea}
        showGridLines={state.showGridLines}
        onToggleGuide={toggleGuides}
        isAIPromptOpen={false}
        onToggleAIPrompt={() => {}}
      />

      <BottomPageRibbon
        pages={state.pages}
        currentPageIndex={state.currentPageIndex}
        onPageSelect={setCurrentPage}
        onAddPage={addPage}
        onDuplicatePage={duplicatePage}
        onDeletePage={deletePage}
        onReorderPages={reorderPages}
      />

      <ZoomControls
        zoomLevel={state.zoomLevel}
        onZoomIn={() => setZoom(state.zoomLevel + 10)}
        onZoomOut={() => setZoom(state.zoomLevel - 10)}
      />
    </div>
  );
};

export default PhotobookEditor;