import { motion } from "framer-motion";

interface GlobalLoaderProps {
  isLoading: boolean;
}

export const GlobalLoader = ({ isLoading }: GlobalLoaderProps) => {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          {/* Outer ring */}
          <svg
            className="h-24 w-24 animate-spin-slow"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset="200"
              className="progress-ring-circle"
            />
          </svg>

          {/* Center logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-rose shadow-glow"
            >
              <span className="text-2xl font-bold text-primary-foreground">G</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-2xl font-semibold text-gradient-rose">GestãoPro</h1>
          <p className="mt-1 text-sm text-muted-foreground">Carregando...</p>
        </motion.div>
      </div>
    </motion.div>
  );
};
