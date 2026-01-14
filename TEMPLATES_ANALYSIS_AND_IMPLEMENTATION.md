# Templates Analysis and Implementation Plan

## 📋 **Current State Analysis**

### **Existing Template System**

**Home Page Templates** (`/src/pages/Index.tsx` → `TemplateGrid`):
- **Location**: `TemplateGrid.tsx` component
- **Data**: Hardcoded template objects with:
  - `id`, `image`, `titleKey`, `usageCount`, `tagKey`
  - Categories: wedding, travel, family, baby, birthday, graduation, holiday
- **Visual**: 3D book animation with cover images
- **Interaction**: Currently just redirects to `/ai-creation`

**Templates Page** (`/src/pages/Templates.tsx`):
- **Separate template system** with different data structure
- **Categories**: wedding, travel, family, baby, birthday, graduation, holiday, modern, classic
- **Data**: Basic info (title, category, image, style, pages)
- **Interaction**: Links to `/ai-creation`

**Editor Layout System** (`/src/components/editor/types.ts`):
- **Layout presets**: `LAYOUT_PRESETS` array with 8 predefined layouts
- **Page layouts**: Individual page arrangements (full-bleed, two-horizontal, etc.)
- **No template concept**: Only individual page layouts

### **Problem Identification**

1. **Disconnected Systems**: Home page templates and editor layouts are completely separate
2. **No Template Persistence**: Templates are just visual previews, not actual photobook structures
3. **Missing Bridge**: No way to apply a template to create a complete photobook
4. **Limited Scope**: Templates are just images, not actual page arrangements

## 🎯 **Implementation Strategy**

### **Phase 1: Create Template Data Structure**

**1. Define Template Type** (`/src/components/editor/types.ts`):
```typescript
export interface PhotobookTemplate {
  id: string;
  name: string;
  category: string;
  coverImage: string;
  description: string;
  style: string;
  totalPages: number;
  layouts: TemplatePageLayout[];
  colorScheme: {
    primary: string;
    secondary: string;
    backgrounds: string[];
  };
  fontScheme: {
    heading: string;
    body: string;
    accent: string;
  };
  metadata: {
    usageCount: number;
    isPremium: boolean;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface TemplatePageLayout {
  pageIndex: number;
  layoutId: string;
  background: PageBackground;
  elements: TemplateElement[];
}

export interface TemplateElement {
  type: 'photo' | 'text' | 'decoration';
  slotIndex?: number;
  presetText?: string;
  style?: {
    fontSize?: number;
    color?: string;
    fontFamily?: string;
  };
}
```

**2. Create Template Definitions** (`/src/data/templates.ts`):
```typescript
export const PHOTOBOOK_TEMPLATES: PhotobookTemplate[] = [
  {
    id: 'romantic-wedding',
    name: 'Romantische Bruiloft',
    category: 'wedding',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop',
    description: 'Elegant bruiloft met klassieke lay-outs en zachte kleuren',
    style: 'Elegant',
    totalPages: 24,
    layouts: [
      { pageIndex: 0, layoutId: 'full-bleed', background: { type: 'solid', value: '#FFFFFF' }, elements: [
        { type: 'photo', slotIndex: 0 },
        { type: 'text', presetText: 'Onze Bruiloft', style: { fontSize: 48, fontFamily: 'Playfair Display', color: '#FFFFFF' } }
      ]},
      { pageIndex: 1, layoutId: 'featured', background: { type: 'solid', value: '#F8F5F2' }, elements: [
        { type: 'photo', slotIndex: 0 },
        { type: 'photo', slotIndex: 1 },
        { type: 'photo', slotIndex: 2 },
        { type: 'text', presetText: 'De Voorbereiding', style: { fontSize: 24, fontFamily: 'Playfair Display', color: '#2C3E50' } }
      ]},
      // ... more page layouts
    ],
    colorScheme: {
      primary: '#2C3E50',
      secondary: '#E6E0D8',
      backgrounds: ['#FFFFFF', '#F8F5F2', '#FFF5EB']
    },
    fontScheme: {
      heading: 'Playfair Display',
      body: 'Inter',
      accent: 'Georgia'
    },
    metadata: {
      usageCount: 12453,
      isPremium: false,
      difficulty: 'beginner'
    }
  },
  // ... more templates
];
```

### **Phase 2: Template Selection System**

**1. Update TemplateGrid Component**:
```typescript
// /src/components/laney/TemplateGrid.tsx
interface TemplateGridProps {
  onTemplateSelect?: (template: PhotobookTemplate) => void;
  showApplyButton?: boolean;
}

export const TemplateGrid = ({ 
  onTemplateSelect,
  showApplyButton = false
}: TemplateGridProps) => {
  const handleTemplateClick = (template: PhotobookTemplate) => {
    if (showApplyButton) {
      onTemplateSelect?.(template);
    } else {
      // Navigate to AI creation with template
      navigate('/ai-creation', { state: { templateId: template.id } });
    }
  };

  return (
    <div className="template-grid">
      {PHOTOBOOK_TEMPLATES.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onClick={() => handleTemplateClick(template)}
          showApplyButton={showApplyButton}
        />
      ))}
    </div>
  );
};
```

**2. Create Template Selection Modal**:
```typescript
// /src/components/editor/TemplateSelector.tsx
export function TemplateSelector({ 
  isOpen, 
  onClose, 
  onTemplateSelect 
}: TemplateSelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kies een Sjabloon</DialogTitle>
          <DialogDescription>
            Start met een professioneel ontwerp als basis voor je fotoboek
          </DialogDescription>
        </DialogHeader>
        
        <TemplateGrid 
          onTemplateSelect={onTemplateSelect}
          showApplyButton={true}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### **Phase 3: Template Application System**

**1. Create Template Application Function**:
```typescript
// /src/lib/templateEngine.ts
export function applyTemplate(
  template: PhotobookTemplate,
  photos: string[]
): PhotobookPage[] {
  const pages: PhotobookPage[] = [];
  let photoIndex = 0;

  template.layouts.forEach((templateLayout) => {
    const layout = LAYOUT_PRESETS.find(l => l.id === templateLayout.layoutId);
    if (!layout) return;

    const elements: PageElement[] = [];

    templateLayout.elements.forEach((templateElement) => {
      if (templateElement.type === 'photo' && templateElement.slotIndex !== undefined) {
        const slot = layout.slots[templateElement.slotIndex];
        if (slot && photoIndex < photos.length) {
          elements.push(createPhotoElement(
            photos[photoIndex++],
            slot.x,
            slot.y,
            slot.width,
            slot.height,
            elements.length
          ));
        }
      } else if (templateElement.type === 'text') {
        elements.push(createTextElement(
          templateElement.presetText || '',
          10, // Default position
          10,
          80, // Default width
          20, // Default height
          elements.length,
          templateElement.style
        ));
      }
    });

    pages.push({
      id: `page-${templateLayout.pageIndex}`,
      elements,
      background: templateLayout.background,
      layoutId: templateLayout.layoutId
    });
  });

  return pages;
}
```

**2. Update useEditorState Hook**:
```typescript
// /src/components/editor/useEditorState.ts
export function useEditorState() {
  // ... existing state

  const applyTemplate = useCallback(async (templateId: string) => {
    const template = PHOTOBOOK_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    if (allPhotos.length === 0) {
      toast({
        title: "Geen foto's",
        description: "Upload eerst foto's voordat je een sjabloon toepast.",
        variant: "destructive"
      });
      return;
    }

    const pages = applyTemplate(template, allPhotos);
    setState(prev => ({ ...prev, pages }));
    saveToHistory(pages);

    toast({
      title: "Sjabloon toegepast",
      description: `${template.name} is succesvol toegepast op je fotoboek.`
    });
  }, [allPhotos]);

  return {
    // ... existing returns
    applyTemplate
  };
}
```

### **Phase 4: UI Integration**

**1. Add Template Button to Editor**:
```typescript
// /src/pages/PhotobookEditor.tsx
const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);

// Add to sidebar tabs
const sidebarTabs = [
  // ... existing tabs
  {
    id: 'templates',
    icon: BookOpen,
    label: 'Sjablonen',
    panel: (
      <div className="p-4">
        <h3 className="text-sm font-medium mb-3">Sjablonen</h3>
        <Button 
          onClick={() => setIsTemplateSelectorOpen(true)}
          className="w-full"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Kies Sjabloon
        </Button>
        
        {/* Quick template preview */}
        <div className="mt-4 space-y-2">
          {PHOTOBOOK_TEMPLATES.slice(0, 3).map((template) => (
            <button
              key={template.id}
              onClick={() => applyTemplate(template.id)}
              className="w-full p-2 border rounded-lg hover:bg-primary/10 text-left"
            >
              <div className="flex items-center gap-2">
                <img 
                  src={template.coverImage} 
                  alt={template.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="text-sm font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.totalPages} pagina's</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  },
  // ... rest of tabs
];

// Add template selector modal
return (
  <div>
    {/* ... existing editor content */}
    
    <TemplateSelector
      isOpen={isTemplateSelectorOpen}
      onClose={() => setIsTemplateSelectorOpen(false)}
      onTemplateSelect={(template) => {
        applyTemplate(template.id);
        setIsTemplateSelectorOpen(false);
      }}
    />
  </div>
);
```

**2. Update AI Creation Flow**:
```typescript
// /src/pages/AICreationFlow.tsx
const location = useLocation();
const selectedTemplate = location.state?.templateId;

// In the photo analysis step
const handleAnalyzePhotos = async () => {
  // ... existing analysis
  
  if (selectedTemplate) {
    // Apply template instead of generating smart layouts
    const template = PHOTOBOOK_TEMPLATES.find(t => t.id === selectedTemplate);
    if (template) {
      const pages = applyTemplate(template, uploadedPhotos);
      await savePhotobook({
        title: template.name,
        photos: uploadedPhotos,
        analysis: result,
        metadata: {
          totalPages: pages.length,
          photos: uploadedPhotos.length,
          chapters: Math.ceil(pages.length / 4),
          style: template.style,
          summary: `Fotoboek gemaakt met ${template.name} sjabloon`
        }
      });
    }
  }
  
  navigate('/editor');
};
```

### **Phase 5: Template Management**

**1. Create Template Editor** (Future Enhancement):
```typescript
// /src/pages/TemplateEditor.tsx
export function TemplateEditor() {
  // Allow users to create custom templates
  // Save templates to IndexedDB
  // Share templates with community
}
```

**2. Template Storage**:
```typescript
// /src/lib/templateStorage.ts
export async function saveCustomTemplate(template: PhotobookTemplate) {
  // Save to IndexedDB
}

export async function getCustomTemplates(): Promise<PhotobookTemplate[]> {
  // Load from IndexedDB
}
```

## 🚀 **Implementation Steps**

### **Step 1: Core Template System (Day 1)**
1. Create template types and data structures
2. Define basic templates (wedding, travel, family)
3. Create template application engine

### **Step 2: Home Page Integration (Day 2)**
1. Update TemplateGrid to use new template system
2. Add template selection to home page
3. Connect templates to AI creation flow

### **Step 3: Editor Integration (Day 3)**
1. Add Templates tab to sidebar
2. Create TemplateSelector modal
3. Integrate template application in useEditorState

### **Step 4: Enhanced Features (Day 4)**
1. Add template preview in editor
2. Template undo/redo support
3. Template customization options

### **Step 5: Advanced Features (Future)**
1. Custom template creation
2. Template sharing
3. Template marketplace

## 📊 **Benefits**

1. **User Experience**: Users can start with professional designs
2. **Consistency**: Templates ensure cohesive photobook design
3. **Speed**: Faster photobook creation
4. **Quality**: Professional layouts accessible to everyone
5. **Flexibility**: Templates can be customized after application

## 🔧 **Technical Considerations**

1. **Performance**: Templates should be lightweight and fast to apply
2. **Storage**: Store templates in code, custom templates in IndexedDB
3. **Photos**: Template application should handle variable photo counts
4. **Customization**: Applied templates should be fully editable
5. **Undo/Redo**: Template application should be reversible

## 📝 **Testing Checklist**

- [ ] Templates display correctly on home page
- [ ] Template selection opens modal
- [ ] Template application creates correct page layouts
- [ ] Photos are placed in correct slots
- [ ] Text elements use correct styling
- [ ] Applied templates are editable
- [ ] Undo works after template application
- [ ] Templates work with different photo counts
- [ ] Template data persists correctly
- [ ] Performance is acceptable with large templates
