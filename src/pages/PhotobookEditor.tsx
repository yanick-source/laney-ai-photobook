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
import { PageAIPromptBar } from "@/components/editor/PageAIPromptBar";
import { useToast } from "@/hooks/use-toast";
import type { PhotobookPage } from "@/components/editor/types";

const PhotobookEditor = () => {
  const navigate = useNavigate();
  const [isMediaTrayExpanded, setIsMediaTrayExpanded] = useState(false);
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [lastAiPrompt, setLastAiPrompt] = useState<string | null>(null);
  const [lastAiOriginalPage, setLastAiOriginalPage] = useState<PhotobookPage | null>(null);
  const [lastAiPageIndex, setLastAiPageIndex] = useState<number | null>(null);
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
        title: "AI bewerking mislukt",
        description: "Probeer het opnieuw. Controleer ook of de Supabase function is gedeployed.",
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
      title: "Niets om terug te draaien",
      description: "Ga terug naar de pagina waar je de AI bewerking hebt toegepast.",
    });
  };

  const handleRegenerateAi = () => {
    if (!lastAiPrompt) return;
    void runAiEdit(lastAiPrompt);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Fotoboek laden...</p>
        </div>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
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
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-muted/30">
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
        isAIPromptOpen={isAIPromptOpen}
        onClose={handleClose}
        onUndo={undo}
        onRedo={redo}
        onZoomChange={setZoom}
        onToolChange={setTool}
        onViewModeChange={setViewMode}
        onToggleGuide={toggleGuides}
        onOrder={handleOrder}
        onToggleAIPrompt={() => setIsAIPromptOpen((v) => !v)}
      />

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

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left - Page thumbnails */}
        <PageThumbnailPanel
          pages={state.pages}
          currentPageIndex={state.currentPageIndex}
          onPageSelect={setCurrentPage}
          onReorder={reorderPages}
          onAddPage={addPage}
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
