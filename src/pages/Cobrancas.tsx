import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X, ChevronLeft, ChevronRight, AlertCircle, Ban, Clock } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/KPICard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useMonthBillingsWithStatus, useUpdateBilling, useCancelBilling, usePaidMRR, useMonthlyChurn } from "@/hooks/useBillings";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const statusConfig = {
  pending: {
    label: "Pendente",
    icon: Clock,
    class: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  },
  paid: {
    label: "Pago",
    icon: Check,
    class: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  },
  overdue: {
    label: "Em Atraso",
    icon: AlertCircle,
    class: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  },
  cancelled: {
    label: "Cancelado",
    icon: Ban,
    class: "bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400",
  },
};

const Cobrancas = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [confirmPayment, setConfirmPayment] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();

  const { data: billings, isLoading } = useMonthBillingsWithStatus(currentMonth, currentYear);
  const { data: paidMRR } = usePaidMRR();
  const { data: churnData } = useMonthlyChurn();
  const updateBilling = useUpdateBilling();
  const cancelBilling = useCancelBilling();

  const stats = useMemo(() => {
    if (!billings) return { total: 0, paid: 0, pending: 0, overdue: 0, cancelled: 0, paidValue: 0, pendingValue: 0 };
    
    const paid = billings.filter((b) => b.status === "paid");
    const pending = billings.filter((b) => b.status === "pending");
    const overdue = billings.filter((b) => b.status === "overdue");
    const cancelled = billings.filter((b) => b.status === "cancelled");
    
    return {
      total: billings.length,
      paid: paid.length,
      pending: pending.length,
      overdue: overdue.length,
      cancelled: cancelled.length,
      paidValue: paid.reduce((acc, b) => acc + b.amount, 0),
      pendingValue: [...pending, ...overdue].reduce((acc, b) => acc + b.amount, 0),
    };
  }, [billings]);

  const handleMarkAsPaid = async (id: string) => {
    try {
      await updateBilling.mutateAsync({
        id,
        is_paid: true,
        paid_at: new Date().toISOString(),
        status: "paid",
      });
      toast.success("Pagamento registrado!");
      setConfirmPayment(null);
    } catch {
      toast.error("Erro ao registrar pagamento");
    }
  };

  const handleMarkAsUnpaid = async (id: string) => {
    try {
      await updateBilling.mutateAsync({
        id,
        is_paid: false,
        paid_at: null,
        status: "pending",
      });
      toast.success("Pagamento removido!");
    } catch {
      toast.error("Erro ao remover pagamento");
    }
  };

  const handleCancelBilling = async (id: string) => {
    try {
      await cancelBilling.mutateAsync(id);
      toast.success("Cobrança cancelada! Contabilizado como churn.");
      setConfirmCancel(null);
    } catch {
      toast.error("Erro ao cancelar cobrança");
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedDate(direction === "prev" ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1));
  };

  // Filter out cancelled billings from main view, show separately
  const activeBillings = billings?.filter(b => b.status !== "cancelled") || [];
  const cancelledBillings = billings?.filter(b => b.status === "cancelled") || [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-96" />
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
            <h1 className="text-lg font-semibold text-foreground">Cobranças</h1>
            <p className="text-xs text-muted-foreground">Gestão de pagamentos recorrentes</p>
          </div>

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
        </div>

        {/* KPI Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <KPICard
              title="MRR Pago"
              value={`R$ ${(paidMRR || 0).toLocaleString("pt-BR")}`}
              icon={<Check size={16} />}
              highlight
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <KPICard
              title="Pendentes"
              value={stats.pending + stats.overdue}
              subtitle={`R$ ${stats.pendingValue.toLocaleString("pt-BR")}`}
              icon={<Clock size={16} />}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <KPICard
              title="Em Atraso"
              value={stats.overdue}
              icon={<AlertCircle size={16} />}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <KPICard
              title="Churn"
              value={churnData?.count || 0}
              subtitle={`R$ ${(churnData?.value || 0).toLocaleString("pt-BR")}`}
              icon={<Ban size={16} />}
            />
          </motion.div>
        </div>

        {/* Active Billings Table */}
        <div className="card-elevated overflow-hidden">
          <div className="border-b border-border px-4 py-2">
            <h3 className="text-sm font-medium text-foreground">Cobranças do Mês</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Cliente</TableHead>
                <TableHead className="text-xs">Dia Cobrança</TableHead>
                <TableHead className="text-xs">Valor</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Pago em</TableHead>
                <TableHead className="text-xs w-32">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeBillings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                    Nenhuma cobrança para este mês.
                  </TableCell>
                </TableRow>
              ) : (
                activeBillings.map((billing) => {
                  const StatusIcon = statusConfig[billing.status]?.icon || Clock;
                  const statusStyle = statusConfig[billing.status] || statusConfig.pending;
                  
                  return (
                    <TableRow key={billing.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{billing.client?.name}</p>
                          <p className="text-xs text-muted-foreground">{billing.client?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        Dia {billing.client?.recurrence_date || 1}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        R$ {billing.amount.toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1 text-[10px]", statusStyle.class)}>
                          <StatusIcon size={10} />
                          {statusStyle.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {billing.paid_at ? format(new Date(billing.paid_at), "dd/MM/yy") : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {billing.status === "paid" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-muted-foreground"
                              onClick={() => handleMarkAsUnpaid(billing.id)}
                            >
                              <X size={12} className="mr-1" />
                              Desfazer
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setConfirmPayment(billing.id)}
                              >
                                <Check size={12} className="mr-1" />
                                Pago
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs text-destructive border-destructive/30"
                                onClick={() => setConfirmCancel(billing.id)}
                              >
                                <Ban size={12} />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Cancelled Billings (Churn) */}
        {cancelledBillings.length > 0 && (
          <div className="card-elevated overflow-hidden opacity-75">
            <div className="border-b border-border px-4 py-2 bg-muted/50">
              <h3 className="text-sm font-medium text-muted-foreground">Cancelados (Churn)</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Cliente</TableHead>
                  <TableHead className="text-xs">Valor Perdido</TableHead>
                  <TableHead className="text-xs">Cancelado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cancelledBillings.map((billing) => (
                  <TableRow key={billing.id} className="opacity-60">
                    <TableCell>
                      <p className="text-sm text-foreground">{billing.client?.name}</p>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      R$ {billing.amount.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {billing.cancelled_at ? format(new Date(billing.cancelled_at), "dd/MM/yy") : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Confirm Payment Dialog */}
        <AlertDialog open={!!confirmPayment} onOpenChange={() => setConfirmPayment(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja marcar esta cobrança como paga? A data de pagamento será registrada.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmPayment && handleMarkAsPaid(confirmPayment)}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirm Cancel Dialog */}
        <AlertDialog open={!!confirmCancel} onOpenChange={() => setConfirmCancel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar Cobrança</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja cancelar esta cobrança? Ela será contabilizada como <strong>churn</strong> e não aparecerá nos próximos meses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => confirmCancel && handleCancelBilling(confirmCancel)}
              >
                Cancelar Cobrança
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default Cobrancas;
