import { useState, useCallback } from 'react';
import { PhotobookPage } from '../types';

interface HistoryEntry {
  pages: PhotobookPage[];
  timestamp: number;
}

interface UseEditorHistoryProps {
  onHistoryChange?: (pages: PhotobookPage[]) => void;
}

export const useEditorHistory = ({ onHistoryChange }: UseEditorHistoryProps = {}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save current state to history (optimized for performance)
  const saveToHistory = useCallback((pages: PhotobookPage[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      // Use structuredClone for better performance than JSON.parse(JSON.stringify())
      const clonedPages = typeof structuredClone !== 'undefined' 
        ? structuredClone(pages) 
        : JSON.parse(JSON.stringify(pages));
      
      newHistory.push({ pages: clonedPages, timestamp: Date.now() });
      
      // Limit history size
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    setHistoryIndex(prev => {
      const newIndex = prev + 1;
      return newIndex > 49 ? 49 : newIndex; // Max 49 (0-49)
    });
  }, [historyIndex]);

  // Undo last action
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      
      // Use structuredClone for better performance
      const pages = typeof structuredClone !== 'undefined' 
        ? structuredClone(history[newIndex].pages)
        : JSON.parse(JSON.stringify(history[newIndex].pages));
      onHistoryChange?.(pages);
      
      return pages;
    }
    return null;
  }, [history, historyIndex, onHistoryChange]);

  // Redo last undone action
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      
      // Use structuredClone for better performance
      const pages = typeof structuredClone !== 'undefined' 
        ? structuredClone(history[newIndex].pages)
        : JSON.parse(JSON.stringify(history[newIndex].pages));
      onHistoryChange?.(pages);
      
      return pages;
    }
    return null;
  }, [history, historyIndex, onHistoryChange]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  // Get current state
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const currentHistoryEntry = historyIndex >= 0 ? history[historyIndex] : null;

  return {
    // State
    history,
    historyIndex,
    canUndo,
    canRedo,
    currentHistoryEntry,
    
    // Actions
    saveToHistory,
    undo,
    redo,
    clearHistory
  };
};
