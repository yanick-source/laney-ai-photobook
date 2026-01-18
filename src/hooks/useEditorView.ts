import { useState, useCallback } from 'react';
import { EditorState, EditorTool } from '../components/editor/types';

export function useEditorView(initialState: Partial<EditorState>) {
  const [zoomLevel, setZoomLevel] = useState(initialState.zoomLevel || 100);
  const [viewMode, setViewMode] = useState<'single' | 'spread'>(initialState.viewMode || 'single');
  const [activeTool, setActiveTool] = useState<EditorTool>(initialState.activeTool || 'select');
  const [guides, setGuides] = useState({
    showBleedGuides: true,
    showSafeArea: true,
    showGridLines: false
  });

  const setZoom = useCallback((zoom: number) => {
    setZoomLevel(Math.max(25, Math.min(200, zoom)));
  }, []);

  const toggleGuides = useCallback((type: 'bleed' | 'safe' | 'grid') => {
    setGuides(prev => ({
      ...prev,
      showBleedGuides: type === 'bleed' ? !prev.showBleedGuides : prev.showBleedGuides,
      showSafeArea: type === 'safe' ? !prev.showSafeArea : prev.showSafeArea,
      showGridLines: type === 'grid' ? !prev.showGridLines : prev.showGridLines
    }));
  }, []);

  return {
    zoomLevel,
    viewMode,
    activeTool,
    ...guides,
    setZoom,
    setViewMode,
    setTool: setActiveTool,
    toggleGuides
  };
}