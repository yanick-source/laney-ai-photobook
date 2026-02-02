

# Photobook Editor UX Audit: Laney vs Canva

## Executive Summary

After a deep exploration of your editor codebase and comparing it against Canva's design editor paradigms, I've identified the key functional and UX gaps that create friction and reduce the "professional creative tool" perception.

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

### Comparison Matrix

| Feature | Canva | Laney | Impact |
|---------|-------|-------|--------|
| Right-click context menu | ✅ Full menu | ⚠️ Basic (in code, not visible in UI) | Medium |
| Keyboard shortcuts discoverability | ✅ Visual hints | ❌ Hidden | High |
| Element copy on drag (Alt+Drag) | ✅ Yes | ❌ No | High |
| Multi-select + group | ✅ Yes | ❌ No | Critical |
| Smart spacing (distribute evenly) | ✅ Yes | ❌ No | Medium |
| Alignment toolbar | ✅ Always visible | ⚠️ In popover | Medium |
| Search in sidebar panels | ⚠️ Partial (stickers only) | ⚠️ Photos missing | Low |
| Resize from center (Shift key) | ✅ Yes | ❌ No | Medium |
| Maintain aspect ratio (Shift) | ✅ Yes | ❌ No | High |
| On-canvas text editing | ⚠️ Works | ⚠️ Works | - |
| Double-click to replace photo | ✅ Yes | ❌ No | High |
| Frame swapping by drag | ✅ Seamless | ⚠️ Basic | Medium |
| Quick actions on hover | ✅ Rich | ⚠️ Limited | Medium |
| Preview/Present mode | ✅ Full screen | ❌ Missing | Medium |
| Download/Export options | ✅ Multiple formats | ❌ Not visible | Critical |

---

## Top 3 Priority Improvements

### Priority #1: Multi-Select, Group & Align Tools

**What Canva Does Better:**
- Hold Shift to add elements to selection
- Drag a selection box around multiple elements
- Group/ungroup with Ctrl+G
- Alignment toolbar appears showing: Align left, center, right, top, middle, bottom + Distribute horizontally/vertically

**Why It Matters:**
This is the #1 friction point for any design tool. When users want to:
- Align two photos to the same edge
- Center a text block relative to a photo
- Move multiple elements together
- Create consistent spacing

Currently, they must manually adjust each element one by one. This is tedious and error-prone.

**Impact: CRITICAL**
- Saves 10-30 seconds per layout adjustment
- Enables "professional" design work
- Most requested feature in any visual editor

**Implementation Scope:**
1. Selection state: `selectedElementIds: string[]` (array instead of single ID)
2. Selection box on canvas drag (when not on element)
3. Shift+click to add to selection
4. Alignment toolbar appears when 2+ elements selected
5. Group action creates a virtual container
6. Distribute evenly calculates spacing mathematically

---

### Priority #2: Keyboard Modifier Support (Shift+Resize, Alt+Drag)

**What Canva Does Better:**
- **Shift + Resize**: Maintains aspect ratio (crucial for photos)
- **Shift + Rotate**: Snaps to 15° increments
- **Alt + Drag**: Duplicates element on drop
- **Ctrl + D**: Duplicate selected element
- Keyboard hints shown in tooltips ("Shift to constrain")

**Why It Matters:**
Professional users expect modifier keys to work. Without them:
- Photos get distorted when resizing (wrong aspect ratio)
- Duplicating requires finding the copy button (extra click)
- Rotation is imprecise

**Impact: HIGH**
- Distorted photos = amateur result
- Alt+Drag = 50% faster workflow for repeated elements
- Makes the tool feel "professional grade"

**Implementation Scope:**
1. Track modifier key state (e.g., `isShiftPressed`) via `keydown`/`keyup`
2. In resize handler: Calculate constrained dimensions when Shift held
3. In drag handler: Clone element on drop when Alt held
4. Update tooltips to show "Shift to constrain" hints
5. Add visual indicator when modifier is active

---

### Priority #3: Double-Click to Replace Photo + Quick Hover Actions

**What Canva Does Better:**
- **Double-click on photo**: Opens file picker to replace instantly
- **Hover over photo**: Shows "Replace" and "Edit" quick actions
- **Hover over frame**: Shows "Add photo" when empty
- All without selecting first

**Why It Matters:**
The current flow to replace a photo is:
1. Select photo
2. Delete it
3. Drag new photo from sidebar
4. Position it in the same spot

With Canva's approach:
1. Double-click photo
2. Select replacement

This is ~4x faster and feels magical.

**Impact: HIGH**
- Photo replacement is one of the most common editing actions
- Reduces friction for iteration ("try different photo here")
- Creates "delightful" micro-interaction

**Implementation Scope:**
1. Add `onDoubleClick` handler to photo elements
2. Open native file picker (`<input type="file">`)
3. Replace `src` of existing element, preserve position/size
4. Add hover overlay with "Replace" button (appears on mouseenter)
5. For empty frames: Show "Click to add photo" overlay

---

## Secondary Improvements (Lower Priority)

### 4. Preview/Present Mode
- Full-screen presentation of the photobook
- Page-by-page navigation
- No editing UI visible
- Users want to see final result before export

### 5. Export Flow
- Currently no visible export/download option
- Need: Download as PDF, individual images, or order print

### 6. Alignment Guides Enhancement
- Show distance indicators between elements (Canva shows "24px" between items)
- Center-to-center alignment for text/photos

### 7. Right-Click Context Menu Polish
- The code has a ContextMenu but it only appears on elements
- Need: Right-click on canvas for paste, add text, add shape options

---

## Technical Implementation Notes

### For Priority #1 (Multi-Select):

```text
State Changes:
┌────────────────────────────────────────────────────┐
│ selectedElementId: string | null                   │
│                      ↓                             │
│ selectedElementIds: string[]                       │
└────────────────────────────────────────────────────┘

New Actions Needed:
- ADD_TO_SELECTION: { payload: string }
- REMOVE_FROM_SELECTION: { payload: string }
- SELECT_MULTIPLE: { payload: string[] }
- GROUP_ELEMENTS: { payload: string[] }
- UNGROUP: { payload: string }

UI Changes:
- Selection box renders during canvas drag
- AlignmentToolbar appears when 2+ selected
- Bounding box shows around all selected
```

### For Priority #2 (Modifiers):

```text
Event Flow:
┌────────────────────────────────────────────────────┐
│ window.keydown → track isShiftPressed, isAltPressed│
│ window.keyup → clear flags                         │
│                                                    │
│ In handleMouseMove (resize):                       │
│   if (isShiftPressed) constrainAspectRatio()       │
│                                                    │
│ In handleMouseUp (drag):                           │
│   if (isAltPressed) cloneElement()                 │
└────────────────────────────────────────────────────┘
```

### For Priority #3 (Quick Replace):

```text
Interaction Flow:
┌────────────────────────────────────────────────────┐
│ Photo Element                                      │
│   ├── onDoubleClick → openFilePicker()             │
│   ├── onMouseEnter → showQuickActions()            │
│   └── onMouseLeave → hideQuickActions()            │
│                                                    │
│ QuickActionOverlay:                                │
│   [Replace] [Edit] [Delete]                        │
└────────────────────────────────────────────────────┘
```

---

## Recommended Implementation Order

1. **Week 1**: Priority #2 (Modifier Keys) - Quick win, high impact
2. **Week 2-3**: Priority #3 (Quick Replace) - User delight
3. **Week 3-5**: Priority #1 (Multi-Select) - Largest scope, biggest payoff

---

## Summary

The Laney editor has a strong foundation with modern architecture (reducer pattern, contextual toolbars, frame-first layouts). The gaps are not fundamental architecture issues—they are **interaction refinements** that separate a "good" editor from a "Canva-quality" experience.

The top 3 priorities address:
1. **Efficiency** - Multi-select saves time
2. **Precision** - Modifier keys prevent mistakes
3. **Delight** - Quick replace feels magical

Implementing these will dramatically improve perceived quality and user satisfaction.

