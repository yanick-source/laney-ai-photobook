import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Share2, Download, ExternalLink, Copy, Check, 
  Instagram, Linkedin, Ghost, Printer, Sparkles, 
  ChevronLeft, ChevronRight
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Mock data for the book visualization
const MOCK_PAGES = [
  "https://images.unsplash.com/photo-1544634280-5a3d46332159?q=80&w=2664&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1519671482538-581b5db3bcc6?q=80&w=3024&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=2976&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2970&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1605218427368-35b8013eb6ff?q=80&w=2970&auto=format&fit=crop", 
];

interface PartnerDashboardProps {
  isAdmin?: boolean;
}

const PartnerDashboard = ({ isAdmin = false }: PartnerDashboardProps) => {
  const { eventId } = useParams();
  
  const [copied, setCopied] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0); 
  
  const viewerLink = `${window.location.origin}/view/${eventId || 'demo'}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(viewerLink)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(viewerLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Book Navigation Logic
  const totalSpreads = Math.ceil((MOCK_PAGES.length - 1) / 2) + 1;

  const nextSpread = () => {
    if (currentSpread < totalSpreads - 1) setCurrentSpread(prev => prev + 1);
  };

  const prevSpread = () => {
    if (currentSpread > 0) setCurrentSpread(prev => prev - 1);
  };

  // Helper to render the current view
  const renderBookContent = () => {
    if (currentSpread === 0) {
      // COVER VIEW (Single Page - Landscape)
      return (
        <div className="relative w-full max-w-md aspect-[1.414/1] shadow-2xl rounded-r-lg overflow-hidden transform transition-all duration-500 ease-in-out">
           <img src={MOCK_PAGES[0]} alt="Cover" className="w-full h-full object-cover" />
           <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent" />
        </div>
      );
    } else {
      // SPREAD VIEW (Two Landscape Pages)
      const leftIndex = 1 + (currentSpread - 1) * 2;
      const rightIndex = leftIndex + 1;
      const leftPage = MOCK_PAGES[leftIndex];
      const rightPage = MOCK_PAGES[rightIndex];

      return (
        <div className="flex w-full max-w-6xl shadow-2xl rounded-lg overflow-hidden bg-gray-100">
          <div className="flex-1 aspect-[1.414/1] bg-white relative border-r border-gray-300">
             {leftPage ? (
               <img src={leftPage} alt={`Page ${leftIndex}`} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">End</div>
             )}
             <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
          </div>

          <div className="flex-1 aspect-[1.414/1] bg-white relative">
             {rightPage ? (
               <img src={rightPage} alt={`Page ${rightIndex}`} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50" />
             )}
             <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
          </div>
        </div>
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
          <div className="flex-1 flex justify-center items-center perspective-[2000px]">
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
            {currentSpread === 0 ? "Cover" : `View ${currentSpread} / ${totalSpreads - 1}`}
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
            <Button className="w-full h-12 text-base font-semibold shadow-md bg-orange-600 hover:bg-orange-700 transition-all">
              Order Physical Book
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-medium border-orange-200 text-orange-700 hover:bg-orange-50"
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