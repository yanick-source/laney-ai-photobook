import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, Bookmark, Sparkles, Plus, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: FolderOpen, label: "Projecten", path: "/projects" },
  { icon: Bookmark, label: "Sjablonen", path: "/templates" },
  { icon: Sparkles, label: "Laney AI", path: "/ai" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-20 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Menu button */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border">
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* New button */}
      <div className="flex justify-center py-4">
        <Link
          to="/create"
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-lg px-2 py-3 text-xs font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn(isActive && "text-primary")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
