import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Index from "./pages/Index";
import CreatePhotobook from "./pages/CreatePhotobook";
import AICreationFlow from "./pages/AICreationFlow";
import PhotobookEditor from "./pages/PhotobookEditor";
import Checkout from "./pages/Checkout";
import Projects from "./pages/Projects";
import Templates from "./pages/Templates";
import AI from "./pages/AI";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SidebarProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<CreatePhotobook />} />
            <Route path="/ai-creation" element={<AICreationFlow />} />
            <Route path="/editor" element={<PhotobookEditor />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/ai" element={<AI />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SidebarProvider>
  </QueryClientProvider>
);

export default App;
