import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const templates = [
  {
    id: 1,
    title: "Romantische Bruiloft",
    category: "Bruiloft",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
    color: "from-rose-500/80 to-pink-600/80",
  },
  {
    id: 2,
    title: "Avontuurlijke Reis",
    category: "Reizen",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop",
    color: "from-blue-500/80 to-cyan-600/80",
  },
  {
    id: 3,
    title: "Familie Momenten",
    category: "Familie",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop",
    color: "from-amber-500/80 to-orange-600/80",
  },
  {
    id: 4,
    title: "Baby's Eerste Jaar",
    category: "Baby",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=300&fit=crop",
    color: "from-pink-400/80 to-rose-500/80",
  },
  {
    id: 5,
    title: "Zomer Vakantie",
    category: "Vakantie",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
    color: "from-teal-500/80 to-emerald-600/80",
  },
];

export function TemplateGrid() {
  return (
    <section className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Populaire sjablonen</h2>
          <p className="mt-1 text-muted-foreground">Begin snel met een van onze mooiste designs</p>
        </div>
        <Link 
          to="/templates" 
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Bekijk alles
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
        {templates.map((template) => (
          <Link
            key={template.id}
            to="/create"
            className="group relative min-w-[280px] flex-shrink-0 overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="aspect-[4/3]">
              <img
                src={template.image}
                alt={template.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${template.color} opacity-60 transition-opacity group-hover:opacity-70`} />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <span className="mb-1 text-xs font-medium uppercase tracking-wider text-white/80">
                  {template.category}
                </span>
                <h3 className="text-lg font-bold text-white">{template.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
