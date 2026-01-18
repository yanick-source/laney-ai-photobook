import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Image, Palette, Type, Sticker, Layers, Shapes, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

import { supabase } from "@/integrations/supabase/client";
import { useEditorState } from "@/components/editor/hooks/useEditorState";
import { PremiumCanvas } from "@/components/editor/PremiumCanvas";
import { BottomPageRibbon } from "@/components/editor/BottomPageRibbon";
import { ZoomControls } from "@/components/editor/ZoomControls";
import { CollapsibleLeftSidebar, PhotosPanel, ThemesPanel, TextPanel, StickersPanel, BackgroundsPanel, ElementsPanel } from "@/components/editor/CollapsibleLeftSidebar";
import { LaneyAvatar } from "@/components/editor/LaneyAvatar";
import { CanvasToolbar } from "@/components/editor/CanvasToolbar";
import { EditorUploadModal } from "@/components/editor/EditorUploadModal";
import { AutoSaveIndicator } from "@/components/editor/AutoSaveIndicator";
import { useToast } from "@/hooks/use-toast";
import type { PhotobookPage } from "@/components/editor/types";
import { LAYOUT_PRESETS } from "@/components/editor/types";

const PhotobookEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [photoDragSrc, setPhotoDragSrc] = useState<string>("");
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const {
    state,
    currentPage,
    allPhotos,
    bookTitle,
    setBookTitle,
    updateBookTitle,
    bookFormat,
    updateBookFormat,
    isLoading,
    canUndo,
    canRedo,
    undo,
    redo,
    setCurrentPage,
    selectElement,
    setZoom,
    setTool,
    setViewMode,
    updateElement,
    deleteElement,
    addPhotoToPage,
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
    handleDragStart,
    handleDragEnd,
    dropPhotoIntoPrefill,
    replacePhotoInPrefill,
    swapPhotosInPrefills,
    removePhotoFromPrefill,
    analysis,
    replacePage
  } = useEditorState();

  const handleClose = () => navigate("/");

  const handleDropPhoto = (src: string) => {
    addPhotoToPage(src, state.currentPageIndex);
  };

  const handlePhotoDragStart = (src: string) => {
    setPhotoDragSrc(src);
  };

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
        
        toast({
          title: "Photos Added",
          description: `Added ${photoDataUrls.length} photos to your book`,
        });
      });
    };
    
    input.click();
  };

  const handleAddText = (type: 'heading' | 'subheading' | 'body') => {
    addTextToPage(state.currentPageIndex);
    setTool('select');
  };

  const handleAIPrompt = async (prompt: string) => {
    if (!currentPage || isAIProcessing) return;

    setIsAIProcessing(true);
    
    toast({
      title: "Laney is thinking...",
      description: "Analyzing your page and making improvements...",
    });

    try {
      const { data, error } = await supabase.functions.invoke('edit-page', {
        body: {
          prompt,
          page: currentPage,
          allPhotos,
          analysis
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          variant: "destructive",
          title: "AI Error",
          description: data.error,
        });
        return;
      }

      if (data?.page) {
        // Ensure prefills are preserved or regenerated
        const updatedPage = {
          ...data.page,
          prefills: data.page.prefills || currentPage.prefills || []
        };
        
        replacePage(state.currentPageIndex, updatedPage);
        
        toast({
          title: "Changes applied!",
          description: "Laney has updated your page. Use Ctrl+Z to undo if needed.",
        });
      }
    } catch (err) {
      console.error("AI edit failed:", err);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Laney couldn't process your request. Please try again.",
      });
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleToolChange = (tool: typeof state.activeTool) => {
    if (tool === 'text') {
      handleAddText('body');
    } else {
      setTool(tool);
    }
  };

  const handleLayoutSelect = (layoutId: string) => {
    console.log('[Editor] Layout selected:', layoutId);
    console.log('[Editor] Current page index:', state.currentPageIndex);
    applyLayoutToPage(state.currentPageIndex, layoutId);
  };

  // Debug state changes
  useEffect(() => {
    console.log('[Editor] State updated:', {
      currentPageIndex: state.currentPageIndex,
      selectedElementId: state.selectedElementId,
      pageCount: state.pages.length,
      currentPageElements: currentPage?.elements?.length,
      currentPagePrefills: currentPage?.prefills?.length,
      zoomLevel: state.zoomLevel,
      activeTool: state.activeTool
    });
  }, [state, currentPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlKey && e.key === 'c') {
        e.preventDefault();
        copyElement();
      } else if (ctrlKey && e.key === 'v') {
        e.preventDefault();
        pasteElement();
      } else if (ctrlKey && e.key === 'x') {
        e.preventDefault();
        cutElement();
      } else if (ctrlKey && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedElementId) {
          e.preventDefault();
          deleteElement(state.selectedElementId);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [copyElement, pasteElement, cutElement, undo, redo, deleteElement, state.selectedElementId]);

  
  // Configure sidebar tabs
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

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F8F8F8]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading photobook...</p>
        </div>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F8F8F8]">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">No photobook found</p>
          <Button onClick={() => navigate("/ai-creation")}>
            Start a new photobook
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden bg-[#F8F8F8]">
      {/* Auto-save Indicator */}
      <AutoSaveIndicator />
      
      {/* Photobook Title - Left Top */}
      <div className="absolute left-16 top-4 z-10">
        <input
          type="text"
          value={bookTitle}
          onChange={(e) => updateBookTitle(e.target.value)}
          className="h-8 w-56 rounded-full border border-border bg-white/90 px-3 text-sm font-medium text-foreground shadow-sm outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64"
          placeholder="Untitled Photobook"
        />
      </div>

      {/* Collapsible Left Sidebar */}
      <CollapsibleLeftSidebar tabs={sidebarTabs} defaultOpen={false} />

      {/* Main Canvas Area - Center */}
      <div className="absolute left-16 right-0 top-0 bottom-32">
        <PremiumCanvas
          page={currentPage}
          zoomLevel={state.zoomLevel}
          selectedElementId={state.selectedElementId}
          activeTool={state.activeTool}
          showBleedGuides={state.showBleedGuides}
          showSafeArea={state.showSafeArea}
          showGridLines={state.showGridLines}
          bookFormat={bookFormat}
          onSelectElement={selectElement}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onDropPhoto={handleDropPhoto}
          onDropPhotoIntoPrefill={(src, prefillId) => dropPhotoIntoPrefill(src, prefillId, state.currentPageIndex)}
          onReplacePhotoInPrefill={(src, prefillId) => replacePhotoInPrefill(src, prefillId, state.currentPageIndex)}
          onSwapPhotosInPrefills={(sourcePrefillId, targetPrefillId) => swapPhotosInPrefills(sourcePrefillId, targetPrefillId, state.currentPageIndex)}
          onRemovePhotoFromPrefill={(prefillId) => removePhotoFromPrefill(prefillId, state.currentPageIndex)}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      </div>

      {/* Laney Avatar - Right Side */}
      <LaneyAvatar onSendPrompt={handleAIPrompt} isProcessing={isAIProcessing} />

      {/* Canvas Toolbar - Bottom Center (above page ribbon) */}
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

      {/* Bottom Page Ribbon */}
      <BottomPageRibbon
        pages={state.pages}
        currentPageIndex={state.currentPageIndex}
        onPageSelect={setCurrentPage}
        onAddPage={addPage}
        onDuplicatePage={duplicatePage}
        onDeletePage={deletePage}
        onReorderPages={reorderPages}
      />

      {/* Zoom Controls - Right Bottom */}
      <ZoomControls
        zoomLevel={state.zoomLevel}
        onZoomIn={() => setZoom(state.zoomLevel + 10)}
        onZoomOut={() => setZoom(state.zoomLevel - 10)}
      />
    </div>
  );
};

export default PhotobookEditor;
