import { MainLayout } from "@/components/laney/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, BookOpen, Palette, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

const photobooks = [
  {
    id: 1,
    title: "Zomer Herinneringen",
    cover: "https://images.unsplash.com/photo-1506905925346-921803c26973?w=400&h=300&fit=crop",
    pages: 24,
    theme: "Modern Minimal"
  },
  {
    id: 2,
    title: "Familie Avontuur",
    cover: "https://images.unsplash.com/photo-1529155223641-3e5e9b8c1c5?w=400&h=300&fit=crop",
    pages: 32,
    theme: "Warm Classic"
  },
  {
    id: 3,
    title: "Reis Verhaal",
    cover: "https://images.unsplash.com/photo-1488646953014-85c44e18e4c2?w=400&h=300&fit=crop",
    pages: 28,
    theme: "Artistic"
  },
];

const CreatePhotobook = () => {
  const [selectedBook, setSelectedBook] = useState(photobooks[0]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-pink-50">
        {/* Hero Section */}
        <div className="px-6 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Animated Laptop Showcase */}
              <div className="relative">
                <div className="relative">
                  {/* Laptop Frame */}
                  <div className="relative mx-auto max-w-lg">
                    {/* Laptop Screen */}
                    <div className="relative bg-gray-900 rounded-t-2xl p-2 shadow-2xl">
                      <div className="bg-white rounded-lg overflow-hidden">
                        {/* Screen Content - Photobook Display */}
                        <div className="relative h-64 bg-gradient-to-br from-orange-100 to-pink-100 p-4">
                          <div className="grid grid-cols-2 gap-2 h-full">
                            {/* Left Page */}
                            <div className="bg-white rounded shadow-sm p-3 flex flex-col items-center justify-center">
                              <div className="text-center">
                                <ImageIcon className="h-8 w-8 text-orange-500 mb-2" />
                                <p className="text-xs font-medium text-gray-700">Zomer 2024</p>
                              </div>
                            </div>
                            {/* Right Page */}
                            <div className="bg-white rounded shadow-sm p-3">
                              <div className="space-y-2">
                                <div className="h-2 bg-gray-200 rounded"></div>
                                <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Laptop Keyboard */}
                    <div className="bg-gray-800 rounded-b-2xl h-8 flex items-center justify-center">
                      <div className="flex gap-1">
                        <div className="w-8 h-1 bg-gray-600 rounded"></div>
                        <div className="w-8 h-1 bg-gray-600 rounded"></div>
                        <div className="w-16 h-1 bg-gray-600 rounded"></div>
                        <div className="w-8 h-1 bg-gray-600 rounded"></div>
                        <div className="w-8 h-1 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                    
                    {/* Floating Photobooks */}
                    <div className="absolute -top-4 -right-4 space-y-3">
                      {/* First uploaded photo */}
                      <div
                        className="relative group cursor-pointer transition-all duration-300 hover:scale-105"
                        style={{
                          animation: `float 0s ease-in-out infinite alternate`,
                          right: "0px"
                        }}
                      >
                        <div className="relative w-20 h-24 bg-white rounded-lg shadow-lg overflow-hidden border-2 border-orange-200">
                          <img 
                            src="https://ucarecdn.com/uploads/1/65f8b8c-9d7b-4e8c-9c1a5e5e5f3a8c3a3.jpg" 
                            alt="Uploaded photo"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                            <p className="text-white text-xs font-medium truncate">Uploaded photo</p>
                          </div>
                        </div>
                      </div>
                      
                      {photobooks.slice(1).map((book, index) => (
                        <div
                          key={book.id}
                          className="relative group cursor-pointer transition-all duration-300 hover:scale-105"
                          style={{
                            animation: `float ${index * 0.5}s ease-in-out infinite alternate`,
                            right: `${index * 60 + 20}px`
                          }}
                        >
                          <div className="relative w-20 h-24 bg-white rounded-lg shadow-lg overflow-hidden border-2 border-orange-200">
                            <img 
                              src={book.cover} 
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                              <p className="text-white text-xs font-medium truncate">{book.title}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-pink-400/20 blur-3xl -z-10"></div>
                  </div>
                </div>
              </div>

              {/* Right: Content */}
              <div className="text-center lg:text-left">
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">
                 <span className="text-gray-900"> Binnen 5min een </span>
                  <span className="bg-gradient-to-r from-laney-orange to-laney-pink bg-clip-text text-transparent bg-clip-text">Fotoboek</span>

                </h1>
                
                <p className="mb-8 text-xl text-gray-600 max-w-lg">
                  Transformeer je herinneringen in prachtige, professionele fotoboeken met Laney AI
                </p>

                {/* Features */}
                <div className="mb-12 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-laney-orange/20">
                      <BookOpen className="h-6 w-6 text-laney-orange" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Professionele Layouts</h3>
                      <p className="text-gray-600">AI-ontworpen ontwerpen voor elke gelegenheid</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-laney-pink/20">
                      <Palette className="h-6 w-6 text-laney-pink" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Slimme Thema's</h3>
                      <p className="text-gray-600">Automatische kleur- en stijlselectie</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-200">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Snelle Creatie</h3>
                      <p className="text-gray-600">Klaar in minuten, geen ontwerpervaring nodig</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="space-y-4">
                  <Link to="/ai-creation">
                    <Button
                      size="lg"
                      className="w-full gap-3 bg-gradient-to-r from-laney-orange to-laney-pink px-8 py-6 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
                    >
                      Begin met Creëren
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  
                  <p className="text-sm text-laney-foreground">
                    Geen account nodig • Probeer gratis • Geen creditcard vereist
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS for animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .text-gradient {
            background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default CreatePhotobook;
