import { useState, useEffect, useCallback } from 'react';

export interface KeyboardModifiers {
  isShiftPressed: boolean;
  isAltPressed: boolean;
  isCtrlPressed: boolean;
  isMetaPressed: boolean;
}

/**
 * Hook to track keyboard modifier keys (Shift, Alt, Ctrl, Meta)
 * Used for Canva-style interactions:
 * - Shift+Resize: Maintain aspect ratio
 * - Shift+Rotate: Snap to 15° increments
 * - Alt+Drag: Duplicate element on drop
 * - Ctrl+D: Quick duplicate
 */
export function useKeyboardModifiers(): KeyboardModifiers {
  const [modifiers, setModifiers] = useState<KeyboardModifiers>({
    isShiftPressed: false,
    isAltPressed: false,
    isCtrlPressed: false,
    isMetaPressed: false,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      setModifiers(prev => ({ ...prev, isShiftPressed: true }));
    } else if (e.key === 'Alt') {
      e.preventDefault(); // Prevent browser menu focus
      setModifiers(prev => ({ ...prev, isAltPressed: true }));
    } else if (e.key === 'Control') {
      setModifiers(prev => ({ ...prev, isCtrlPressed: true }));
    } else if (e.key === 'Meta') {
      setModifiers(prev => ({ ...prev, isMetaPressed: true }));
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      setModifiers(prev => ({ ...prev, isShiftPressed: false }));
    } else if (e.key === 'Alt') {
      setModifiers(prev => ({ ...prev, isAltPressed: false }));
    } else if (e.key === 'Control') {
      setModifiers(prev => ({ ...prev, isCtrlPressed: false }));
    } else if (e.key === 'Meta') {
      setModifiers(prev => ({ ...prev, isMetaPressed: false }));
    }
  }, []);

  // Clear all modifiers when window loses focus (prevents stuck keys)
  const handleBlur = useCallback(() => {
    setModifiers({
      isShiftPressed: false,
      isAltPressed: false,
      isCtrlPressed: false,
      isMetaPressed: false,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, handleKeyUp, handleBlur]);

  return modifiers;
}

/**
 * Constrain dimensions to maintain aspect ratio
 * Used during Shift+Resize
 */
export function constrainAspectRatio(
  originalWidth: number,
  originalHeight: number,
  newWidth: number,
  newHeight: number,
  handle: string
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  // Determine which dimension changed more and adjust the other
  const widthDelta = Math.abs(newWidth - originalWidth);
  const heightDelta = Math.abs(newHeight - originalHeight);
  
  // For corner handles, use the larger change to maintain proportion
  if (handle.includes('left') || handle.includes('right')) {
    if (widthDelta >= heightDelta) {
      // Width changed more, adjust height
      return {
        width: newWidth,
        height: newWidth / aspectRatio
      };
    }
  }
  
  if (handle.includes('top') || handle.includes('bottom')) {
    if (heightDelta >= widthDelta) {
      // Height changed more, adjust width
      return {
        width: newHeight * aspectRatio,
        height: newHeight
      };
    }
  }
  
  // For diagonal corner handles, prioritize width change
  return {
    width: newWidth,
    height: newWidth / aspectRatio
  };
}

/**
 * Snap rotation to 15-degree increments
 * Used during Shift+Rotate
 */
export function snapRotation(rotation: number): number {
  return Math.round(rotation / 15) * 15;
}
