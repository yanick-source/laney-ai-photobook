import { useState, useCallback, useEffect } from "react";
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

  // 1. CALL THE MAIN HOOK
  const {
    state,
    currentPage,
    allPhotos,
    bookTitle,
    updateBookTitle, // Now available
    bookFormat,
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
    setPageBackground, // Now available
    applyLayoutToPage,
    reorderPages,
    addPage,
    duplicatePage,
    deletePage,
    toggleGuides,
    copyElement,
    cutElement,
    pasteElement,
    addPhotosToBook, // Now available
    handleDragStart,
    handleDragEnd,
    handlePhotoDrop, 
    analysis,
    replacePage
  } = useEditorState();

  const handleClose = () => navigate("/");

  // 2. DEFINE EFFECTS IMMEDIATELY (Fixes Hook Order Errors)
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
        if (state.selectedElementId) { 
          e.preventDefault(); 
          deleteElement(state.selectedElementId); 
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [copyElement, pasteElement, cutElement, undo, redo, deleteElement, state.selectedElementId]);

  // 3. HANDLERS
  const handlePhotoDragStart = (src: string) => { };

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

  const handleAddText = (type: 'heading' | 'subheading' | 'body') => {
    addTextToPage(); 
    setTool('select');
  };

  const handleLayoutSelect = (layoutId: string) => {
    applyLayoutToPage(state.currentPageIndex, layoutId);
  };

  // 4. SIDEBAR CONFIG
  const sidebarTabs = [
    {
      id: 'photos',
      icon: Image,
      label: 'Photos',
      panel: <PhotosPanel photos={allPhotos} onDragStart={handlePhotoDragStart} onAddPhotos={handleAddPhotos} />
    },
    {
      id: 'layouts',
      icon: LayoutGrid,
      label: 'Layouts',
      panel: (
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3">Choose Layout</h3>
          <div className="grid grid-cols-2 gap-2">
            {LAYOUT_PRESETS.map((layout) => (
              <button
                key={layout.id}
                onClick={() => handleLayoutSelect(layout.id)}
                className={`p-2 border rounded-lg hover:bg-primary/10 hover:border-primary transition-all ${
                  currentPage?.layoutId === layout.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="relative aspect-[4/3] w-full bg-muted rounded overflow-hidden mb-1">
                  {layout.slots.map((slot, i) => (
                    <div
                      key={i}
                      className="absolute bg-primary/20 border border-primary/30 rounded-sm"
                      style={{
                        left: `${slot.x}%`,
                        top: `${slot.y}%`,
                        width: `${slot.width}%`,
                        height: `${slot.height}%`
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground">{layout.name}</p>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'themes',
      icon: Palette,
      label: 'Themes',
      panel: <ThemesPanel />
    },
    {
      id: 'text',
      icon: Type,
      label: 'Text',
      panel: <TextPanel onAddText={handleAddText} />
    },
    {
      id: 'stickers',
      icon: Sticker,
      label: 'Stickers',
      panel: <StickersPanel />
    },
    {
      id: 'backgrounds',
      icon: Layers,
      label: 'Backgrounds',
      panel: <BackgroundsPanel onSelectBackground={(bg) => setPageBackground(state.currentPageIndex, { type: 'solid', value: bg })} />
    },
    {
      id: 'elements',
      icon: Shapes,
      label: 'Elements',
      panel: <ElementsPanel />
    }
  ];

  // 5. LOADING / ERROR STATES (Must happen AFTER hooks)
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!currentPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Button onClick={() => navigate("/ai-creation")}>Start New Book</Button>
      </div>
    );
  }

  // 6. MAIN RENDER
  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden bg-[#F8F8F8]">
      <AutoSaveIndicator />
      
      <div className="absolute left-16 top-4 z-10">
        <input
          type="text"
          value={bookTitle}
          onChange={(e) => updateBookTitle(e.target.value)}
          className="h-8 w-56 rounded-full border border-border bg-white/90 px-3 text-sm font-medium shadow-sm outline-none ring-0 focus:border-primary focus:ring-2"
          placeholder="Untitled Photobook"
        />
      </div>

      <CollapsibleLeftSidebar tabs={sidebarTabs} defaultOpen={false} />

      <div className="absolute left-16 right-0 top-0 bottom-32">
        <PremiumCanvas
          page={currentPage}
          zoomLevel={state.zoomLevel}
          selectedElementId={state.selectedElementId}
          onSelectElement={selectElement}
          onUpdateElement={updateElement}
          onPhotoDrop={handlePhotoDrop} 
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