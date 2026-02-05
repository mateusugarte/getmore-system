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
        {/* Logo with pulse animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          {/* Outer spinning gold ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full border-4 border-transparent border-t-gold animate-spin-gold" />
          </div>
          
          {/* Inner glow ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-28 w-28 rounded-full bg-gold/10 animate-pulse-logo" />
          </div>

          {/* Logo */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex h-24 w-24 items-center justify-center"
          >
            <img 
              src="/logo.png" 
              alt="GetMore System" 
              className="h-20 w-20 object-contain drop-shadow-lg"
            />
          </motion.div>
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold">
            <span className="text-foreground">GetMore</span>
            <span className="text-gold ml-1">System</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
        </motion.div>
      </div>
    </motion.div>
  );
};
