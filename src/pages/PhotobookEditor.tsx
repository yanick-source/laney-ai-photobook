import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/components/laney/UploadDropzone";
import { AIProgress } from "@/components/laney/AIProgress";
import { ArrowRight, Sparkles, X, Image as ImageIcon, Download, Share2, Settings, Undo, Redo, ZoomIn, ZoomOut, Type, Palette, Layout, Grid } from "lucide-react";

type FlowState = "upload" | "processing" | "preview" | "editing";

interface PhotobookPage {
  id: string;
  layout: string;
  photos: string[];
  text?: string;
  background: string;
}

interface PhotobookProject {
  id: string;
  title: string;
  pages: PhotobookPage[];
  metadata: {
    totalPages: number;
    photos: number;
    chapters: number;
    style: string;
  };
}

const PhotobookEditor = () => {
  const navigate = useNavigate();
  const [flowState, setFlowState] = useState<FlowState>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [project, setProject] = useState<PhotobookProject | null>(null);

  const handleClose = () => {
    navigate("/create");
  };

  const handleComplete = () => {
    // If we're in the same component, just change state
    if (flowState === "preview") {
      setFlowState("editing");
    } else {
      // If coming from elsewhere, navigate to editor
      navigate("/editor");
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Simulate upload
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setTimeout(() => {
          setFlowState("processing");
        }, 500);
      }
    }, 100);
  };

  // Simulate AI processing
  useEffect(() => {
    if (flowState === "processing") {
      const interval = setInterval(() => {
        setAiStep(prev => {
          if (prev >= 3) {
            clearInterval(interval);
            setTimeout(() => {
              setFlowState("preview");
              // Create mock project
              setProject({
                id: "project-1",
                title: "Summer Memories 2024",
                pages: Array.from({ length: 24 }, (_, i) => ({
                  id: `page-${i + 1}`,
                  layout: i % 3 === 0 ? "full" : i % 3 === 1 ? "two-photo" : "collage",
                  photos: [],
                  text: i % 4 === 0 ? `Chapter ${Math.floor(i / 4) + 1}` : "",
                  background: i % 2 === 0 ? "white" : "light-gray"
                })),
                metadata: {
                  totalPages: 24,
                  photos: uploadedFiles.length || 42,
                  chapters: 4,
                  style: "Modern Minimal"
                }
              });
            }, 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [flowState, uploadedFiles.length]);

  const tools = [
    { id: "select", icon: Grid, label: "Select" },
    { id: "text", icon: Type, label: "Text" },
    { id: "layout", icon: Layout, label: "Layout" },
    { id: "palette", icon: Palette, label: "Colors" },
  ];

  const handleSave = () => {
    console.log("Saving project...");
    // Implement save functionality
  };

  const handleExport = () => {
    console.log("Exporting photobook...");
    // Implement export functionality
  };

  const handleShare = () => {
    console.log("Sharing project...");
    // Implement share functionality
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-pink-50">
      {/* Header */}
      {flowState === "editing" && (
        <header className="border-b border-orange-200 bg-white/90 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  <X className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="font-semibold text-gray-900">{project?.title || "Untitled Photobook"}</h1>
                  <p className="text-sm text-gray-600">Page {currentPage + 1} of {project?.metadata.totalPages || 24}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center border border-orange-200 rounded-lg">
                  <Button variant="ghost" size="sm" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="px-3 text-sm text-gray-600">{zoomLevel}%</span>
                  <Button variant="ghost" size="sm" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Redo className="w-4 h-4" />
                  </Button>
                </div>

                <Button variant="ghost" size="sm" onClick={handleSave}>
                  <Settings className="w-4 h-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>

                <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white" onClick={handleExport}>
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <div className="container mx-auto px-6 py-8">
        {flowState === "upload" && (
          <div className="flex h-[calc(100vh-8rem)] gap-8">
            {/* Left: Upload area */}
            <div className="flex-1">
              <UploadDropzone
                onFilesSelected={handleFilesSelected}
                isDragging={false}
                setIsDragging={() => {}}
                className="h-full"
              />
            </div>

            {/* Right: AI Assistant panel */}
            <div className="w-[400px] flex-shrink-0">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-orange-200 shadow-sm p-6 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                    <p className="text-sm text-gray-600">Ready to help</p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200">
                    <p className="text-sm text-gray-700">
                      Upload your photos and I'll analyze them to understand your story. I'll look at:
                    </p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {["Location & setting", "Emotions & mood", "Timeline", "People & relationships", "Color palette"].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-orange-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <ImageIcon className="w-4 h-4" />
                      {uploadedFiles.length} photos selected
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                      disabled={isUploading}
                    >
                      Continue with AI
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {flowState === "processing" && (
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <AIProgress onComplete={() => {}} isProcessing={true} />
          </div>
        )}

        {flowState === "preview" && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-6">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">AI design complete</span>
              </div>
              <h2 className="text-3xl font-bold mb-3 text-gray-900">Your photobook is ready!</h2>
              <p className="text-gray-600">
                We've created a beautiful 24-page photobook based on your memories.
              </p>
            </div>

            {/* Preview card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-orange-200 shadow-sm p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Book preview */}
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-600">Book preview</p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-semibold mb-2 text-gray-900">Summer Memories 2024</h3>
                  <p className="text-gray-600 mb-6">
                    A story about adventure, connection, and joy of exploring together.
                  </p>

                  <div className="space-y-3 mb-8">
                    {[
                      { label: "Pages", value: "24 pages" },
                      { label: "Photos", value: `${uploadedFiles.length || 42} photos` },
                      { label: "Chapters", value: "4 chapters" },
                      { label: "Style", value: "Modern Minimal" },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={handleComplete} 
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                  >
                    Start editing your book
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {flowState === "editing" && project && (
          <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Left sidebar - Tools */}
            <div className="w-20 flex-shrink-0">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-orange-200 shadow-sm p-2">
                <div className="space-y-2">
                  {tools.map((tool) => (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full h-12 p-0 flex flex-col items-center justify-center gap-1",
                        selectedTool === tool.id && "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                      )}
                      onClick={() => setSelectedTool(tool.id)}
                    >
                      <tool.icon className="w-4 h-4" />
                      <span className="text-xs">{tool.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center - Canvas */}
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-lg border border-orange-200 overflow-hidden">
                <div 
                  className="aspect-[4/3] bg-gray-50 relative"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
                >
                  {/* Page content */}
                  <div className="absolute inset-0 p-8">
                    <div className="h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Layout className="w-12 h-12 mx-auto mb-2" />
                        <p>Page {currentPage + 1} Layout</p>
                        <p className="text-sm">Click to edit</p>
                      </div>
                    </div>
                  </div>

                  {/* Page navigation */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                    >
                      ←
                    </Button>
                    <span className="text-sm text-gray-600">
                      {currentPage + 1} / {project.metadata.totalPages}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(project.metadata.totalPages - 1, currentPage + 1))}
                      disabled={currentPage === project.metadata.totalPages - 1}
                    >
                      →
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar - Properties */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-orange-200 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Page Properties</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>Full width photo</option>
                      <option>Two photos</option>
                      <option>Photo collage</option>
                      <option>Photo with text</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["white", "light-gray", "cream", "light-blue"].map((color) => (
                        <button
                          key={color}
                          className={cn(
                            "w-full h-8 rounded border-2 border-gray-300",
                            color === "white" && "bg-white",
                            color === "light-gray" && "bg-gray-100",
                            color === "cream" && "bg-orange-50",
                            color === "light-blue" && "bg-blue-50"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page Text</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                      rows={3}
                      placeholder="Add text for this page..."
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-orange-200">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">
                    Apply Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotobookEditor;
