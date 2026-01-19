import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Share2, ShoppingBag, Sparkles, Download, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock Data for the prototype
const MOCK_PAGES = [
  { id: 1, type: 'cover', src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2969&auto=format&fit=crop', title: 'Summer Gala' },
  { id: 2, type: 'collage', src: 'https://images.unsplash.com/photo-1519671482538-581b5db3bcc6?q=80&w=3024&auto=format&fit=crop' },
  { id: 3, type: 'full', src: 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=2976&auto=format&fit=crop' },
  { id: 4, type: 'collage', src: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2970&auto=format&fit=crop' },
];

export const FoldableViewer = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [currentIndex, setCurrentIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  const handleShare = async () => {
    const shareData = {
      title: 'Our Event Photobook',
      text: 'Check out the photos from the event!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDownload = () => {
    toast.success("Downloading current page...");
    // Logic to download current image/canvas would go here
  };

  const handleShopify = () => {
    // Redirect to Shopify with the ID
    window.location.href = `https://your-shopify-store.com/cart/add?id=VARIANT_ID&attributes[foldable_id]=${shareId}`;
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Viewer Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2 text-white">
          <span className="font-bold text-lg tracking-tight">Laney</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs backdrop-blur-md">
            {currentIndex + 1} / {MOCK_PAGES.length}
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full" onClick={handleDownload}>
            <Download className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Carousel */}
      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {MOCK_PAGES.map((page, index) => (
            <div key={page.id} className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center bg-gray-900">
              {/* This mimics the "Foldable" page look */}
              <div className="relative w-full h-full md:max-w-md md:max-h-[80vh] md:rounded-xl overflow-hidden bg-white shadow-2xl">
                <img 
                  src={page.src} 
                  alt={`Page ${index + 1}`}
                  className="w-full h-full object-cover" 
                />
                
                {/* Overlay text for cover */}
                {page.type === 'cover' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <h1 className="text-4xl font-bold text-white tracking-widest uppercase border-4 border-white p-6">
                      {page.title}
                    </h1>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls (Visible on Desktop) */}
      <div className="hidden md:block absolute top-1/2 left-4 -translate-y-1/2 z-20">
        <Button 
          size="icon" 
          variant="secondary" 
          className="rounded-full shadow-lg"
          onClick={() => emblaApi?.scrollPrev()}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="hidden md:block absolute top-1/2 right-4 -translate-y-1/2 z-20">
        <Button 
          size="icon" 
          variant="secondary" 
          className="rounded-full shadow-lg"
          onClick={() => emblaApi?.scrollNext()}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Bottom Action Bar (The Viral Hook) */}
      <div className="relative z-20 bg-white pb-safe pt-4 px-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-3 max-w-md mx-auto mb-4">
          <Button 
            onClick={handleShopify}
            className="w-full h-12 bg-gray-900 text-white rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg font-semibold hover:bg-gray-800"
          >
            <ShoppingBag className="h-5 w-5" />
            Order Print Copy
          </Button>
          
          <Button 
            onClick={() => navigate('/create')}
            variant="outline"
            className="w-full h-12 border-orange-200 text-orange-700 hover:bg-orange-50 rounded-xl flex items-center justify-center gap-2 font-medium"
          >
            <Sparkles className="h-5 w-5" />
            Create your own with AI
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoldableViewer;