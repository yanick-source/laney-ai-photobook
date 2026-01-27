import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Share2, Download, ExternalLink, Copy, Check, 
  Instagram, Linkedin, Ghost, Printer, Sparkles, 
  ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { createStorefrontCheckout, ShopifyProduct } from "@/lib/shopify";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Document, Page, pdfjs } from "react-pdf";
import { supabase } from "@/integrations/supabase/client";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PartnerDashboardProps {
  isAdmin?: boolean;
}

// B2B Photobook variant ID from Shopify
const B2B_PHOTOBOOK_VARIANT_ID = "gid://shopify/ProductVariant/52653540475223";

const PartnerDashboard = ({ isAdmin = false }: PartnerDashboardProps) => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [copied, setCopied] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageWidth, setPageWidth] = useState(400);
  const [isOrdering, setIsOrdering] = useState(false);
  
  const viewerLink = `${window.location.origin}/view/${eventId || 'demo'}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(viewerLink)}`;

  // Fetch the PDF for the viewer
  useEffect(() => {
    const fetchPdfUrl = async () => {
      setLoading(true);

      // Dev/demo: serve the PDF from the local machine (Downloads) via Vite middleware
      if (import.meta.env.DEV) {
        setPdfUrl("/__local/pdf");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.storage
        .from("photobook-images")
        .createSignedUrl("public/kookfabriek-fotoboek-a4.pdf", 3600); // 1 hour expiry

      if (error) {
        console.error("Error fetching PDF:", error);
        toast.error("Could not load photobook");
      } else if (data) {
        setPdfUrl(data.signedUrl);
      }
      setLoading(false);
    };

    fetchPdfUrl();
  }, []);

  // Responsive page width
  useEffect(() => {
    const updateWidth = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        setPageWidth(screenWidth - 80);
      } else if (screenWidth < 1024) {
        setPageWidth(300);
      } else {
        setPageWidth(400);
      }
    };
    
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(viewerLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOrderPhysicalBook = async () => {
    setIsOrdering(true);
    try {
      // Create a mock product structure for the cart
      const b2bProduct: ShopifyProduct = {
        node: {
          id: "gid://shopify/Product/10519450616151",
          title: "B2B Photobook",
          description: "Professional photobook for business partners",
          handle: "b2b-photobook",
          priceRange: {
            minVariantPrice: { amount: "45.00", currencyCode: "EUR" }
          },
          images: { edges: [] },
          variants: {
            edges: [{
              node: {
                id: B2B_PHOTOBOOK_VARIANT_ID,
                title: "Default Title",
                price: { amount: "45.00", currencyCode: "EUR" },
                availableForSale: true,
                selectedOptions: [{ name: "Title", value: "Default Title" }]
              }
            }]
          },
          options: [{ name: "Title", values: ["Default Title"] }]
        }
      };

      const checkoutUrl = await createStorefrontCheckout([{
        product: b2bProduct,
        variantId: B2B_PHOTOBOOK_VARIANT_ID,
        variantTitle: "Default Title",
        price: { amount: "45.00", currencyCode: "EUR" },
        quantity: 1,
        selectedOptions: [{ name: "Title", value: "Default Title" }]
      }]);

      window.open(checkoutUrl, '_blank');
    } catch (error) {
      console.error('Failed to create checkout:', error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  const handleCreateWithLaney = () => {
    navigate('/');
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Book Navigation Logic
  // Page 1 = cover, then spreads of 2 pages each
  const totalSpreads = numPages ? Math.ceil((numPages - 1) / 2) + 1 : 1;

  const nextSpread = () => {
    if (currentSpread < totalSpreads - 1) setCurrentSpread(prev => prev + 1);
  };

  const prevSpread = () => {
    if (currentSpread > 0) setCurrentSpread(prev => prev - 1);
  };

  // Helper to render the current view
  const renderBookContent = () => {
    if (loading || !pdfUrl) {
      return (
        <div className="flex items-center justify-center w-full h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (currentSpread === 0) {
      // COVER VIEW (Single Page)
      return (
        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} loading={
          <div className="flex items-center justify-center w-full h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }>
          <div className="relative shadow-2xl rounded-r-lg overflow-hidden transform transition-all duration-500 ease-in-out">
            <Page 
              pageNumber={1} 
              width={pageWidth * 1.4}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent" />
          </div>
        </Document>
      );
    } else {
      // SPREAD VIEW (Two Pages Side by Side)
      const leftPageNum = 1 + (currentSpread - 1) * 2 + 1;
      const rightPageNum = leftPageNum + 1;

      return (
        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} loading={
          <div className="flex items-center justify-center w-full h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }>
          <div className="flex shadow-2xl rounded-lg overflow-hidden bg-gray-100">
            {/* Left Page */}
            <div className="relative bg-white border-r border-gray-300">
              {leftPageNum <= (numPages || 0) ? (
                <Page 
                  pageNumber={leftPageNum} 
                  width={pageWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ) : (
                <div 
                  className="flex items-center justify-center text-gray-400 bg-gray-50"
                  style={{ width: pageWidth, height: pageWidth * 1.414 }}
                >
                  End
                </div>
              )}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
            </div>

            {/* Right Page */}
            <div className="relative bg-white">
              {rightPageNum <= (numPages || 0) ? (
                <Page 
                  pageNumber={rightPageNum} 
                  width={pageWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ) : (
                <div 
                  className="flex items-center justify-center text-gray-400 bg-gray-50"
                  style={{ width: pageWidth, height: pageWidth * 1.414 }}
                />
              )}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </Document>
      );
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 md:px-6">
      
      {/* SECTION 1: BOOK VIEWER (Horizontal / Landscape) */}
      <div className="mb-12">
        <div className="flex items-center justify-center gap-4 md:gap-8 min-h-[400px] md:min-h-[500px] bg-gray-200/50 rounded-2xl p-4 md:p-8 relative">
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg border-gray-200 bg-white hover:bg-gray-50 z-10 shrink-0"
            onClick={prevSpread}
            disabled={currentSpread === 0}
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </Button>

          {/* The Book */}
          <div className="flex-1 flex justify-center items-center perspective-[2000px] overflow-hidden">
            {renderBookContent()}
          </div>

          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg border-gray-200 bg-white hover:bg-gray-50 z-10 shrink-0"
            onClick={nextSpread}
            disabled={currentSpread === totalSpreads - 1}
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </Button>

          {/* Page Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1 rounded-full text-xs backdrop-blur-sm">
            {currentSpread === 0 ? "Cover" : `Spread ${currentSpread} / ${totalSpreads - 1}`}
            {numPages && <span className="ml-2 opacity-70">({numPages} pages)</span>}
          </div>
        </div>
      </div>

      {/* SECTION 2: ACTIONS & CONTROLS (Below the book) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Card 1: Primary Actions */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col justify-center gap-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Printer className="h-4 w-4 text-orange-500" />
              Physical Production
            </h3>
            <Button 
              className="w-full h-12 text-base font-semibold shadow-md bg-orange-600 hover:bg-orange-700 transition-all"
              onClick={handleOrderPhysicalBook}
              disabled={isOrdering}
            >
              {isOrdering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Order Physical Book"
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-medium border-orange-200 text-orange-700 hover:bg-orange-50"
              onClick={handleCreateWithLaney}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Create with Laney AI
            </Button>
          </div>
        </div>

        {/* Card 2: Digital Share */}
        <Card className="border-gray-200 shadow-sm h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 className="h-4 w-4 text-blue-500" />
              Digital Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button variant="secondary" className="w-full justify-between h-10">
              <span className="flex items-center text-sm"><Download className="mr-2 h-4 w-4" /> Save PDF</span>
              <span className="text-xs text-muted-foreground">24 MB</span>
            </Button>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Social Share</p>
              <div className="flex gap-3">
                <Button size="icon" variant="outline" className="flex-1 h-10 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="flex-1 h-10 hover:bg-yellow-50 hover:text-yellow-500 hover:border-yellow-200">
                  <Ghost className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="flex-1 h-10 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Access Code & QR */}
        <Card className="border-gray-200 shadow-sm h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-green-500" />
              Guest Access
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="shrink-0 bg-white p-2 rounded-lg border border-gray-100">
               <img 
                src={qrCodeUrl} 
                alt="QR" 
                className="w-24 h-24 mix-blend-multiply" 
              />
            </div>
            <div className="flex flex-col justify-between w-full">
              <div className="flex items-center gap-2 p-1.5 pl-3 bg-gray-50 rounded border border-gray-100 mb-2">
                <code className="text-xs flex-1 truncate text-gray-500 font-mono">{viewerLink}</code>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={copyToClipboard}>
                  {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <Button variant="link" className="px-0 text-xs h-auto justify-start text-muted-foreground hover:text-orange-600" onClick={() => window.open(viewerLink, '_blank')}>
                 Open public view <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </main>
  );
};

export default PartnerDashboard;