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
        activeTool={state.activeTool}
        onClose={handleClose}
        onToolChange={setTool}
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

      {/* Main canvas area - full height, breathing space */}
      <div className="relative flex flex-1 items-center justify-center">
        {/* Layout panel overlay */}
        <LayoutPanel
          isOpen={state.activeTool === 'layout'}
          currentLayoutId={currentPage?.layoutId}
          onClose={() => setTool('select')}
          onSelectLayout={handleSelectLayout}
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

        {/* Floating media tray */}
        {showMediaTray && (
          <div className="absolute bottom-20 right-6 z-40 w-72 animate-in slide-in-from-bottom-4 fade-in-0 duration-200">
            <div className="rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-xl">
              <h3 className="mb-3 text-sm font-medium">Your Photos</h3>
              <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
                {allPhotos.map((photo, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('photo-src', photo);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    className="group relative aspect-square cursor-grab overflow-hidden rounded-lg border border-border bg-muted transition-all hover:border-primary hover:shadow-md active:cursor-grabbing"
                  >
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Drag photos to the canvas
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotobookEditor;
