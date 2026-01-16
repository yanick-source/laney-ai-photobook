import { cn } from '@/lib/utils';

interface LaneyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LaneyLogo({ className, size = 'md' }: LaneyLogoProps) {
  const sizeClasses = {
    sm: 'h-20 w-auto',
    md: 'h-24 w-auto',
    lg: 'h-28 w-auto'
  };

  return (
    <img
      src="/laney-logo.png"
      alt="Laney Logo"
      className={cn(sizeClasses[size], className)}
    />
  );
}