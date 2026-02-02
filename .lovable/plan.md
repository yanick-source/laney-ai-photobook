

# Photobook Editor UX Audit: Laney vs Canva

## Executive Summary

After a deep exploration of your editor codebase and comparing it against Canva's design editor paradigms, I've identified the key functional and UX gaps that create friction and reduce the "professional creative tool" perception.

---

## Implementation Progress

### ✅ COMPLETED: Priority #2 - Keyboard Modifier Support
**Implemented on 2026-02-02**

- ✅ Created `useKeyboardModifiers` hook to track Shift, Alt, Ctrl, Meta keys
- ✅ **Shift+Resize**: Maintains aspect ratio during resize
- ✅ **Shift+Rotate**: Snaps to 15° increments
- ✅ **Alt+Drag**: Duplicates element on drop
- ✅ **Ctrl+D**: Quick duplicate shortcut
- ✅ Visual modifier indicator shows when Shift/Alt is active
- ✅ Tooltips on resize handles show "Shift to constrain"

### ✅ COMPLETED: Priority #3 - Double-Click Photo Replace
**Implemented on 2026-02-02**

- ✅ Double-click on photo opens native file picker
- ✅ Replaces photo src while preserving position/size
- ✅ Hover overlay with "Replace" button appears on photo hover
- ✅ Hidden file input for seamless UX
- ✅ Resets crop/zoom to defaults on new image

### 🚧 TODO: Priority #1 - Multi-Select & Align Tools
**Deferred to next iteration**

Requires significant state refactoring:
1. Change `selectedElementId: string | null` → `selectedElementIds: string[]`
2. Add selection box on canvas drag
3. Shift+click to add to selection
4. Alignment toolbar for 2+ elements
5. Group/ungroup functionality

---

## Current State Analysis

### What Laney's Editor Does Well
- **Frame-first layout system** - Prefill slots with intelligent photo snapping
- **Contextual floating toolbars** - Clean, minimal UI that appears on selection
- **Magnetic snapping** - Element-to-element and edge snapping with visual guides
- **Bottom page ribbon** - Canva-style page navigation with thumbnails
- **Collapsible sidebar** - Organized tool panels (Photos, Layouts, Stickers, etc.)
- **Undo/redo with history** - Full state management with keyboard shortcuts
- **AI assistant (Laney)** - Floating avatar with chat overlay
- ✅ **Keyboard modifiers** - Shift for constrain, Alt for duplicate
- ✅ **Quick photo replace** - Double-click or hover to replace

### Updated Comparison Matrix

| Feature | Canva | Laney | Status |
|---------|-------|-------|--------|
| Right-click context menu | ✅ Full menu | ⚠️ Basic | Medium |
| Keyboard shortcuts discoverability | ✅ Visual hints | ✅ Implemented | ✅ Done |
| Element copy on drag (Alt+Drag) | ✅ Yes | ✅ Yes | ✅ Done |
| Multi-select + group | ✅ Yes | ❌ No | 🚧 Next |
| Smart spacing (distribute evenly) | ✅ Yes | ❌ No | Medium |
| Alignment toolbar | ✅ Always visible | ⚠️ In popover | Medium |
| Maintain aspect ratio (Shift) | ✅ Yes | ✅ Yes | ✅ Done |
| Double-click to replace photo | ✅ Yes | ✅ Yes | ✅ Done |
| Quick actions on hover | ✅ Rich | ✅ Replace button | ✅ Done |
| Preview/Present mode | ✅ Full screen | ❌ Missing | Medium |
| Download/Export options | ✅ Multiple formats | ❌ Not visible | Critical |

---

## Files Modified

1. **src/components/editor/hooks/useKeyboardModifiers.ts** (NEW)
   - Hook to track Shift, Alt, Ctrl, Meta keys
   - Helper functions: `constrainAspectRatio()`, `snapRotation()`

2. **src/components/editor/PremiumCanvas.tsx** (UPDATED)
   - Added keyboard modifier support for resize/rotate/drag
   - Added double-click photo replacement
   - Added hover overlay with Replace button
   - Added visual modifier indicator
   - Added Ctrl+D duplicate shortcut

3. **src/components/editor/ResizeHandle.tsx** (UPDATED)
   - Added tooltips with modifier hints
   - Updated to use design tokens

---

## Next Steps

1. **Multi-select implementation** - Refactor selection state to array
2. **Alignment toolbar** - Show when 2+ elements selected
3. **Export flow** - Add visible download/export options
4. **Preview mode** - Full-screen presentation view

---

## Summary

The Laney editor now has professional-grade keyboard modifier support and quick photo replacement, matching Canva's UX for these critical interactions. The remaining major gap is multi-select, which requires state architecture changes and is planned for the next iteration.
