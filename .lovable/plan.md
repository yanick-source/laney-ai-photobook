
# Data-Driven Templates Implementation Plan

## Overview
Transform the hardcoded template system into a flexible, database-driven solution that allows managing templates directly from the backend without code changes.

---

## Database Schema

### New `templates` Table
```text
┌─────────────────────────────────────────────────────────────────┐
│                         templates                                │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID        PRIMARY KEY (auto-generated)        │
│ name            TEXT        NOT NULL (e.g., "Family Moments")   │
│ category        TEXT        NOT NULL (wedding, travel, etc.)    │
│ tag             TEXT        NULLABLE (Trending, Popular, New)   │
│ usage_count     INTEGER     DEFAULT 0                           │
│ cover_image_path TEXT       NOT NULL (storage path)             │
│ spread_image_path TEXT      NULLABLE (inside preview image)     │
│ orientation     TEXT        DEFAULT 'horizontal'                │
│ display_order   INTEGER     DEFAULT 0 (for sorting)             │
│ is_active       BOOLEAN     DEFAULT true                        │
│ created_at      TIMESTAMPTZ DEFAULT now()                       │
│ updated_at      TIMESTAMPTZ DEFAULT now()                       │
└─────────────────────────────────────────────────────────────────┘
```

### RLS Policy
- **Public read access** for all active templates (no auth required for viewing)
- Templates are marketing content visible to everyone

---

## Storage Setup

### New Storage Bucket: `template-images`
- **Public bucket** (templates are marketing assets, no auth needed)
- Folder structure:
  - `covers/` - Cover images for templates
  - `spreads/` - Inside spread preview images

---

## Recommended Image Sizes

Based on the current card aspect ratios and CSS:

| Type | Orientation | Recommended Size | Aspect Ratio |
|------|-------------|-----------------|--------------|
| Cover | Vertical | **900 x 1200 px** | 3:4 |
| Cover | Horizontal | **1200 x 900 px** | 4:3 |
| Spread | Any | **800 x 600 px** | 4:3 |

**Why these sizes:**
- Cards render at max ~280px width, so 900-1200px provides 3-4x density for retina displays
- Focal point should be positioned slightly high (top 20-30%) as the CSS uses `background-position: center 20%`
- JPEG format at 80% quality for optimal file size (~100-200KB per image)

---

## Implementation Steps

### Step 1: Database Migration
Create the `templates` table with all required columns and enable RLS with public read access.

### Step 2: Storage Bucket Creation
Create a **public** `template-images` bucket for storing cover and spread images.

### Step 3: Seed Initial Data
Migrate the current 13 hardcoded templates to the database, initially using the existing Unsplash URLs as placeholders.

### Step 4: Create Custom Hook
Build a `useTemplates` hook that:
- Fetches templates from the database
- Generates public URLs for images from storage
- Provides loading and error states
- Caches results with React Query

### Step 5: Update TemplateGrid Component
Refactor to:
- Use the new `useTemplates` hook
- Remove all hardcoded template data
- Handle loading/error states gracefully
- Maintain the existing 3D book animation and category filtering

### Step 6: Update TemplateCard Component
Minor updates to accept the new data structure while preserving the premium book preview animation.

---

## Data Flow Diagram

```text
┌──────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  template-images │     │   templates table   │     │   TemplateGrid   │
│     (Storage)    │     │    (Database)       │     │   (Component)    │
├──────────────────┤     ├─────────────────────┤     ├──────────────────┤
│ covers/          │────▶│ cover_image_path    │────▶│ useTemplates()   │
│ spreads/         │────▶│ spread_image_path   │     │ - fetch data     │
└──────────────────┘     │ name, tag, etc.     │     │ - get image URLs │
                         └─────────────────────┘     └──────────────────┘
```

---

## Management Workflow

After implementation, to update templates:

1. **Add/Replace images**: Upload to the `template-images` bucket via the backend
2. **Update metadata**: Edit rows in the `templates` table directly
3. **Changes go live immediately** - no code deployment needed

### Editable Fields (via backend):
- `name` - Template display name
- `tag` - Badge text (Trending, Popular, New, or null)
- `usage_count` - Number shown on cards
- `cover_image_path` - Path to cover image in storage
- `spread_image_path` - Path to spread image in storage
- `category` - Filter category
- `display_order` - Sort order within category
- `is_active` - Show/hide template

---

## Technical Details

### Files to Create
1. `src/hooks/useTemplates.ts` - Data fetching hook

### Files to Modify
1. `src/components/laney/TemplateGrid.tsx` - Replace hardcoded data with hook
2. `src/components/laney/TemplateCard.tsx` - Minor prop updates
3. `src/pages/Templates.tsx` - Use shared hook (optional, for consistency)

### Database Migration
- Create `templates` table
- Create `template-images` public bucket
- Insert seed data with existing Unsplash URLs as initial cover paths
- Create RLS policy for public read access

---

## Benefits
- **No code changes** needed to update templates
- **Instant updates** - changes reflect immediately
- **Scalable** - easily add new categories or templates
- **Consistent** - both homepage and templates page share the same data source
