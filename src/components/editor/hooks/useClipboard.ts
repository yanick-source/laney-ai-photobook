import { useState, useCallback } from 'react';
import { PageElement, EditorState, PhotobookPage } from '../types';

interface UseClipboardProps {
  state: EditorState;
  setState: (updater: any) => void;
  updatePages: (updater: (pages: PhotobookPage[]) => PhotobookPage[]) => void;
  deleteElement: (id: string) => void;
}

export function useClipboard({ state, setState, updatePages, deleteElement }: UseClipboardProps) {
  const [clipboard, setClipboard] = useState<PageElement | null>(null);

  const copyElement = useCallback(() => {
    const currentPageData = state.pages[state.currentPageIndex];
    const element = currentPageData?.elements.find(el => el.id === state.selectedElementId);
    if (element) {
      setClipboard(JSON.parse(JSON.stringify(element)));
    }
  }, [state.pages, state.currentPageIndex, state.selectedElementId]);

  const cutElement = useCallback(() => {
    const currentPageData = state.pages[state.currentPageIndex];
    const element = currentPageData?.elements.find(el => el.id === state.selectedElementId);
    if (element) {
      setClipboard(JSON.parse(JSON.stringify(element)));
      deleteElement(element.id);
    }
  }, [state.pages, state.currentPageIndex, state.selectedElementId, deleteElement]);

  const pasteElement = useCallback(() => {
    if (!clipboard) return;
    
    updatePages(pages => {
      const newPages = [...pages];
      const page = newPages[state.currentPageIndex];
      
      const newElement: PageElement = {
        ...clipboard,
        id: `${clipboard.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: Math.min(clipboard.x + 5, 100 - clipboard.width),
        y: Math.min(clipboard.y + 5, 100 - clipboard.height),
        zIndex: page.elements.length
      };
      
      newPages[state.currentPageIndex] = {
        ...page,
        elements: [...page.elements, newElement]
      };
      
      setState((prev: any) => ({ ...prev, selectedElementId: newElement.id }));
      
      return newPages;
    });
  }, [clipboard, state.currentPageIndex, updatePages, setState]);

  return { clipboard, copyElement, cutElement, pasteElement };
}