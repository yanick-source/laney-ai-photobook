import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Book, ArrowRight, LayoutTemplate, ScanLine } from "lucide-react";
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
  onClose?: () => void;
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

export function BookFormatPopup({ open, onConfirm, onClose }: BookFormatPopupProps) {
  const { t } = useTranslation();
  const [selectedSize, setSelectedSize] = useState<BookSize | null>(null);
  const [selectedOrientation, setSelectedOrientation] = useState<BookOrientation | null>(null);

  const canConfirm = selectedSize !== null && selectedOrientation !== null;

  const handleConfirm = () => {
    if (selectedSize && selectedOrientation) {
      onConfirm({ size: selectedSize, orientation: selectedOrientation });
    }
  };

  // Helper to calculate the visual style for the book preview
  const getPreviewStyle = () => {
    if (!selectedSize) return { width: 0, height: 0, opacity: 0 };
    
    const orientation = selectedOrientation || "vertical";
    const size = BOOK_SIZES.find(s => s.id === selectedSize)!;
    
    let w = size.widthCm;
    let h = size.heightCm;

    if (orientation === "horizontal") {
      [w, h] = [h, w];
    }

    // Scale factor
    const SCALE_FACTOR = 11.5; 

    return {
      width: `${w * SCALE_FACTOR}px`,
      height: `${h * SCALE_FACTOR}px`,
      opacity: 1
    };
  };

  const previewStyle = getPreviewStyle();
  const isHorizontal = selectedOrientation === 'horizontal';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <DialogContent 
        className="max-w-4xl p-0 overflow-hidden gap-0 md:flex flex-row md:h-[600px]"
      >
        {/* LEFT COLUMN: Controls */}
        <div className="w-full md:w-[420px] flex flex-col border-b md:border-b-0 md:border-r border-border bg-card h-full">
          <div className="p-6 flex-1 overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Book className="h-5 w-5 text-primary" />
                {t('bookFormat.title', 'Choose Your Book Format')}
              </DialogTitle>
              <DialogDescription>
                {t('bookFormat.description', 'Select the size and orientation for your photobook. This determines the final printed dimensions.')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8">
              {/* Size Selection */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                  <ScanLine className="h-4 w-4" />
                  {t('bookFormat.sizeLabel', 'Book Size')}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {BOOK_SIZES.map((size) => {
                    const isSelected = selectedSize === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`group relative flex items-center justify-between rounded-lg border-2 p-4 transition-all hover:border-primary/50 text-left ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border bg-background hover:bg-accent/50"
                        }`}
                      >
                        <div>
                          <span className={`block text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                            {t(`bookFormat.sizes.${size.id}`, size.label)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {size.dimensions}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orientation Selection */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4" />
                  {t('bookFormat.orientationLabel', 'Orientation')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {BOOK_ORIENTATIONS.map((orientation) => {
                    const isSelected = selectedOrientation === orientation.id;
                    const isVertical = orientation.id === "vertical";
                    return (
                      <button
                        key={orientation.id}
                        onClick={() => setSelectedOrientation(orientation.id)}
                        className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all hover:border-primary/50 ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border bg-background hover:bg-accent/50"
                        }`}
                      >
                         {isSelected && (
                          <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                        <div className={`mb-2 rounded border border-muted-foreground/30 bg-muted-foreground/10 ${
                            isVertical ? "h-8 w-6" : "h-6 w-8"
                        }`} />
                        <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {t(`bookFormat.orientations.${orientation.id}`, orientation.label)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border bg-muted/20 p-6">
            <Button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="w-full h-12 gap-2 bg-gradient-to-r from-primary to-primary/90 text-lg font-medium shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              {t('bookFormat.continue', 'Design with Laney')}
              <ArrowRight className="h-5 w-5" />
            </Button>
            {!canConfirm && (
              <p className="mt-3 text-center text-xs text-muted-foreground animate-pulse">
                {t('bookFormat.selectBoth', 'Please select both a size and orientation to continue')}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Visualization */}
        <div className="flex-1 bg-muted/10 p-8 flex flex-col items-center justify-center relative min-h-[400px] md:min-h-auto overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                {selectedSize ? (
                    <>
                        <div 
                            className="relative bg-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform will-change-transform"
                            style={previewStyle}
                        >
                            <div 
                                className={`absolute bg-gradient-to-r from-black/10 to-transparent z-10 ${
                                    isHorizontal ? 'top-0 bottom-0 left-0 w-4 border-r border-black/5' : 'top-0 bottom-0 left-0 w-3 border-r border-black/5'
                                }`} 
                            />
                            
                            <div className="absolute -bottom-4 -right-4 w-full h-full bg-black/5 blur-xl -z-10 rounded-lg transform translate-y-2" />
                            
                            {/* Inner Content - Updates based on Orientation to ensure visual change even for Square books */}
                            <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 p-6 flex flex-col items-center justify-center text-center border border-black/5">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 opacity-50">
                                    <Book className="h-8 w-8 text-primary/40" />
                                </div>
                                {/* Dynamic Skeleton based on Orientation */}
                                <div className={`h-2 bg-muted-foreground/10 rounded mb-2 transition-all duration-300 ${isHorizontal ? 'w-24' : 'w-16'}`} />
                                <div className={`h-2 bg-muted-foreground/10 rounded transition-all duration-300 ${isHorizontal ? 'w-16' : 'w-10'}`} />
                                {/* Extra line for vertical to emphasize height */}
                                {!isHorizontal && <div className="h-2 bg-muted-foreground/10 rounded w-12 mt-2 transition-all duration-300" />}
                            </div>

                            <div className="absolute top-1 bottom-1 right-0 w-1 bg-gradient-to-l from-gray-200 to-transparent opacity-50" />
                        </div>
                        
                        <div className="mt-10 space-y-1 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <h4 className="text-xl font-semibold text-foreground">
                                {BOOK_SIZES.find(s => s.id === selectedSize)?.label}
                             </h4>
                             <p className="text-muted-foreground font-mono">
                                {isHorizontal 
                                   ? `${BOOK_SIZES.find(s => s.id === selectedSize)?.heightCm} × ${BOOK_SIZES.find(s => s.id === selectedSize)?.widthCm} cm`
                                   : `${BOOK_SIZES.find(s => s.id === selectedSize)?.widthCm} × ${BOOK_SIZES.find(s => s.id === selectedSize)?.heightCm} cm`
                                }
                             </p>
                             <p className="text-xs text-primary/80 font-medium uppercase tracking-wider mt-1">
                                {isHorizontal ? 'Landscape' : 'Portrait'}
                             </p>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-muted-foreground/40">
                         <div className="w-48 h-64 border-4 border-dashed border-current rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <span className="text-4xl font-light opacity-50">?</span>
                         </div>
                         <p className="text-sm font-medium">Select a format to preview</p>
                    </div>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export utility to get pixel dimensions for canvas (unchanged)
export function getCanvasDimensions(format: BookFormat): { width: number; height: number } {
  const size = BOOK_SIZES.find(s => s.id === format.size)!;
  let widthCm = size.widthCm;
  let heightCm = size.heightCm;
  
  if (format.orientation === "horizontal") {
    [widthCm, heightCm] = [heightCm, widthCm];
  }
  
  const pixelsPerCm = 300 / 2.54;
  
  return {
    width: Math.round(widthCm * pixelsPerCm),
    height: Math.round(heightCm * pixelsPerCm),
  };
}

export function getEditorCanvasRatio(format: BookFormat): number {
  const { width, height } = getCanvasDimensions(format);
  return width / height;
}