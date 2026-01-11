import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useEditorState } from "@/components/editor/useEditorState";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { PageThumbnailPanel } from "@/components/editor/PageThumbnailPanel";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { InspectorPanel } from "@/components/editor/InspectorPanel";
import { MediaTray } from "@/components/editor/MediaTray";
import { LayoutPanel } from "@/components/editor/LayoutPanel";
import { LaneyCompanion } from "@/components/editor/LaneyCompanion";

const PhotobookEditor = () => {
  const navigate = useNavigate();
  const [isMediaTrayExpanded, setIsMediaTrayExpanded] = useState(true);

  const {
    state,
    currentPage,
    selectedElement,
    allPhotos,
    bookTitle,
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
    toggleGuides
  } = useEditorState();

  const handleClose = () => navigate("/");
  const handleOrder = () => navigate("/checkout");

  const handleDropPhoto = (src: string) => {
    addPhotoToPage(src, state.currentPageIndex);
  };

  const handleSelectLayout = (layoutId: string) => {
    applyLayoutToPage(state.currentPageIndex, layoutId);
    setTool('select');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Fotoboek laden...</p>
        </div>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Geen fotoboek gevonden</p>
          <Button onClick={() => navigate("/ai-creation")}>
            Start een nieuw fotoboek
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-muted/30">
      {/* Toolbar */}
      <EditorToolbar
        title={bookTitle}
        currentPage={state.currentPageIndex}
        totalPages={state.pages.length}
        zoomLevel={state.zoomLevel}
        activeTool={state.activeTool}
        viewMode={state.viewMode}
        showBleedGuides={state.showBleedGuides}
        showSafeArea={state.showSafeArea}
        showGridLines={state.showGridLines}
        canUndo={canUndo}
        canRedo={canRedo}
        onClose={handleClose}
        onUndo={undo}
        onRedo={redo}
        onZoomChange={setZoom}
        onToolChange={setTool}
        onViewModeChange={setViewMode}
        onToggleGuide={toggleGuides}
        onOrder={handleOrder}
      />

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left - Page thumbnails */}
        <PageThumbnailPanel
          pages={state.pages}
          currentPageIndex={state.currentPageIndex}
          onPageSelect={setCurrentPage}
          onReorder={reorderPages}
        />

        {/* Center - Canvas + Media tray */}
        <div className="flex flex-1 flex-col relative">
          {/* Layout panel overlay */}
          <LayoutPanel
            isOpen={state.activeTool === 'layout'}
            currentLayoutId={currentPage?.layoutId}
            onClose={() => setTool('select')}
            onSelectLayout={handleSelectLayout}
          />

          {/* Canvas */}
          <EditorCanvas
            page={currentPage}
            zoomLevel={state.zoomLevel}
            selectedElementId={state.selectedElementId}
            activeTool={state.activeTool}
            showBleedGuides={state.showBleedGuides}
            showSafeArea={state.showSafeArea}
            showGridLines={state.showGridLines}
            viewMode={state.viewMode}
            onSelectElement={selectElement}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            onDropPhoto={handleDropPhoto}
          />

          {/* Media tray */}
          <MediaTray
            photos={allPhotos}
            isExpanded={isMediaTrayExpanded}
            onToggleExpand={() => setIsMediaTrayExpanded(!isMediaTrayExpanded)}
          />
        </div>

        {/* Right - Inspector */}
        <InspectorPanel
          selectedElement={selectedElement}
          pageBackground={currentPage.background}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onUpdateBackground={(bg) => setPageBackground(state.currentPageIndex, bg)}
        />
      </div>

      {/* Laney companion */}
      <LaneyCompanion
        currentPage={currentPage}
        totalPages={state.pages.length}
        onSuggestLayout={() => setTool('layout')}
        onSuggestCrop={() => setTool('crop')}
        onSuggestBackground={() => setTool('background')}
      />
    </div>
  );
};

export default PhotobookEditor;
