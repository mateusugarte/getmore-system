import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar } from "./AppSidebar";
import { GlobalLoader } from "./GlobalLoader";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Default to dark mode
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = savedTheme === "dark" || (!savedTheme && true);
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Quick load
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark");
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && <GlobalLoader isLoading={isLoading} />}
      </AnimatePresence>

      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
        
        <div className="flex flex-1 flex-col">
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-4 lg:p-6"
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
