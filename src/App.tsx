import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, useLocation, Link } from "react-router-dom";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { Header } from "@/components/laney/Header";
import { MainLayout } from "@/components/laney/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { FileUp, RefreshCw } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

// Pages
import Index from "./pages/Index";
import AICreationFlow from "./pages/AICreationFlow";
import PhotobookEditor from "./pages/PhotobookEditor";
import Checkout from "./pages/Checkout";
import Projects from "./pages/Projects";
import Templates from "./pages/Templates";
import AI from "./pages/AI";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Beta from "./pages/Beta";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import TermsConditions from "./pages/TermsConditions";

// Partner & Guest Pages
import EventGuestUpload from "./pages/Guest/EventGuestUpload";
import PartnerLogin from "./pages/Partner/PartnerLogin";
import PartnerDashboard from "./pages/Partner/PartnerDashboard";
import FoldableViewer from "./pages/Guest/FoldableViewer";

const queryClient = new QueryClient();

// 1. Main App Layout (Header + Sidebar)
const MainAppLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <MainLayout>{children}</MainLayout>
  </>
);

// 2. Partner & Business Layout (Custom Header)
const PartnerLayout = () => {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Check if we are in the Admin Dashboard to show the upload button
  const isAdminDashboard = location.pathname.includes('/laney-admin/dashboard');

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      setIsUploading(true);
      toast.info("Laney Backend: Processing PDF...");
      setTimeout(() => {
        setIsUploading(false);
        toast.success("Book updated successfully!");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* GLOBAL PARTNER HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/Laney Business.png" 
              alt="Laney Business" 
              className="h-28 w-auto" // UPDATED SIZE
            />
          </div>
          
          <div className="flex items-center gap-4">
             {/* Upload Trigger - Only visible on Admin Dashboard */}
             {isAdminDashboard && (
               <>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="application/pdf" 
                    className="hidden" 
                  />
                 <Button 
                    variant="default"
                    size="sm" 
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className="hidden md:flex bg-gray-900 text-white hover:bg-gray-800"
                  >
                    {isUploading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                    {isUploading ? "Processing..." : "Update PDF"}
                 </Button>
               </>
             )}
            
            {/* Logic: Don't show logout on public view/upload pages, only inside partner portal */}
            {location.pathname.includes('/partner') && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/partner/login">Log out</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Page Content */}
      <Outlet />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SidebarProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* --- Partner & Guest Routes (Wrapped in PartnerLayout) --- */}
              <Route element={<PartnerLayout />}>
                <Route path="/upload/:eventId" element={<EventGuestUpload />} />
                <Route path="/upload-test" element={<EventGuestUpload />} />
                <Route path="/view/:shareId" element={<FoldableViewer />} />
                <Route path="/partner/login" element={<PartnerLogin />} />
                <Route path="/partner/dashboard" element={<PartnerDashboard isAdmin={false} />} />
                <Route path="/partner/dashboard/:eventId" element={<PartnerDashboard isAdmin={false} />} />
                {/* Secret Admin Route */}
                <Route path="/laney-admin/dashboard/:eventId" element={<PartnerDashboard isAdmin={true} />} />
              </Route>

              {/* --- Main App Routes (Wrapped in MainAppLayout) --- */}
              <Route path="/" element={<MainAppLayout><Index /></MainAppLayout>} />
              <Route path="/ai-creation" element={<MainAppLayout><AICreationFlow /></MainAppLayout>} />
              <Route path="/editor" element={<MainAppLayout><PhotobookEditor /></MainAppLayout>} />
              <Route path="/checkout" element={<MainAppLayout><Checkout /></MainAppLayout>} />
              <Route path="/projects" element={<MainAppLayout><Projects /></MainAppLayout>} />
              <Route path="/templates" element={<MainAppLayout><Templates /></MainAppLayout>} />
              <Route path="/ai" element={<MainAppLayout><AI /></MainAppLayout>} />
              
              {/* Beta landing page - standalone without layout */}
              <Route path="/beta" element={<Beta />} />
              
              {/* Legal pages */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </SidebarProvider>
  </QueryClientProvider>
);

export default App;