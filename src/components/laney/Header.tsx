import { Button } from "@/components/ui/button";
import { Plus, Bell, User, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between w-full border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      {/* Laney Logo and Branding - Left Top - Clickable */}
      <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold gradient-text">Laney</span>
      </Link>

      <div className="flex items-center gap-3">
        <Link to="/ai-creation">
          <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" />
            {t('header.newPhotobook')}
          </Button>
        </Link>
        
        <LanguageSwitcher />
        
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
