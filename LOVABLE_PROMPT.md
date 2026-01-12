# Complete Memory Canvas Website - Lovable Development Prompt

## Project Overview
Create a complete photobook creation web application with AI-powered features. The application allows users to create personalized photobooks through an intuitive AI-assisted workflow.

## Key Features to Implement

### 1. Navigation & Layout
- **Sidebar Navigation**: Fixed left sidebar with navigation items
  - Home (links to `/`)
  - Projecten (links to `/projects`)
  - Sjablonen (links to `/templates`) 
  - Laney AI (links to `/ai`)
- **Header**: Top navigation bar with logo and user actions
- **MainLayout**: Consistent layout wrapper for all pages

### 2. Home Page (`/`)
- **Hero Section**: 
  - Headline: "Wat ga je vandaag creëren?" (gradient styling)
  - Subheadline: "Maak in minuten een professioneel fotoboek met AI"
  - CTA Button: "Binnen 5 minuten je eigen fotoboek!" (gradient background)
- **Category Bar**: Horizontal filter pills for template categories
- **Template Grid**: Horizontal carousel showing 5 templates per row
  - Scrollable with hidden scrollbars
  - Template cards with large images and gradient overlays
  - Hover effects and animations

### 3. Create Photobook Page (`/create`)
- **Hero Section**: 
  - Icon with gradient background
  - Title: "Je fotoboek creëren met AI"
  - Description of AI-powered creation process
- **Step Cards**: 3-column grid showing creation steps
  - Step 1: Upload foto's
  - Step 2: Kies stijl  
  - Step 3: Ontvang resultaat
- **CTA Button**: "Begin met creëren" linking to AI creation flow

### 4. AI Creation Flow (`/ai-creation`)
**Three-state workflow:**

#### Upload State:
- **Left Panel**: Large drag-and-drop upload area
  - Supports drag & drop and click to browse
  - File type validation (images only)
  - Upload progress indicator
- **Right Panel**: AI Assistant
  - Explains what AI analyzes (location, emotions, timeline, people, colors)
  - Shows selected photo count
  - "Continue with AI" button

#### Processing State:
- **AI Progress Component**: 4-step animated progress
  - Step 1: Analyzing photos
  - Step 2: Creating layout
  - Step 3: Generating content
  - Step 4: Finalizing design
- Loading animations and progress indicators

#### Preview State:
- **Success Message**: "AI design complete"
- **Book Preview**: Grid layout with book mockup
- **Book Details**: 
  - Title: "Summer Memories 2024"
  - 24 pages, X photos, 4 chapters
  - Style: "Modern Minimal"
- **Action Button**: "Start editing your book"

## Design System

### Colors & Theme
- **Primary Gradient**: Orange to Pink (`from-orange-500 to-pink-500`)
- **Background**: White to light orange/pink gradient (`from-white via-orange-50 to-pink-50`)
- **Text Colors**: Gray scale for readability
- **Cards**: White backgrounds with orange accents

### UI Components
- **Buttons**: Gradient backgrounds with hover effects
- **Cards**: Rounded corners, shadows, hover states
- **Icons**: Lucide React icons throughout
- **Typography**: Clean, modern font hierarchy

### Layout Patterns
- **Responsive**: Mobile-first design
- **Containers**: Max-width containers with proper spacing
- **Grids**: Flexbox and CSS Grid for layouts
- **Animations**: Smooth transitions and micro-interactions

## Technical Requirements

### Framework & Libraries
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tool

### File Structure
```
src/
├── components/
│   ├── layout/
│   │   └── MainLayout.tsx
│   ├── laney/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── CategoryBar.tsx
│   │   └── TemplateGrid.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── UploadDropzone.tsx
│       └── AIProgress.tsx
├── pages/
│   ├── Index.tsx
│   ├── CreatePhotobook.tsx
│   └── AICreationFlow.tsx
└── App.tsx
```

### Routing Structure
- `/` - Home page with hero and templates
- `/create` - Create photobook landing page
- `/ai-creation` - AI creation flow (upload → process → preview)
- `/projects` - Projects page (placeholder)
- `/templates` - Templates page (placeholder)
- `/ai` - AI features page (placeholder)

## Implementation Notes

### Key Interactions
1. **Home → Create**: CTA button navigates to `/create`
2. **Create → AI Flow**: "Begin met creëren" navigates to `/ai-creation`
3. **AI Flow States**: Automatic progression through upload → processing → preview
4. **Sidebar Navigation**: All items clickable and navigate to respective routes

### Responsive Design
- **Mobile**: Collapsible sidebar, stacked layouts
- **Tablet**: Adjusted grid columns and spacing
- **Desktop**: Full layout with sidebar and main content

### Performance Considerations
- **Lazy Loading**: Components and images as needed
- **Optimized Assets**: Compressed images and icons
- **Smooth Animations**: CSS transitions for better UX
- **Code Splitting**: Route-based code splitting

## Success Criteria
✅ Complete navigation flow between all pages
✅ Functional AI creation workflow
✅ Responsive design on all devices
✅ Modern UI with consistent theming
✅ Smooth animations and interactions
✅ Clean, maintainable code structure
✅ Production-ready build and deployment

## Repository
- **GitHub**: https://github.com/yanick-source/laney.git
- **Latest Commit**: 6b5c82726fbfd1a5d559839986735886f4d6914b
- **Branch**: main

Build this complete photobook creation application with all features, responsive design, and modern UI as specified above.
