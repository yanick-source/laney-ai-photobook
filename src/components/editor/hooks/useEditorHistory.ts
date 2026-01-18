import { useState, useCallback } from 'react';
import { PhotobookPage } from '../types';

interface HistoryEntry {
  pages: PhotobookPage[];
  timestamp: number;
}

interface UseEditorHistoryProps {
  onHistoryChange?: (pages: PhotobookPage[]) => void;
}

const MAX_HISTORY_STEPS = 10;

// HELPER: Strips heavy objects (File/Blob) to ensure History stays lightweight (JSON only)
const sanitizeForHistory = (pages: PhotobookPage[]): PhotobookPage[] => {
  return pages.map(page => ({
    ...page,
    elements: page.elements.map(el => {
      // Create a clean copy of the element
      const cleanEl = { ...el };
      
      // Defense in Depth: Explicitly delete any 'file' or 'blob' properties 
      // if they accidentally got attached to the element state
      // @ts-ignore
      if (cleanEl.file) delete cleanEl.file;
      // @ts-ignore
      if (cleanEl.blob) delete cleanEl.blob;
      
      return cleanEl;
    })
  }));
};

export const useEditorHistory = ({ onHistoryChange }: UseEditorHistoryProps = {}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback((pages: PhotobookPage[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      
      // 1. Sanitize: Remove any accidental Blobs/Files
      const cleanPages = sanitizeForHistory(pages);
      
      // 2. Clone: structuredClone is now safe because cleanPages is guaranteed text-only
      const clonedPages = typeof structuredClone !== 'undefined' 
        ? structuredClone(cleanPages) 
        : JSON.parse(JSON.stringify(cleanPages));
      
      newHistory.push({ pages: clonedPages, timestamp: Date.now() });
      
      if (newHistory.length > MAX_HISTORY_STEPS) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });

    setHistoryIndex(prev => {
      const newIndex = prev + 1;
      return newIndex > (MAX_HISTORY_STEPS - 1) ? (MAX_HISTORY_STEPS - 1) : newIndex;
    });
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      // Clone on retrieval to prevent mutation of history state
      const pages = structuredClone(history[newIndex].pages);
      onHistoryChange?.(pages);
      return pages;
    }
    return null;
  }, [history, historyIndex, onHistoryChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const pages = structuredClone(history[newIndex].pages);
      onHistoryChange?.(pages);
      return pages;
    }
    return null;
  }, [history, historyIndex, onHistoryChange]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    history,
    historyIndex,
    canUndo,
    canRedo,
    saveToHistory,
    undo,
    redo,
    clearHistory
  };
};