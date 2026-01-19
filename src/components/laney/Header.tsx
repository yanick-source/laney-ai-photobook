import { Button } from "@/components/ui/button";
import { ShoppingCart, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LaneyLogo } from "./LaneyLogo";
import { UserMenu } from "@/components/auth/UserMenu";

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between w-full border-b border-border bg-background/80 backdrop-blur-sm">
      {/* Laney Logo and Branding - Left Top - Clickable */}
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <LaneyLogo size="md" />
      </Link>

      <div className="flex items-center gap-3">
        <Link to="/checkout">
          <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
            <ShoppingCart className="h-4 w-4" />
            Order
          </Button>
        </Link>
        
        <LanguageSwitcher />
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        
        <UserMenu />
      </div>
    </header>
  );
}
