import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 min-h-[calc(100vh-4rem)] overflow-x-clip ml-6">
          {children}
        </main>
      </div>
    </div>
  );
}
