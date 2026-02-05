import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar } from "./AppSidebar";
import { GlobalSearch } from "./GlobalSearch";
import { GlobalLoader } from "./GlobalLoader";
import { LogoWatermark } from "./LogoWatermark";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
    
    // Simulate initial load
    const timer = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && <GlobalLoader isLoading={isLoading} />}
      </AnimatePresence>

      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
        
        <div className="flex flex-1 flex-col relative">
          {/* Watermark */}
          <LogoWatermark />

          {/* Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <GlobalSearch />
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </>
  );
};
