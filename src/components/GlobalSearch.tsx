import { useState } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar leads ou clientes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-80 pl-10 pr-10 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && query && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-popover p-2 shadow-lg"
          >
            <div className="py-8 text-center text-sm text-muted-foreground">
              <p>Nenhum resultado encontrado para "{query}"</p>
              <p className="mt-1 text-xs">Tente buscar por nome, email ou telefone</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
