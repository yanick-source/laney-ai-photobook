import { useState } from "react";
import { MainLayout } from "@/components/laney/MainLayout";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "Alles" },
  { id: "wedding", label: "Bruiloft" },
  { id: "travel", label: "Reizen" },
  { id: "family", label: "Familie" },
  { id: "baby", label: "Baby" },
  { id: "birthday", label: "Verjaardag" },
  { id: "graduation", label: "Afstuderen" },
  { id: "holiday", label: "Vakantie" },
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Klassiek" },
];

const templates = [
  {
    id: 1,
    title: "Romantische Bruiloft",
    category: "wedding",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop",
    style: "Elegant",
    pages: "24-40",
  },
  {
    id: 2,
    title: "Avontuurlijke Reis",
    category: "travel",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=500&fit=crop",
    style: "Modern",
    pages: "20-32",
  },
  {
    id: 3,
    title: "Familie Momenten",
    category: "family",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=500&fit=crop",
    style: "Warm",
    pages: "24-36",
  },
  {
    id: 4,
    title: "Baby's Eerste Jaar",
    category: "baby",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=500&fit=crop",
    style: "Zacht",
    pages: "28-48",
  },
  {
    id: 5,
    title: "Zomer Vakantie",
    category: "holiday",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=500&fit=crop",
    style: "Levendig",
    pages: "20-28",
  },
  {
    id: 6,
    title: "Verjaardag Feest",
    category: "birthday",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=500&fit=crop",
    style: "Feestelijk",
    pages: "16-24",
  },
  {
    id: 7,
    title: "Afstuderen",
    category: "graduation",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=500&fit=crop",
    style: "Tijdloos",
    pages: "20-32",
  },
  {
    id: 8,
    title: "Modern Minimaal",
    category: "modern",
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&h=500&fit=crop",
    style: "Minimalistisch",
    pages: "16-28",
  },
  {
    id: 9,
    title: "Klassiek Tijdloos",
    category: "classic",
    image: "https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=400&h=500&fit=crop",
    style: "Klassiek",
    pages: "24-40",
  },
];

const Templates = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTemplates =
    activeCategory === "all"
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  return (
    <MainLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sjablonen</h1>
          <p className="mt-1 text-muted-foreground">
            Kies een sjabloon als startpunt voor je fotoboek
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                activeCategory === category.id
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((template) => (
            <Link
              key={template.id}
              to="/ai-creation"
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={template.image}
                  alt={template.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-bold text-white">{template.title}</h3>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stijl: {template.style}</span>
                  <span className="text-muted-foreground">{template.pages} pagina's</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Templates;
