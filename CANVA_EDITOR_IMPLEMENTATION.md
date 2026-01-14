# Canva-Style Editor Implementation Guide

## Overview
This document outlines the implementation of a Canva-quality photobook editor with Laney's premium emotional design language.

## Architecture Changes

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                    MinimalHeader (Top)                       │
├──────┬──────────────────────────────────────────────┬───────┤
│      │                                              │       │
│ Left │           Centered Canvas Area               │ Laney │
│ Side │         (Photobook with shadow)              │ Avatar│
│ bar  │                                              │ (R)   │
│      │                                              │       │
│ (H)  │                                              │       │
│      │                                              │       │
├──────┴──────────────────────────────────────────────┴───────┤
│           Bottom Page Ribbon (Horizontal Scroll)             │
└─────────────────────────────────────────────────────────────┘
```

## New Components Created

### 1. BottomPageRibbon.tsx
**Purpose**: Horizontal page navigation at the bottom (Canva-style)

**Features**:
- Horizontal scrolling with left/right buttons
- Page thumbnails with live preview
- Drag-and-drop reordering
- Duplicate and delete actions on hover
- Active page indicator
- Add page button
- Smooth animations

**Props**:
```typescript
{
  pages: PhotobookPage[];
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
}
```

### 2. CollapsibleLeftSidebar.tsx
**Purpose**: Hover-to-expand sidebar with vertical tabs

**Features**:
- Collapsed by default (only icons visible)
- Smooth hover expansion
- Auto-close when mouse leaves
- Vertical tab stack
- Glassy background with backdrop blur
- Individual panels for each tab

**Tabs Included**:
1. **Photos** - Upload and drag photos
2. **Themes** - Apply visual themes
3. **Text** - Add heading, subheading, body text
4. **Stickers** - Sticker library (placeholder)
5. **Backgrounds** - Solid colors, gradients
6. **Elements** - Shapes, frames (placeholder)

**Panel Components**:
- `PhotosPanel` - Grid of draggable photos with search
- `ThemesPanel` - Theme selection cards
- `TextPanel` - Text type buttons
- `StickersPanel` - Placeholder
- `BackgroundsPanel` - Color picker grid
- `ElementsPanel` - Placeholder

### 3. LaneyAvatar.tsx
**Purpose**: Persistent AI companion with expandable chat

**Features**:
- Always-visible floating avatar (right side)
- Pulsing glow animation
- Click to expand chat overlay
- Cinematic slide-down animation
- Darkened backdrop
- Quick suggestion chips
- Large text input area
- Send button with Enter key support

**Behavior**:
- Idle: Subtle glow and pulse
- Active: Chat overlay with backdrop
- Feels like a creative director, not a chatbot

### 4. PremiumCanvas.tsx
**Purpose**: Enhanced canvas with premium visual language

**Features**:
- Larger canvas (900x675) for premium feel
- Soft shadow and rounded corners
- Magnetic snapping to edges and center
- Smart alignment guides
- Bleed and safe area guides
- Grid lines toggle
- Smooth drag interactions
- Contextual floating toolbars
- Drop zone with visual feedback

**Visual Enhancements**:
- Shadow-2xl for depth
- Rounded-2xl corners
- Smooth transitions
- Premium spacing
- Clean, minimal design

## Implementation Status

### ✅ Completed
1. BottomPageRibbon component with full functionality
2. CollapsibleLeftSidebar with hover behavior
3. All sidebar panel components (Photos, Themes, Text, etc.)
4. LaneyAvatar with chat overlay
5. PremiumCanvas with enhanced visuals
6. Magnetic snapping system
7. TypeScript interfaces fixed

### 🚧 In Progress
1. Integration into main PhotobookEditor.tsx
2. Duplicate page functionality
3. Delete page functionality
4. Theme application logic

### 📋 Pending
1. Stickers library implementation
2. Elements/shapes library
3. Advanced photo filters
4. Text effects (shadows, outlines)
5. Undo/redo timeline visualization
6. Version history
7. Autosave indicator
8. Advanced alignment guides
9. Hover preview animations
10. Micro-animations polish

## Design Language

### Visual Style
- **Background**: Soft off-white (#F8F8F8)
- **Panels**: White with backdrop-blur-xl
- **Shadows**: Soft, layered shadows
- **Borders**: Subtle, rounded
- **Gradients**: Calm, from primary to accent
- **Spacing**: Premium, generous padding

### Interaction Patterns
- **Hover**: Smooth scale and shadow transitions
- **Drag**: Magnetic snapping with visual feedback
- **Select**: Primary color outline with handles
- **Drop**: Overlay with backdrop blur
- **Expand**: Smooth slide animations

### Animation Principles
- Duration: 200-300ms for most interactions
- Easing: ease-out for natural feel
- Magnetic: 2% threshold for snapping
- Hover: Scale 1.05 for lift effect

## Integration Guide

### Step 1: Update PhotobookEditor.tsx
Replace the current layout with:
```tsx
<div className="relative h-[calc(100vh-4rem)] overflow-hidden bg-[#F8F8F8]">
  <MinimalHeader {...headerProps} />
  
  <CollapsibleLeftSidebar tabs={sidebarTabs} />
  
  <div className="absolute left-16 right-0 top-0 bottom-32">
    <PremiumCanvas {...canvasProps} />
  </div>
  
  <LaneyAvatar onSendPrompt={handleAIPrompt} />
  
  <BottomPageRibbon {...pageRibbonProps} />
</div>
```

### Step 2: Add Missing Handlers
```tsx
const handleDuplicatePage = (index: number) => {
  const pageToDuplicate = state.pages[index];
  const newPage = {
    ...pageToDuplicate,
    id: `page-${Date.now()}`,
    elements: pageToDuplicate.elements.map(el => ({
      ...el,
      id: `${el.id}-copy-${Date.now()}`
    }))
  };
  // Insert after current page
  const newPages = [
    ...state.pages.slice(0, index + 1),
    newPage,
    ...state.pages.slice(index + 1)
  ];
  updatePages(() => newPages);
};

const handleDeletePage = (index: number) => {
  if (state.pages.length <= 1) return;
  const newPages = state.pages.filter((_, i) => i !== index);
  updatePages(() => newPages);
  if (state.currentPageIndex >= newPages.length) {
    setCurrentPage(newPages.length - 1);
  }
};
```

### Step 3: Configure Sidebar Tabs
```tsx
const sidebarTabs = [
  {
    id: 'photos',
    icon: Image,
    label: 'Photos',
    panel: <PhotosPanel photos={allPhotos} onDragStart={handlePhotoDragStart} />
  },
  {
    id: 'themes',
    icon: Palette,
    label: 'Themes',
    panel: <ThemesPanel />
  },
  // ... other tabs
];
```

## Quality Checklist

### Canva-Level Features
- [x] Bottom page ribbon
- [x] Hover-expandable sidebar
- [x] Contextual floating toolbars
- [x] Magnetic snapping
- [x] Premium visual design
- [x] Smooth animations
- [ ] Smart alignment guides
- [ ] Duplicate on drag
- [ ] Undo/redo timeline
- [ ] Version history
- [ ] Autosave indicator

### Premium Feel
- [x] Glassy panels
- [x] Soft shadows
- [x] Rounded corners
- [x] Calm gradients
- [x] Premium spacing
- [x] Smooth transitions
- [ ] Micro-animations
- [ ] Hover previews
- [ ] Zero lag optimization

### Laney Integration
- [x] Persistent avatar
- [x] Chat overlay
- [x] Suggestion chips
- [ ] Contextual suggestions
- [ ] Layout recommendations
- [ ] Photo quality analysis
- [ ] Empty page detection
- [ ] Spacing optimization

## Next Steps

1. **Immediate**: Integrate new components into PhotobookEditor.tsx
2. **Short-term**: Add duplicate/delete page handlers
3. **Medium-term**: Implement stickers and elements libraries
4. **Long-term**: Add advanced features (undo timeline, version history)

## Performance Considerations

- Use React.memo for heavy components
- Virtualize page ribbon for 100+ pages
- Lazy load sidebar panels
- Debounce drag operations
- Optimize canvas rendering
- Use CSS transforms for animations

## Accessibility

- Keyboard shortcuts for all actions
- Focus management for modals
- ARIA labels for icon buttons
- Screen reader announcements
- High contrast mode support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Notes

This implementation creates a professional, Canva-quality editor while maintaining Laney's warm, emotional design language. The focus is on visual-first, drag-first interactions with minimal clutter and maximum creative freedom.
