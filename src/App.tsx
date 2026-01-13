import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { Header } from "@/components/laney/Header";
import Index from "./pages/Index";
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
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
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
