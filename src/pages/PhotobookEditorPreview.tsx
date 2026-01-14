import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Image, Palette, Type, Sticker, Layers, Shapes } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useEditorState } from "@/components/editor/useEditorState";
import { PremiumCanvas } from "@/components/editor/PremiumCanvas";
import { MinimalHeader } from "@/components/editor/MinimalHeader";
import { BottomPageRibbon } from "@/components/editor/BottomPageRibbon";
import { CollapsibleLeftSidebar, PhotosPanel, ThemesPanel, TextPanel, StickersPanel, BackgroundsPanel, ElementsPanel } from "@/components/editor/CollapsibleLeftSidebar";
import { LaneyAvatar } from "@/components/editor/LaneyAvatar";
import { useToast } from "@/hooks/use-toast";
import type { PhotobookPage } from "@/components/editor/types";

const PhotobookEditorPreview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [photoDragSrc, setPhotoDragSrc] = useState<string>("");

  const {
    state,
    currentPage,
    selectedElement,
    allPhotos,
    bookTitle,
    isLoading,
    canUndo,
    canRedo,
    analysis,
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
    replacePage
  } = useEditorState();

  const handleClose = () => navigate("/");
  const handleOrder = () => navigate("/checkout");

  const handleDropPhoto = (src: string) => {
    addPhotoToPage(src, state.currentPageIndex);
  };

  const handlePhotoDragStart = (src: string) => {
    setPhotoDragSrc(src);
  };

  const handleAddText = (type: 'heading' | 'subheading' | 'body') => {
    addTextToPage(state.currentPageIndex);
    setTool('select');
  };

  const handleAIPrompt = async (prompt: string) => {
    if (!currentPage) return;

    toast({
      title: "Laney is thinking...",
      description: "AI improvements coming soon!",
    });

    // TODO: Implement AI editing
    console.log("AI Prompt:", prompt);
  };

  const handleToolChange = (tool: typeof state.activeTool) => {
    if (tool === 'text') {
      handleAddText('body');
    } else {
      setTool(tool);
    }
  };

  // Configure sidebar tabs
  const sidebarTabs = [
    {
      id: 'photos',
      icon: Image,
      label: 'Photos',
      panel: <PhotosPanel photos={allPhotos} onDragStart={handlePhotoDragStart} />
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
      {/* Minimal Header - Top */}
      <MinimalHeader
        title={bookTitle}
        currentPage={state.currentPageIndex}
        totalPages={state.pages.length}
        activeTool={state.activeTool}
        viewMode={state.viewMode}
        onClose={handleClose}
        onToolChange={handleToolChange}
        onViewModeChange={setViewMode}
        onOrder={handleOrder}
      />

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
          onSelectElement={selectElement}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onDropPhoto={handleDropPhoto}
        />
      </div>

      {/* Laney Avatar - Right Side */}
      <LaneyAvatar onSendPrompt={handleAIPrompt} />

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
    </div>
  );
};

export default PhotobookEditorPreview;
