import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
  "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
  "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
  "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
  "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30",
  "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
];

function getTagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ tags, onChange, placeholder = "Adicionar etiqueta...", className }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag}
              className={cn("text-[10px] px-1.5 py-0.5 gap-1 cursor-pointer", getTagColor(tag))}
              onClick={() => removeTag(tag)}
            >
              {tag}
              <X size={10} />
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-1">
        <Input
          className="h-8 text-xs flex-1"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={addTag}
          className="h-8 w-8 flex items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export function TagList({ tags, className }: { tags: string[]; className?: string }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tags.map((tag) => (
        <Badge key={tag} className={cn("text-[9px] px-1 py-0", getTagColor(tag))}>
          {tag}
        </Badge>
      ))}
    </div>
  );
}
