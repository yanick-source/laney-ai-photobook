import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, LayoutTemplate, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: FolderOpen, label: "Projecten", path: "/projects" },
  { icon: LayoutTemplate, label: "Sjablonen", path: "/templates" },
  { icon: Sparkles, label: "Laney AI", path: "/ai" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold gradient-text">Laney</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
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
      </div>
    </aside>
  );
}
