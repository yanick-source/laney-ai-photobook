import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Book, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export type BookSize = "small" | "medium" | "large";
export type BookOrientation = "vertical" | "horizontal";

export interface BookFormat {
  size: BookSize;
  orientation: BookOrientation;
}

interface BookFormatPopupProps {
  open: boolean;
  onConfirm: (format: BookFormat) => void;
}

const BOOK_SIZES: { id: BookSize; label: string; dimensions: string; widthCm: number; heightCm: number }[] = [
  { id: "small", label: "Small", dimensions: "15 × 20 cm", widthCm: 15, heightCm: 20 },
  { id: "medium", label: "Medium", dimensions: "21 × 21 cm", widthCm: 21, heightCm: 21 },
  { id: "large", label: "Large", dimensions: "A4", widthCm: 21, heightCm: 29.7 },
];

const BOOK_ORIENTATIONS: { id: BookOrientation; label: string }[] = [
  { id: "vertical", label: "Vertical" },
  { id: "horizontal", label: "Horizontal" },
];

export function BookFormatPopup({ open, onConfirm }: BookFormatPopupProps) {
  const { t } = useTranslation();
  const [selectedSize, setSelectedSize] = useState<BookSize | null>(null);
  const [selectedOrientation, setSelectedOrientation] = useState<BookOrientation | null>(null);

  const canConfirm = selectedSize !== null && selectedOrientation !== null;

  const handleConfirm = () => {
    if (selectedSize && selectedOrientation) {
      onConfirm({ size: selectedSize, orientation: selectedOrientation });
    }
  };

  // Calculate aspect ratio for preview based on size and orientation
  const getPreviewDimensions = (size: typeof BOOK_SIZES[0], orientation: BookOrientation) => {
    const { widthCm, heightCm } = size;
    if (orientation === "horizontal") {
      return { width: heightCm, height: widthCm };
    }
    return { width: widthCm, height: heightCm };
  };

  // Get dimensions for the selected combination
  const getSelectedDimensions = () => {
    if (!selectedSize || !selectedOrientation) return null;
    const size = BOOK_SIZES.find(s => s.id === selectedSize)!;
    return getPreviewDimensions(size, selectedOrientation);
  };

  const selectedDims = getSelectedDimensions();

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-3xl overflow-hidden p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Book className="h-5 w-5 text-primary" />
              {t('bookFormat.title', 'Choose Your Book Format')}
            </DialogTitle>
            <DialogDescription>
              {t('bookFormat.description', 'Select the size and orientation for your photobook. This determines the final printed dimensions.')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Size Selection */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              {t('bookFormat.sizeLabel', 'Book Size')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {BOOK_SIZES.map((size) => {
                const isSelected = selectedSize === size.id;
                // Scale factor for visual representation (pixels per cm)
                const scale = 4;
                const previewWidth = size.widthCm * scale;
                const previewHeight = size.heightCm * scale;
                
                return (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={`relative flex flex-col items-center rounded-xl border-2 p-4 transition-all hover:border-primary/50 ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card hover:bg-accent/5"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    
                    {/* Book mockup */}
                    <div 
                      className="relative mb-3 flex items-center justify-center"
                      style={{ height: 100 }}
                    >
                      {/* Book cover with 3D effect */}
                      <div
                        className="relative rounded-sm shadow-lg"
                        style={{
                          width: Math.min(previewWidth, 80),
                          height: Math.min(previewHeight, 100),
                          background: 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground) / 0.1) 100%)',
                          transform: 'perspective(200px) rotateY(-5deg)',
                        }}
                      >
                        {/* Spine effect */}
                        <div 
                          className="absolute left-0 top-0 h-full w-2 rounded-l-sm"
                          style={{
                            background: 'linear-gradient(90deg, hsl(var(--muted-foreground) / 0.2) 0%, transparent 100%)',
                          }}
                        />
                        {/* Photo preview area */}
                        <div className="absolute inset-2 overflow-hidden rounded-sm bg-gradient-to-br from-primary/20 to-accent/20">
                          <div className="grid h-full w-full grid-cols-2 gap-0.5 p-1">
                            <div className="rounded-sm bg-muted-foreground/20" />
                            <div className="rounded-sm bg-muted-foreground/15" />
                            <div className="rounded-sm bg-muted-foreground/15" />
                            <div className="rounded-sm bg-muted-foreground/20" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <span className="text-sm font-medium text-foreground">
                      {t(`bookFormat.sizes.${size.id}`, size.label)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {size.dimensions}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orientation Selection */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              {t('bookFormat.orientationLabel', 'Orientation')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {BOOK_ORIENTATIONS.map((orientation) => {
                const isSelected = selectedOrientation === orientation.id;
                const isVertical = orientation.id === "vertical";
                
                return (
                  <button
                    key={orientation.id}
                    onClick={() => setSelectedOrientation(orientation.id)}
                    className={`relative flex flex-col items-center rounded-xl border-2 p-5 transition-all hover:border-primary/50 ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card hover:bg-accent/5"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    
                    {/* Orientation preview */}
                    <div className="mb-3 flex items-center justify-center" style={{ height: 80 }}>
                      <div
                        className="rounded-sm border-2 border-muted-foreground/30 bg-gradient-to-br from-muted to-muted/50 shadow-md"
                        style={{
                          width: isVertical ? 50 : 80,
                          height: isVertical ? 70 : 50,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div className="flex h-full w-full items-center justify-center">
                          <div 
                            className="rounded-sm bg-primary/30"
                            style={{
                              width: isVertical ? 30 : 50,
                              height: isVertical ? 40 : 30,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <span className="text-sm font-medium text-foreground">
                      {t(`bookFormat.orientations.${orientation.id}`, orientation.label)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isVertical 
                        ? t('bookFormat.orientationDescVertical', 'Portrait style')
                        : t('bookFormat.orientationDescHorizontal', 'Landscape style')
                      }
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview of selected combination */}
          {selectedDims && (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-4">
                <div 
                  className="shrink-0 rounded-sm border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 shadow-sm"
                  style={{
                    width: Math.min(selectedDims.width * 3, 80),
                    height: Math.min(selectedDims.height * 3, 80),
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t('bookFormat.selectedFormat', 'Selected Format')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {BOOK_SIZES.find(s => s.id === selectedSize)?.label} • {selectedOrientation === 'vertical' ? 'Vertical' : 'Horizontal'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDims.width.toFixed(1)} × {selectedDims.height.toFixed(1)} cm
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 p-4">
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
            size="lg"
          >
            {t('bookFormat.continue', 'Continue to AI Creation')}
            <ArrowRight className="h-4 w-4" />
          </Button>
          {!canConfirm && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {t('bookFormat.selectBoth', 'Please select both a size and orientation to continue')}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export utility to get pixel dimensions for canvas
export function getCanvasDimensions(format: BookFormat): { width: number; height: number } {
  const size = BOOK_SIZES.find(s => s.id === format.size)!;
  let widthCm = size.widthCm;
  let heightCm = size.heightCm;
  
  if (format.orientation === "horizontal") {
    [widthCm, heightCm] = [heightCm, widthCm];
  }
  
  // Convert cm to pixels at 300 DPI for high-quality print
  // 1 inch = 2.54 cm, so pixels = (cm / 2.54) * 300
  const pixelsPerCm = 300 / 2.54;
  
  return {
    width: Math.round(widthCm * pixelsPerCm),
    height: Math.round(heightCm * pixelsPerCm),
  };
}

// Export for editor canvas scaling (we use a smaller preview ratio)
export function getEditorCanvasRatio(format: BookFormat): number {
  const { width, height } = getCanvasDimensions(format);
  return width / height;
}
