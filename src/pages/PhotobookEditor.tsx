import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getPhotobook } from "@/lib/photobookStorage";
import { MainLayout } from "@/components/laney/MainLayout";
import { 
  X, 
  Download, 
  Share2, 
  Settings, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Type, 
  Palette, 
  Layout, 
  Grid,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShoppingCart,
  ChevronLeft as PanelToggleLeft,
  ChevronRight as PanelToggleRight
} from "lucide-react";

interface PhotobookPage {
  id: string;
  layout: "full" | "two-photo" | "collage" | "text";
  photos: string[];
  text?: string;
  background: string;
}

interface PhotobookData {
  id: string;
  title: string;
  photos: string[];
  metadata: {
    totalPages: number;
    photos: number;
    chapters: number;
    style: string;
    summary: string;
  };
}

const PhotobookEditor = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [photobookData, setPhotobookData] = useState<PhotobookData | null>(null);
  const [pages, setPages] = useState<PhotobookPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load photobook data from IndexedDB
    const loadPhotobook = async () => {
      try {
        const data = await getPhotobook();
        if (data) {
          setPhotobookData(data);
          const generatedPages = generatePages(data.photos, data.metadata.totalPages, data.title);
          setPages(generatedPages);
        }
      } catch (error) {
        console.error("Error loading photobook:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPhotobook();
  }, []);

  const generatePages = (photos: string[], targetPages: number, title: string): PhotobookPage[] => {
    const result: PhotobookPage[] = [];
    let photoIndex = 0;
    
    // Cover page
    result.push({
      id: "cover",
      layout: "full",
      photos: photos[photoIndex] ? [photos[photoIndex++]] : [],
      text: title || "Mijn Fotoboek",
      background: "white",
    });

    // Generate content pages - continue until ALL photos are used
    const layouts: Array<"full" | "two-photo" | "collage"> = ["full", "two-photo", "collage"];
    let pageNumber = 1;
    
    while (photoIndex < photos.length) {
      const layout = layouts[pageNumber % 3];
      const pagePhotos: string[] = [];
      
      if (layout === "full" && photos[photoIndex]) {
        pagePhotos.push(photos[photoIndex++]);
      } else if (layout === "two-photo") {
        if (photos[photoIndex]) pagePhotos.push(photos[photoIndex++]);
        if (photos[photoIndex]) pagePhotos.push(photos[photoIndex++]);
      } else if (layout === "collage") {
        for (let j = 0; j < 4 && photos[photoIndex]; j++) {
          pagePhotos.push(photos[photoIndex++]);
        }
      }
      
      if (pagePhotos.length > 0) {
        result.push({
          id: `page-${pageNumber}`,
          layout,
          photos: pagePhotos,
          background: pageNumber % 2 === 0 ? "white" : "cream",
        });
        pageNumber++;
      }
    }
    
    return result;
  };

  const handleClose = () => {
    navigate("/");
  };

  const tools = [
    { id: "select", icon: Grid, label: "Selecteer" },
    { id: "text", icon: Type, label: "Tekst" },
    { id: "layout", icon: Layout, label: "Layout" },
    { id: "palette", icon: Palette, label: "Kleuren" },
  ];

  const handleExport = () => {
    console.log("Exporting photobook...");
  };

  const handleShare = () => {
    console.log("Sharing project...");
  };

  const currentPageData = pages[currentPage];

  const renderPageContent = () => {
    if (!currentPageData) {
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <p>Geen pagina geladen</p>
        </div>
      );
    }

    const { layout, photos, text } = currentPageData;

    if (layout === "full" && photos.length > 0) {
      return (
        <div className="relative h-full w-full">
          <img
            src={photos[0]}
            alt="Full page"
            className="h-full w-full object-cover"
          />
          {text && (
            <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/50 p-4 text-center">
              <h2 className="text-2xl font-bold text-white">{text}</h2>
            </div>
          )}
        </div>
      );
    }

    if (layout === "two-photo") {
      return (
        <div className="grid h-full grid-cols-2 gap-2 p-4">
          {photos.map((photo, index) => (
            <div key={index} className="overflow-hidden rounded-lg">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      );
    }

    if (layout === "collage") {
      return (
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-2 p-4">
          {photos.map((photo, index) => (
            <div key={index} className="overflow-hidden rounded-lg">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <Layout className="mx-auto mb-2 h-12 w-12" />
          <p>Sleep foto's naar deze pagina</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Fotoboek laden...</p>
        </div>
      </div>
    );
  }

  if (!photobookData) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">Geen fotoboek gevonden</p>
            <Button onClick={() => navigate("/ai-creation")}>
              Start een nieuw fotoboek
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="font-semibold text-foreground">{photobookData.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Pagina {currentPage + 1} van {pages.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-border">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="px-3 text-sm text-muted-foreground">{zoomLevel}%</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>

                <Button 
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground" 
                  onClick={() => navigate("/checkout")}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Bestellen
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Left sidebar - Tools */}
          <div className="w-20 flex-shrink-0 border-r border-border bg-card p-2">
            <div className="space-y-2">
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-14 w-full flex-col gap-1 p-0",
                    selectedTool === tool.id && "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                  )}
                  onClick={() => setSelectedTool(tool.id)}
                >
                  <tool.icon className="h-4 w-4" />
                  <span className="text-xs">{tool.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="flex flex-1 flex-col items-center justify-center bg-muted/30 p-8">
            <div 
              className="aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
            >
              {renderPageContent()}
            </div>

            {/* Page navigation */}
            <div className="mt-6 flex items-center gap-4 rounded-full border border-border bg-card px-4 py-2 shadow-lg">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[80px] text-center text-sm text-muted-foreground">
                {currentPage + 1} / {pages.length}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                disabled={currentPage === pages.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right sidebar - Page thumbnails */}
          <div className={cn(
            "flex-shrink-0 overflow-y-auto border-l border-border bg-card transition-all duration-300",
            isSidebarOpen ? "w-64 p-4" : "w-16"
          )}>
            {/* Toggle button */}
            <div className="flex items-center justify-between mb-4">
              {isSidebarOpen && <h3 className="font-semibold text-foreground">Pagina's</h3>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="ml-auto"
              >
                {isSidebarOpen ? (
                  <PanelToggleRight className="h-4 w-4" />
                ) : (
                  <PanelToggleLeft className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Page thumbnails */}
            <div className={cn(
              "space-y-3",
              !isSidebarOpen && "flex flex-col items-center space-y-2"
            )}>
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => setCurrentPage(index)}
                  className={cn(
                    "overflow-hidden rounded-lg border-2 transition-all",
                    isSidebarOpen ? "w-full" : "w-12 h-9",
                    currentPage === index 
                      ? "border-primary shadow-lg" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "bg-muted",
                    isSidebarOpen ? "aspect-[4/3]" : "w-full h-full"
                  )}>
                    {page.photos[0] ? (
                      <img
                        src={page.photos[0]}
                        alt={`Page ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className={cn(
                        "flex items-center justify-center text-muted-foreground",
                        isSidebarOpen ? "h-full" : "h-full w-full"
                      )}>
                        <Layout className={cn(
                          isSidebarOpen ? "h-6 w-6" : "h-4 w-4"
                        )} />
                      </div>
                    )}
                  </div>
                  {isSidebarOpen && (
                    <div className="bg-card p-2 text-xs text-muted-foreground">
                      {index === 0 ? "Cover" : `Pagina ${index}`}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PhotobookEditor;