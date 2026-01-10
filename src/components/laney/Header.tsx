import { Button } from "@/components/ui/button";
import { Bell, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          L
        </div>
        <span className="text-xl font-semibold text-foreground">Laney</span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" className="gap-2 border-border">
          <CalendarCheck className="h-4 w-4" />
          Begin je proefperiode
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          JD
        </div>
      </div>
    </header>
  );
}
