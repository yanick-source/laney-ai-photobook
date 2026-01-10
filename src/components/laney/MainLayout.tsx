import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function MainLayout({ children, showHeader = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-laney-peach/20">
      <Sidebar />
      <div className="pl-64">
        {showHeader && <Header />}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
