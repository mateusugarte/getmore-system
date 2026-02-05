import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

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
      <div className="flex flex-col items-center gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </motion.div>
      </div>
    </motion.div>
  );
};
