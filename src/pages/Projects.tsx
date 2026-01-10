import { MainLayout } from "@/components/laney/MainLayout";
import { Link } from "react-router-dom";
import { FolderOpen, MoreVertical, Clock, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockProjects = [
  {
    id: 1,
    title: "Zomer Vakantie 2024",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop",
    photos: 48,
    pages: 24,
    lastEdited: "2 dagen geleden",
    status: "In bewerking",
  },
  {
    id: 2,
    title: "Bruiloft Sophie & Mark",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=200&fit=crop",
    photos: 120,
    pages: 40,
    lastEdited: "1 week geleden",
    status: "Voltooid",
  },
  {
    id: 3,
    title: "Baby Emma's Eerste Jaar",
    thumbnail: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=200&fit=crop",
    photos: 85,
    pages: 32,
    lastEdited: "3 weken geleden",
    status: "Voltooid",
  },
  {
    id: 4,
    title: "Familie Reünie",
    thumbnail: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=200&fit=crop",
    photos: 62,
    pages: 28,
    lastEdited: "1 maand geleden",
    status: "In bewerking",
  },
];

const Projects = () => {
  return (
    <MainLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mijn Projecten</h1>
            <p className="mt-1 text-muted-foreground">
              Beheer en bewerk al je fotoboek projecten
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <FolderOpen className="mr-2 h-4 w-4" />
              Alle projecten
            </Button>
            <Link to="/create">
              <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                Nieuw project
              </Button>
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockProjects.map((project) => (
            <div
              key={project.id}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[3/2] overflow-hidden">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <button className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4 text-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-semibold text-foreground line-clamp-1">{project.title}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      project.status === "Voltooid"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Image className="h-4 w-4" />
                    {project.photos} foto's
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {project.lastEdited}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (hidden when projects exist) */}
        {mockProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 rounded-full bg-secondary p-6">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">Nog geen projecten</h2>
            <p className="mb-6 text-muted-foreground">
              Begin met het maken van je eerste fotoboek
            </p>
            <Link to="/create">
              <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                Maak je eerste fotoboek
              </Button>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Projects;
