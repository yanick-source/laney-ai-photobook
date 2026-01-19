import { 
  PhotobookPage, 
  PageElement, 
  PhotoElement, 
  TextElement,
  LAYOUT_PRESETS
} from '../components/editor/types';
export const createPhotoElement = (
  src: string, 
  x: number, 
  y: number, 
  width: number, 
  height: number,
  zIndex: number
): PhotoElement => ({
  id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type: 'photo',
  src,
  x,
  y,
  width,
  height,
  rotation: 0,
  zIndex,
  opacity: 1,
  cropX: 50,
  cropY: 50,
  cropZoom: 1
});

export const createTextElement = (
  content: string,
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number
): TextElement => ({
  id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type: 'text',
  content,
  x,
  y,
  width,
  height,
  rotation: 0,
  fontFamily: 'Playfair Display, serif',
  fontSize: 32,
  fontWeight: 'bold',
  fontStyle: 'normal',
  color: '#FFFFFF',
  textAlign: 'center',
  lineHeight: 1.4,
  opacity: 1,
  zIndex,
  textDecoration: 'none',
  letterSpacing: 0,
  textTransform: 'none'
});

export const generatePagesFromPhotos = (photos: string[], title: string): PhotobookPage[] => {
  const pages: PhotobookPage[] = [];
  let photoIndex = 0;

  // Cover page
  pages.push({
    id: 'cover',
    elements: photos[0] ? [
      createPhotoElement(photos[photoIndex++], 0, 0, 100, 100, 0),
      createTextElement(title || 'Mijn Fotoboek', 10, 80, 80, 15, 1)
    ] : [
      createTextElement(title || 'Mijn Fotoboek', 10, 40, 80, 20, 0)
    ],
    background: { type: 'solid', value: '#FFFFFF' }
  });

  // Generate content pages using layout sequence
  const layoutSequence = ['full-bleed', 'two-horizontal', 'four-grid', 'featured', 'two-vertical', 'three-grid'];
  let layoutIndex = 0;
  let pageNumber = 1;

  while (photoIndex < photos.length) {
    const layout = LAYOUT_PRESETS.find(l => l.id === layoutSequence[layoutIndex % layoutSequence.length])!;
    const elements: PageElement[] = [];

    for (const slot of layout.slots) {
      if (photoIndex < photos.length) {
        elements.push(createPhotoElement(
          photos[photoIndex++],
          slot.x,
          slot.y,
          slot.width,
          slot.height,
          elements.length
        ));
      }
    }

    if (elements.length > 0) {
      pages.push({
        id: `page-${pageNumber}`,
        elements,
        background: { 
          type: 'solid', 
          value: pageNumber % 3 === 0 ? '#F8F5F2' : '#FFFFFF' 
        },
        layoutId: layout.id
      });
      pageNumber++;
    }
    layoutIndex++;
  }

  return pages;
};