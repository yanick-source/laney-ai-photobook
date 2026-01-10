import { Link } from "react-router-dom";
import { Users } from "lucide-react";

const templates = [
  {
    id: 1,
    title: "Zomervakantie",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=500&fit=crop",
    badge: "Trending",
    usageCount: "12.453",
  },
  {
    id: 2,
    title: "Bruiloft",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop",
    badge: "Populair",
    usageCount: "8.921",
  },
  {
    id: 3,
    title: "Baby's Eerste Jaar",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=500&fit=crop",
    badge: null,
    usageCount: "7.234",
  },
  {
    id: 4,
    title: "Herfst Herinneringen",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    badge: "Nieuw",
    usageCount: "5.612",
  },
  {
    id: 5,
    title: "Familie Portret",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=500&fit=crop",
    badge: "Trending",
    usageCount: "4.876",
  },
];

export function TemplateGrid() {
  return (
    <section className="px-6 py-6">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Trending sjablonen</h2>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
        {templates.map((template) => (
          <Link
            key={template.id}
            to="/create"
            className="group relative min-w-[240px] flex-shrink-0 overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="aspect-[4/5]">
              <img
                src={template.image}
                alt={template.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Badge */}
              {template.badge && (
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                    {template.badge}
                  </span>
                </div>
              )}
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="mb-1 text-lg font-semibold text-white">{template.title}</h3>
                <div className="flex items-center gap-1.5 text-sm text-white/80">
                  <Users className="h-4 w-4" />
                  <span>{template.usageCount} keer gebruikt</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
