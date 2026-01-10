import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft as PanelToggleLeft,
  ChevronRight as PanelToggleRight,
  Home,
  BookOpen,
  Image,
  Settings,
  ShoppingCart,
  User,
  HelpCircle,
  Layout
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "templates", label: "Sjablonen", icon: Layout, href: "/templates" },
  { id: "projects", label: "Projecten", icon: BookOpen, href: "/projects" },
  { id: "editor", label: "Editor", icon: Image, href: "/editor" },
  { id: "shop", label: "Winkel", icon: ShoppingCart, href: "/shop" },
  { id: "settings", label: "Instellingen", icon: Settings, href: "/settings" },
  { id: "profile", label: "Profiel", icon: User, href: "/profile" },
  { id: "help", label: "Help", icon: HelpCircle, href: "/help" },
];

interface GlobalSidebarProps {
  currentPage?: string;
}

export function GlobalSidebar({ currentPage }: GlobalSidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={cn(
      "fixed right-0 top-0 h-screen bg-card border-l border-border shadow-lg transition-all duration-300 z-50",
      isSidebarOpen ? "w-64" : "w-16"
    )}>
      {/* Toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {isSidebarOpen && <h3 className="font-semibold text-foreground">Menu</h3>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="ml-auto"
        >
          {isSidebarOpen ? (
            <PanelToggleRight className="h-4 w-4" />
          ) : (
            <PanelToggleLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation items */}
      <nav className="p-4">
        <div className={cn(
          "space-y-2",
          !isSidebarOpen && "flex flex-col items-center space-y-3"
        )}>
          {sidebarItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                currentPage === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                !isSidebarOpen && "justify-center p-2"
              )}
            >
              <item.icon className={cn(
                "flex-shrink-0",
                isSidebarOpen ? "h-5 w-5" : "h-6 w-6"
              )} />
              {isSidebarOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </a>
          ))}
        </div>
      </nav>

      {/* User section (only when open) */}
      {isSidebarOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Gebruiker</p>
              <p className="text-xs text-muted-foreground truncate">user@example.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
