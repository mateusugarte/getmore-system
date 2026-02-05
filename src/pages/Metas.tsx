import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, MoreVertical, Check } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ProgressRing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  type: "faturamento" | "personalizado";
  month: number;
  year: number;
}

const initialGoals: Goal[] = [
  {
    id: "1",
    title: "Faturamento",
    targetValue: 36000,
    currentValue: 24500,
    type: "faturamento",
    month: 2,
    year: 2026,
  },
  {
    id: "2",
    title: "Novos Clientes",
    targetValue: 10,
    currentValue: 6,
    type: "personalizado",
    month: 2,
    year: 2026,
  },
  {
    id: "3",
    title: "Taxa de Conversão",
    targetValue: 25,
    currentValue: 18,
    type: "personalizado",
    month: 2,
    year: 2026,
  },
  {
    id: "4",
    title: "Leads Qualificados",
    targetValue: 50,
    currentValue: 28,
    type: "personalizado",
    month: 2,
    year: 2026,
  },
];

const Metas = () => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const calculateProgress = (current: number, target: number) =>
    Math.round((current / target) * 100);

  const formatValue = (goal: Goal, value: number) => {
    if (goal.type === "faturamento") {
      return `R$ ${value.toLocaleString("pt-BR")}`;
    }
    if (goal.title.includes("Taxa")) {
      return `${value}%`;
    }
    return value.toString();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Metas</h1>
            <p className="mt-1 text-muted-foreground">
              Defina e acompanhe suas metas mensais
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-rose hover:opacity-90">
                <Plus size={18} />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Meta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nome da Meta</Label>
                  <Input id="title" placeholder="Ex: Novos Clientes" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Valor Alvo</Label>
                  <Input id="target" type="number" placeholder="100" />
                </div>
                <Button className="w-full bg-gradient-rose hover:opacity-90">
                  Criar Meta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {goals.map((goal, index) => {
            const progress = calculateProgress(goal.currentValue, goal.targetValue);
            const isComplete = progress >= 100;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "card-elevated relative overflow-hidden p-6",
                  isComplete && "ring-2 ring-primary"
                )}
              >
                {/* Actions */}
                <div className="absolute right-4 top-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {goal.type !== "faturamento" && (
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="relative">
                      <ProgressRing progress={Math.min(progress, 100)} size={100} strokeWidth={6} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-foreground">{Math.min(progress, 100)}%</span>
                      </div>
                    </div>
                    {isComplete && (
                      <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check size={14} className="text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <h3 className="mt-4 font-semibold text-foreground">{goal.title}</h3>

                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {formatValue(goal, goal.currentValue)}
                    </span>
                    {" de "}
                    <span>{formatValue(goal, goal.targetValue)}</span>
                  </div>

                  {/* Update Progress Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 text-xs"
                  >
                    Atualizar Progresso
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Metas;
