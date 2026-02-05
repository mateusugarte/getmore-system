import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, MoreVertical, Check, ChevronLeft, ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
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
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, eachDayOfInterval, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const monthNames = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
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

  const faturamentoGoal = useMemo(() => {
    return monthGoals.find((g) => g.type === "faturamento");
  }, [monthGoals]);

  const otherGoals = useMemo(() => {
    return monthGoals.filter((g) => g.type !== "faturamento");
  }, [monthGoals]);

  // Generate chart data for faturamento goal (daily evolution simulation)
  const faturamentoChartData = useMemo(() => {
    if (!faturamentoGoal) return [];
    
    const daysInMonth = getDaysInMonth(selectedDate);
    const targetPerDay = faturamentoGoal.target_value / daysInMonth;
    const currentValue = faturamentoGoal.current_value || 0;
    const today = new Date();
    const isCurrentMonth = selectedDate.getMonth() === today.getMonth() && 
                           selectedDate.getFullYear() === today.getFullYear();
    const currentDay = isCurrentMonth ? today.getDate() : daysInMonth;
    
    // Create daily data points
    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const expectedValue = targetPerDay * i;
      // Simulate actual value based on current progress
      const actualValue = i <= currentDay 
        ? (currentValue / currentDay) * i 
        : null;
      
      data.push({
        day: i,
        meta: Math.round(expectedValue),
        real: actualValue !== null ? Math.round(actualValue) : undefined,
      });
    }
    
    return data;
  }, [faturamentoGoal, selectedDate]);

  // Get last 6 months for history
  const monthsHistory = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      months.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        label: format(date, "MMM", { locale: ptBR }),
        fullLabel: format(date, "MMMM yyyy", { locale: ptBR }),
      });
    }
    return months;
  }, []);

  const getMonthStats = (month: number, year: number) => {
    const goals = allGoals?.filter((g) => g.month === month && g.year === year) || [];
    const faturamento = goals.find((g) => g.type === "faturamento");
    const progress = faturamento && faturamento.target_value > 0
      ? Math.round(((faturamento.current_value || 0) / faturamento.target_value) * 100)
      : 0;
    return { progress };
  };

  const calculateProgress = (current: number, target: number) =>
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  const formatValue = (goal: Goal, value: number) => {
    if (goal.type === "faturamento" || goal.title.toLowerCase().includes("faturamento")) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
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
          <div className="grid gap-3 sm:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
          <Skeleton className="h-48" />
        </div>
      </AppLayout>
    );
  }

  const faturamentoProgress = faturamentoGoal 
    ? calculateProgress(faturamentoGoal.current_value || 0, faturamentoGoal.target_value)
    : 0;

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
              <span className="text-sm font-medium px-2 min-w-[90px] text-center capitalize">
                {format(selectedDate, "MMM yyyy", { locale: ptBR })}
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
        <div className="grid gap-2 grid-cols-6">
          {monthsHistory.map(({ month, year, label }) => {
            const stats = getMonthStats(month, year);
            const isSelected = month === currentMonth && year === currentYear;

            return (
              <button
                key={`${month}-${year}`}
                onClick={() => setSelectedDate(new Date(year, month - 1))}
                className={cn(
                  "card-elevated p-2 text-center transition-all hover:shadow-md",
                  isSelected && "ring-2 ring-gold"
                )}
              >
                <p className="text-[10px] font-medium text-muted-foreground uppercase">{label}</p>
                <p className="text-lg font-bold text-foreground">{stats.progress}%</p>
              </button>
            );
          })}
        </div>

        {/* Faturamento Goal with Chart */}
        {faturamentoGoal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-4"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ProgressRing progress={faturamentoProgress} size={60} strokeWidth={5} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-foreground">{faturamentoProgress}%</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Meta de Faturamento</h3>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-gold">
                      R$ {((faturamentoGoal.current_value || 0) / 1000).toFixed(1)}k
                    </span>
                    {" / "}
                    R$ {(faturamentoGoal.target_value / 1000).toFixed(1)}k
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openProgressDialog(faturamentoGoal)}>
                  Atualizar
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEditDialog(faturamentoGoal)}>
                  <Edit2 size={12} />
                </Button>
              </div>
            </div>
            
            {/* Linear Chart */}
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={faturamentoChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                    width={40}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
                  />
                  <Line
                    type="monotone"
                    dataKey="meta"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Meta"
                  />
                  <Line
                    type="monotone"
                    dataKey="real"
                    stroke="hsl(var(--gold))"
                    strokeWidth={2}
                    dot={false}
                    name="Realizado"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Other Goals Grid */}
        {otherGoals.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {otherGoals.map((goal, index) => {
              const progress = calculateProgress(goal.current_value || 0, goal.target_value);
              const isComplete = progress >= 100;

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
                          <MoreVertical size={12} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(goal)}>
                          <Edit2 className="mr-2 h-3 w-3" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="mr-2 h-3 w-3" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col items-center text-center pt-1">
                    <div className="relative">
                      <ProgressRing progress={progress} size={55} strokeWidth={4} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-foreground">{progress}%</span>
                      </div>
                      {isComplete && (
                        <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                          <Check size={8} className="text-white" />
                        </div>
                      )}
                    </div>

                    <h3 className="mt-2 text-xs font-medium text-foreground">{goal.title}</h3>

                    <div className="mt-1 text-[10px] text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {formatValue(goal, goal.current_value || 0)}
                      </span>
                      {" / "}
                      <span>{formatValue(goal, goal.target_value)}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-6 text-[10px] px-2"
                      onClick={() => openProgressDialog(goal)}
                    >
                      Atualizar
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {monthGoals.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Nenhuma meta para este mês
          </div>
        )}

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
