import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, MoreVertical, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ProgressRing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useEnsureFaturamentoGoal, type Goal } from "@/hooks/useGoals";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const Metas = () => {
  const { data: allGoals, isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const ensureFaturamento = useEnsureFaturamentoGoal();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdateProgressOpen, setIsUpdateProgressOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    target_value: "",
    current_value: "0",
  });

  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();

  // Ensure faturamento goal exists for selected month
  useEffect(() => {
    if (!isLoading) {
      ensureFaturamento.mutate({ month: currentMonth, year: currentYear });
    }
  }, [currentMonth, currentYear, isLoading]);

  const monthGoals = useMemo(() => {
    return allGoals?.filter(
      (goal) => goal.month === currentMonth && goal.year === currentYear
    ) || [];
  }, [allGoals, currentMonth, currentYear]);

  // Get last 6 months for history
  const monthsHistory = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      months.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        label: format(date, "MMM yy", { locale: ptBR }),
      });
    }
    return months;
  }, []);

  const getMonthStats = (month: number, year: number) => {
    const goals = allGoals?.filter((g) => g.month === month && g.year === year) || [];
    const faturamento = goals.find((g) => g.type === "faturamento");
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => (g.current_value || 0) >= g.target_value).length;
    return { faturamento, totalGoals, completedGoals };
  };

  const calculateProgress = (current: number, target: number) =>
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  const formatValue = (goal: Goal, value: number) => {
    if (goal.type === "faturamento" || goal.title.toLowerCase().includes("faturamento")) {
      return `R$ ${value.toLocaleString("pt-BR")}`;
    }
    if (goal.title.toLowerCase().includes("taxa") || goal.title.toLowerCase().includes("%")) {
      return `${value}%`;
    }
    return value.toString();
  };

  const handleCreateGoal = async () => {
    if (!formData.title || !formData.target_value) {
      toast.error("Preencha todos os campos");
      return;
    }
    try {
      await createGoal.mutateAsync({
        title: formData.title,
        target_value: parseFloat(formData.target_value),
        current_value: parseFloat(formData.current_value) || 0,
        month: currentMonth,
        year: currentYear,
        type: "personalizado",
      });
      toast.success("Meta criada!");
      setIsCreateDialogOpen(false);
      setFormData({ title: "", target_value: "", current_value: "0" });
    } catch {
      toast.error("Erro ao criar meta");
    }
  };

  const handleUpdateGoal = async () => {
    if (!selectedGoal) return;
    try {
      await updateGoal.mutateAsync({
        id: selectedGoal.id,
        title: formData.title,
        target_value: parseFloat(formData.target_value),
      });
      toast.success("Meta atualizada!");
      setIsEditDialogOpen(false);
      setSelectedGoal(null);
    } catch {
      toast.error("Erro ao atualizar meta");
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedGoal) return;
    try {
      await updateGoal.mutateAsync({
        id: selectedGoal.id,
        current_value: parseFloat(formData.current_value),
      });
      toast.success("Progresso atualizado!");
      setIsUpdateProgressOpen(false);
      setSelectedGoal(null);
    } catch {
      toast.error("Erro ao atualizar progresso");
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoal.mutateAsync(id);
      toast.success("Meta excluída!");
    } catch {
      toast.error("Erro ao excluir meta");
    }
  };

  const openEditDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setFormData({
      title: goal.title,
      target_value: goal.target_value.toString(),
      current_value: (goal.current_value || 0).toString(),
    });
    setIsEditDialogOpen(true);
  };

  const openProgressDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setFormData({
      ...formData,
      current_value: (goal.current_value || 0).toString(),
    });
    setIsUpdateProgressOpen(true);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedDate(direction === "prev" ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Metas</h1>
            <p className="text-xs text-muted-foreground">Acompanhe suas metas mensais</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-md p-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigateMonth("prev")}>
                <ChevronLeft size={14} />
              </Button>
              <span className="text-sm font-medium px-2 min-w-[100px] text-center">
                {monthNames[currentMonth - 1]} {currentYear}
              </span>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigateMonth("next")}>
                <ChevronRight size={14} />
              </Button>
            </div>

            <Button size="sm" className="h-8 text-xs" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus size={12} className="mr-1" />
              Nova Meta
            </Button>
          </div>
        </div>

        {/* Month History */}
        <div className="grid gap-2 grid-cols-3 sm:grid-cols-6">
          {monthsHistory.map(({ month, year, label }) => {
            const stats = getMonthStats(month, year);
            const isSelected = month === currentMonth && year === currentYear;
            const progress = stats.faturamento
              ? calculateProgress(stats.faturamento.current_value || 0, stats.faturamento.target_value)
              : 0;

            return (
              <button
                key={`${month}-${year}`}
                onClick={() => setSelectedDate(new Date(year, month - 1))}
                className={cn(
                  "card-elevated p-2.5 text-left transition-all hover:shadow-md",
                  isSelected && "ring-2 ring-primary"
                )}
              >
                <p className="text-xs font-medium text-muted-foreground capitalize">{label}</p>
                <p className="text-lg font-bold text-foreground">{progress}%</p>
                <p className="text-[10px] text-muted-foreground">
                  {stats.completedGoals}/{stats.totalGoals} metas
                </p>
              </button>
            );
          })}
        </div>

        {/* Goals Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {monthGoals.map((goal, index) => {
            const progress = calculateProgress(goal.current_value || 0, goal.target_value);
            const isComplete = progress >= 100;
            const isFaturamento = goal.type === "faturamento";

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "card-elevated relative overflow-hidden p-4",
                  isComplete && "ring-1 ring-emerald-500/50"
                )}
              >
                {/* Actions */}
                <div className="absolute right-2 top-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <MoreVertical size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(goal)}>
                        <Edit2 className="mr-2 h-3.5 w-3.5" />
                        Editar
                      </DropdownMenuItem>
                      {!isFaturamento && (
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center text-center pt-2">
                  <div className="relative">
                    <ProgressRing progress={progress} size={70} strokeWidth={5} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-foreground">{progress}%</span>
                    </div>
                    {isComplete && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </div>

                  <h3 className="mt-3 text-sm font-medium text-foreground">{goal.title}</h3>

                  <div className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {formatValue(goal, goal.current_value || 0)}
                    </span>
                    {" / "}
                    <span>{formatValue(goal, goal.target_value)}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-7 text-xs"
                    onClick={() => openProgressDialog(goal)}
                  >
                    Atualizar
                  </Button>
                </div>
              </motion.div>
            );
          })}

          {monthGoals.length === 0 && (
            <div className="col-span-full text-center py-12 text-sm text-muted-foreground">
              Nenhuma meta para este mês
            </div>
          )}
        </div>

        {/* Create Goal Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base">Nova Meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome da Meta *</Label>
                <Input
                  placeholder="Ex: Novos Clientes"
                  className="h-9 text-sm"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Valor Alvo *</Label>
                <Input
                  type="number"
                  placeholder="100"
                  className="h-9 text-sm"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                />
              </div>
              <Button className="w-full h-9 text-sm" onClick={handleCreateGoal} disabled={createGoal.isPending}>
                {createGoal.isPending ? "Criando..." : "Criar Meta"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Goal Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base">Editar Meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome da Meta</Label>
                <Input
                  className="h-9 text-sm"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Valor Alvo</Label>
                <Input
                  type="number"
                  className="h-9 text-sm"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                />
              </div>
              <Button className="w-full h-9 text-sm" onClick={handleUpdateGoal} disabled={updateGoal.isPending}>
                {updateGoal.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Update Progress Dialog */}
        <Dialog open={isUpdateProgressOpen} onOpenChange={setIsUpdateProgressOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base">Atualizar Progresso</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <p className="text-sm text-muted-foreground">
                Meta: <span className="font-medium text-foreground">{selectedGoal?.title}</span>
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs">Valor Atual</Label>
                <Input
                  type="number"
                  className="h-9 text-sm"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                />
              </div>
              <Button className="w-full h-9 text-sm" onClick={handleUpdateProgress} disabled={updateGoal.isPending}>
                {updateGoal.isPending ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Metas;
