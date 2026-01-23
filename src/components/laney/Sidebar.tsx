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
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-sidebar-border bg-sidebar w-16">
      <div className="flex h-full flex-col">
        {/* Navigation */}
        <nav className="flex flex-col items-center py-4 space-y-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center justify-center rounded-lg transition-all duration-200 p-2.5"
                title={item.label}
              >
                <item.icon className={cn(
                  "flex-shrink-0 h-6 w-6",
                  isActive && "text-primary"
                )} />
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
