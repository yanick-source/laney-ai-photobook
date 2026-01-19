import { useState, useEffect } from "react";
import { MainLayout } from "@/components/laney/MainLayout";
import { Link, useNavigate } from "react-router-dom";
import { FolderOpen, MoreVertical, Clock, Image, Cloud, Monitor, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getCloudPhotobooks, deleteCloudPhotobook, syncPhotobookToCloud } from "@/lib/cloudPhotobookStorage";
import { getAllLocalPhotobooks, deletePhotobook } from "@/lib/photobookStorage";
import { PhotobookData } from "@/lib/photobookStorage";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectWithMeta extends PhotobookData {
  isCloud: boolean;
  lastEdited: string;
  thumbnail?: string;
}

const Projects = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<ProjectWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ProjectWithMeta | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Load projects
  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      
      try {
        const allProjects: ProjectWithMeta[] = [];

        // Load cloud projects if authenticated
        if (isAuthenticated) {
          const cloudProjects = await getCloudPhotobooks();
          cloudProjects.forEach(p => {
            allProjects.push({
              ...p,
              isCloud: true,
              lastEdited: 'Recent',
              thumbnail: p.photos?.[0]
            });
          });
        }

        // Load local projects
        const localProjects = await getAllLocalPhotobooks();
        localProjects.forEach(p => {
          // Check if already synced (has matching cloud project)
          const isAlreadySynced = allProjects.some(cp => cp.id === p.id || (cp as any).local_id === p.id);
          if (!isAlreadySynced) {
            allProjects.push({
              ...p,
              isCloud: false,
              lastEdited: 'Recent',
              thumbnail: p.photos?.[0]
            });
          }
        });

        setProjects(allProjects);
      } catch (err) {
        console.error('Error loading projects:', err);
        toast({
          title: 'Fout bij laden',
          description: 'Kon projecten niet laden.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      loadProjects();
    }
  }, [isAuthenticated, authLoading, toast]);

  // Format time ago
  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Vandaag';
    if (diffDays === 1) return 'Gisteren';
    if (diffDays < 7) return `${diffDays} dagen geleden`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`;
    return `${Math.floor(diffDays / 30)} maanden geleden`;
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.isCloud) {
        await deleteCloudPhotobook(deleteTarget.id);
      } else {
        await deletePhotobook(deleteTarget.id);
      }

      setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
      toast({
        title: 'Project verwijderd',
        description: `"${deleteTarget.title}" is verwijderd.`
      });
    } catch (err) {
      toast({
        title: 'Verwijderen mislukt',
        description: 'Kon project niet verwijderen.',
        variant: 'destructive'
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  // Handle sync to cloud
  const handleSync = async (project: ProjectWithMeta) => {
    if (!isAuthenticated) {
      toast({
        title: 'Log eerst in',
        description: 'Je moet ingelogd zijn om projecten naar de cloud te synchroniseren.',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    setSyncingId(project.id);
    try {
      const { success, cloudId } = await syncPhotobookToCloud(project);
      if (success && cloudId) {
        setProjects(prev => prev.map(p => 
          p.id === project.id ? { ...p, isCloud: true, id: cloudId } : p
        ));
        toast({
          title: 'Gesynchroniseerd',
          description: `"${project.title}" is opgeslagen in de cloud.`
        });
      } else {
        throw new Error('Sync failed');
      }
    } catch (err) {
      toast({
        title: 'Synchronisatie mislukt',
        description: 'Kon project niet naar de cloud synchroniseren.',
        variant: 'destructive'
      });
    } finally {
      setSyncingId(null);
    }
  };

  // Handle open project
  const handleOpenProject = (project: ProjectWithMeta) => {
    sessionStorage.setItem('currentPhotobookId', project.id);
    navigate('/editor');
  };

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mijn Projecten</h1>
            <p className="mt-1 text-muted-foreground">
              {isAuthenticated 
                ? 'Bekijk en bewerk al je fotoboek projecten'
                : 'Je lokale projecten op dit apparaat'
              }
            </p>
          </div>
          <div className="flex gap-3">
            {!isAuthenticated && (
              <Link to="/auth">
                <Button variant="outline" className="gap-2">
                  <Cloud className="h-4 w-4" />
                  Log in om te synchroniseren
                </Button>
              </Link>
            )}
            <Link to="/ai-creation">
              <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                Nieuw project
              </Button>
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl cursor-pointer"
                onClick={() => handleOpenProject(project)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[3/2] overflow-hidden bg-secondary">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  
                  {/* Cloud/Local indicator */}
                  <div className="absolute left-2 top-2">
                    {project.isCloud ? (
                      <div className="flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-xs text-primary-foreground">
                        <Cloud className="h-3 w-3" />
                        Cloud
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 rounded-full bg-secondary/90 px-2 py-1 text-xs text-foreground">
                        <Monitor className="h-3 w-3" />
                        Lokaal
                      </div>
                    )}
                  </div>

                  {/* Actions menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white">
                        <MoreVertical className="h-4 w-4 text-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      {!project.isCloud && isAuthenticated && (
                        <DropdownMenuItem 
                          onClick={() => handleSync(project)}
                          disabled={syncingId === project.id}
                        >
                          {syncingId === project.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Synchroniseer naar cloud
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => setDeleteTarget(project)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Verwijderen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="font-semibold text-foreground line-clamp-1">{project.title}</h3>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Image className="h-4 w-4" />
                      {project.photos?.length || 0} foto's
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
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 rounded-full bg-secondary p-6">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">Nog geen projecten</h2>
            <p className="mb-6 text-center text-muted-foreground max-w-md">
              {isAuthenticated 
                ? 'Begin met het maken van je eerste fotoboek'
                : 'Begin met het maken van een fotoboek. Maak een account aan om je projecten overal te openen.'
              }
            </p>
            <div className="flex gap-3">
              {!isAuthenticated && (
                <Link to="/auth">
                  <Button variant="outline">Account aanmaken</Button>
                </Link>
              )}
              <Link to="/ai-creation">
                <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  Maak je eerste fotoboek
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Project verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je "{deleteTarget?.title}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Projects;
