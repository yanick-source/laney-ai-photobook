

# Connect AI Editor + Title Selection UI

## Overview

This plan connects the existing but non-functional AI editor (LaneyAvatar) to the `edit-page` edge function, and adds an interactive title picker in the BookPreview component.

## Changes Summary

| File | Change Type | Purpose |
|------|-------------|---------|
| `src/pages/PhotobookEditor.tsx` | Modify | Wire up `handleAIPrompt` to call edge function |
| `src/components/editor/LaneyAvatar.tsx` | Modify | Add loading/success feedback states |
| `src/components/laney/BookPreview.tsx` | Modify | Add title selection UI with 4 options |

---

## Implementation Details

### 1. Connect AI Editor in PhotobookEditor.tsx

**What changes:**
- Implement `handleAIPrompt` function that:
  - Calls the existing `edit-page` Supabase edge function
  - Sends current page, all photos, and analysis
  - Applies returned page changes to editor state
  - Shows toast with result

**Key code pattern:**
```typescript
const handleAIPrompt = async (prompt: string) => {
  setIsAIProcessing(true);
  try {
    const { data, error } = await supabase.functions.invoke('edit-page', {
      body: { prompt, page: currentPage, allPhotos, analysis }
    });
    if (data?.page) {
      // Apply the AI-edited page to state
      dispatch({ type: 'UPDATE_PAGE', payload: data.page });
      toast({ title: "Page updated", description: "Laney made improvements" });
    }
  } catch (e) { /* handle error */ }
  finally { setIsAIProcessing(false); }
};
```

- Pass `handleAIPrompt` to `<LaneyAvatar onSendPrompt={handleAIPrompt} />`

### 2. Enhance LaneyAvatar Feedback

**What changes:**
- Show loading spinner in chat panel while processing
- Display success message after AI responds
- Close chat overlay automatically on success (optional)

### 3. Add Title Selection in BookPreview.tsx

**What changes:**
- Check if `fullAnalysis?.titleOptions` exists
- Render 4 clickable title options (iconic, playful, minimalist, sentimental)
- When user clicks a title, update the `analysis.title` state
- Selected title gets visual highlight (border/checkmark)

**UI placement:** Below the book mockup, above the "Start Editing" button

**Design:**
```text
┌─────────────────────────────────────────┐
│  Choose your title:                     │
│  ┌──────────┐ ┌──────────┐              │
│  │ London   │ │ Big Ben  │              │
│  │ Calling ✓│ │ & Beyond │              │
│  └──────────┘ └──────────┘              │
│  ┌──────────┐ ┌──────────┐              │
│  │ London / │ │ Our      │              │
│  │ 2025     │ │ London   │              │
│  └──────────┘ └──────────┘              │
└─────────────────────────────────────────┘
```

---

## Technical Notes

### Editor State Update

The editor uses a reducer pattern. To apply AI changes, we need to:
1. Add a new action type `UPDATE_PAGE` in `editorReducer.ts` that replaces the current page's elements and background
2. Preserve page ID and prefills structure

### Error Handling

The `edit-page` edge function already handles:
- 429 rate limits → show "Try again later" toast
- 402 credits exhausted → show "Add credits" toast
- Parse failures → returns original page unchanged

### No Breaking Changes

- All existing functionality preserved
- Title selection is optional (only shows if AI provided options)
- AI editor gracefully degrades if edge function fails

---

## Files NOT Changed

- `supabase/functions/edit-page/index.ts` — Already complete
- `src/lib/aiTypes.ts` — Already has `titleOptions` type
- `src/components/editor/hooks/editorReducer.ts` — Only needs minor addition

---

## Estimated Scope

- ~50 lines in PhotobookEditor.tsx
- ~15 lines in LaneyAvatar.tsx  
- ~40 lines in BookPreview.tsx
- ~10 lines in editorReducer.ts

Total: ~115 lines of changes across 4 files

