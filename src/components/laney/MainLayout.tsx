import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-secondary/30 to-laney-peach/20">
      <div className="flex">
        <Sidebar />
        <main 
          className="flex-1 min-w-0 min-h-[calc(100vh-4rem)] overflow-x-clip transition-all duration-300"
          style={{ marginLeft: isSidebarOpen ? '16rem' : '4rem' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
