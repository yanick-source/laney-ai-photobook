import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useEditorState } from "@/components/editor/useEditorState";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { MinimalHeader } from "@/components/editor/MinimalHeader";
import { MiniPageNav } from "@/components/editor/MiniPageNav";
import { CanvasToolbar } from "@/components/editor/CanvasToolbar";
import { LayoutPanel } from "@/components/editor/LayoutPanel";
import { BackgroundPanel } from "@/components/editor/BackgroundPanel";
import { EnhancedMediaTray } from "@/components/editor/EnhancedMediaTray";
import { LaneyCompanion } from "@/components/editor/LaneyCompanion";
import { PageAIPromptBar } from "@/components/editor/PageAIPromptBar";
import { useToast } from "@/hooks/use-toast";
import type { PhotobookPage } from "@/components/editor/types";
import { cn } from "@/lib/utils";

const PhotobookEditor = () => {
  const navigate = useNavigate();
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [lastAiPrompt, setLastAiPrompt] = useState<string | null>(null);
  const [lastAiOriginalPage, setLastAiOriginalPage] = useState<PhotobookPage | null>(null);
  const [lastAiPageIndex, setLastAiPageIndex] = useState<number | null>(null);
  const [showMediaTray, setShowMediaTray] = useState(false);
  const { toast } = useToast();

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
    toggleGuides,
    replacePage
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

  // Handle Text tool - add text to page
  const handleAddText = () => {
    addTextToPage(state.currentPageIndex);
    setTool('select');
  };

  // Handle tool change with special behavior
  const handleToolChange = (tool: typeof state.activeTool) => {
    if (tool === 'text') {
      handleAddText();
    } else {
      setTool(tool);
    }
  };

  // Handle background panel close
  const handleBackgroundPanelClose = () => {
    setTool('select');
  };

  const canUndoAi =
    lastAiOriginalPage !== null &&
    lastAiPageIndex !== null &&
    lastAiPageIndex === state.currentPageIndex;

  const runAiEdit = async (promptToRun: string) => {
    if (!currentPage) return;
    if (isAiRunning) return;
    if (promptToRun.trim().length === 0) return;

    setIsAiRunning(true);
    setLastAiPrompt(promptToRun);
    setLastAiOriginalPage(currentPage);
    setLastAiPageIndex(state.currentPageIndex);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/edit-page`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: promptToRun,
            page: currentPage,
            pageIndex: state.currentPageIndex,
            allPhotos,
            analysis,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed: ${response.status}`);
      }

      const payload = await response.json();
      const nextPage = payload?.page as PhotobookPage | undefined;

      if (!nextPage || !Array.isArray(nextPage.elements) || !nextPage.background) {
        throw new Error("Invalid AI response");
      }

      replacePage(state.currentPageIndex, nextPage);
    } catch (error) {
      console.error("AI edit failed:", error);
      toast({
        title: "AI edit failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAiRunning(false);
    }
  };

  const handleUndoAi = () => {
    if (canUndoAi && lastAiOriginalPage) {
      replacePage(state.currentPageIndex, lastAiOriginalPage);
      setLastAiOriginalPage(null);
      setLastAiPageIndex(null);
      return;
    }

    toast({
      title: "Nothing to undo",
      description: "Go back to the page where you applied the AI edit.",
    });
  };

  const handleRegenerateAi = () => {
    if (!lastAiPrompt) return;
    void runAiEdit(lastAiPrompt);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading photobook...</p>
        </div>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
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
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#f5f5f5]">
      {/* Minimal header - floating */}
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

      {/* AI Prompt bar */}
      <PageAIPromptBar
        isOpen={isAIPromptOpen}
        prompt={aiPrompt}
        isRunning={isAiRunning}
        canUndo={canUndoAi}
        canRegenerate={Boolean(lastAiPrompt)}
        onPromptChange={setAiPrompt}
        onRun={() => void runAiEdit(aiPrompt)}
        onRegenerate={handleRegenerateAi}
        onUndo={handleUndoAi}
        onClose={() => setIsAIPromptOpen(false)}
      />

      {/* Main canvas area */}
      <div className="relative flex flex-1 items-center justify-center">
        {/* Layout panel overlay */}
        <LayoutPanel
          isOpen={state.activeTool === 'layout'}
          currentLayoutId={currentPage?.layoutId}
          onClose={() => setTool('select')}
          onSelectLayout={handleSelectLayout}
        />

        {/* Background panel */}
        <BackgroundPanel
          isOpen={state.activeTool === 'background'}
          background={currentPage.background}
          onClose={handleBackgroundPanelClose}
          onUpdateBackground={(bg) => setPageBackground(state.currentPageIndex, bg)}
        />

        {/* Mini page navigation - floating left */}
        <MiniPageNav
          pages={state.pages}
          currentPageIndex={state.currentPageIndex}
          onPageSelect={setCurrentPage}
          onReorder={reorderPages}
          onAddPage={addPage}
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

        {/* Bottom toolbar - floating center */}
        <CanvasToolbar
          zoomLevel={state.zoomLevel}
          showBleedGuides={state.showBleedGuides}
          showSafeArea={state.showSafeArea}
          showGridLines={state.showGridLines}
          canUndo={canUndo}
          canRedo={canRedo}
          isAIPromptOpen={isAIPromptOpen}
          onUndo={undo}
          onRedo={redo}
          onZoomChange={setZoom}
          onToggleGuide={toggleGuides}
          onToggleAIPrompt={() => setIsAIPromptOpen((v) => !v)}
        />

        {/* Floating media tray toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute bottom-6 right-6 z-30 h-9 gap-2 rounded-full bg-white/90 px-4 shadow-lg backdrop-blur-xl",
            showMediaTray && "bg-primary text-primary-foreground"
          )}
          onClick={() => setShowMediaTray(!showMediaTray)}
        >
          <Image className="h-4 w-4" />
          <span className="text-xs font-medium">{allPhotos.length} photos</span>
        </Button>

        {/* Enhanced media tray */}
        <EnhancedMediaTray
          photos={allPhotos}
          isOpen={showMediaTray}
          onClose={() => setShowMediaTray(false)}
        />

        {/* Laney Companion */}
        <LaneyCompanion
          currentPage={currentPage}
          totalPages={state.pages.length}
          onSuggestLayout={() => setTool('layout')}
          onSuggestBackground={() => setTool('background')}
          onAddText={handleAddText}
        />
      </div>
    </div>
  );
};

export default PhotobookEditor;
