import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { Header } from "@/components/laney/Header";
import { MainLayout } from "@/components/laney/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary"; 
import Index from "./pages/Index";
import AICreationFlow from "./pages/AICreationFlow";
import PhotobookEditor from "./pages/PhotobookEditor";
import Checkout from "./pages/Checkout";
import Projects from "./pages/Projects";
import Templates from "./pages/Templates";
import AI from "./pages/AI";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import EventGuestUpload from "./pages/Partner/Guest/EventGuestUpload";
import PartnerLogin from "./pages/Partner/PartnerLogin";
import PartnerDashboard from "./pages/Partner/PartnerDashboard";
import FoldableViewer from "./pages/Partner/Guest/FoldableViewer";

const queryClient = new QueryClient();
const LayoutRoute = ({ children }: { children: React.ReactNode }) => (
  <MainLayout>{children}</MainLayout>
);
const App = () => (
  <QueryClientProvider client={queryClient}>
    <SidebarProvider>
      <TooltipProvider>
        <ErrorBoundary> {/* ErrorBoundary applied here */}
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ai-creation" element={<AICreationFlow />} />
              <Route path="/editor" element={<PhotobookEditor />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/ai" element={<AI />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/partner/login" element={<PartnerLogin />} />
              <Route path="/partner/dashboard" element={<PartnerDashboard />} />
              <Route path="/upload/:eventId" element={<EventGuestUpload />} />
              <Route path="/upload-test" element={<EventGuestUpload />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </SidebarProvider>
  </QueryClientProvider>
);

export default App;