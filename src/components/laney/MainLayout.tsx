import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <main className="flex-1 min-w-0 min-h-[calc(100vh-4rem)] overflow-x-clip">
        {children}
      </main>
    </div>
  );
}
