import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, FolderOpen, Settings, LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function UserMenu() {
  const { user, profile, isLoading, isAuthenticated, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Uitloggen mislukt',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Uitgelogd',
        description: 'Tot ziens!'
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Button>
    );
  }

  // Not authenticated - show sign in button
  if (!isAuthenticated) {
    return (
      <Link to="/auth">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Inloggen</span>
        </Button>
      </Link>
    );
  }

  // Get display name and initials
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Gebruiker';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
              {user?.email}
            </span>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to="/projects" className="flex items-center gap-2 cursor-pointer">
            <FolderOpen className="h-4 w-4" />
            Mijn Projecten
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            Instellingen
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Uitloggen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
