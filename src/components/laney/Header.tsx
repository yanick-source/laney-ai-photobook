import { Button } from "@/components/ui/button";
import { Plus, Bell, User } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/create">
          <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" />
            Nieuw fotoboek
          </Button>
        </Link>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
