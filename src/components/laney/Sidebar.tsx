import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, LayoutTemplate, Sparkles, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: FolderOpen, label: "Projecten", path: "/projects" },
  { icon: LayoutTemplate, label: "Sjablonen", path: "/templates" },
  { icon: Sparkles, label: "Laney AI", path: "/ai" },
];

export function Sidebar() {
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <aside className={cn(
      "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-sidebar-border bg-sidebar transition-all duration-300",
      isSidebarOpen ? "w-64" : "w-16"
    )}>
      <div className="flex h-full flex-col">
        {/* Navigation */}
        <nav className={cn(
          "flex-1",
          isSidebarOpen ? "space-y-1 p-4" : "flex flex-col items-center py-4 space-y-3"
        )}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-200",
                  isSidebarOpen ? "gap-3 px-3 py-2.5" : "justify-center p-2.5",
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <item.icon className={cn(
                  "flex-shrink-0",
                  isActive && "text-primary",
                  isSidebarOpen ? "h-5 w-5" : "h-6 w-6"
                )} />
                {isSidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - only show when open */}
        {isSidebarOpen && (
          <div className="border-t border-sidebar-border p-4">
            <div className="rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Maak prachtige fotoboeken met AI
              </p>
              <Link
                to="/create"
                className="mt-2 inline-flex items-center text-sm font-semibold text-primary hover:underline"
              >
                Start nu →
              </Link>
            </div>
          </div>
        )}

        {/* Fixed Position Toggle Button - Always at Bottom */}
        <div className="h-16 flex items-center border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "w-full",
              isSidebarOpen ? "mx-4" : "mx-3"
            )}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
