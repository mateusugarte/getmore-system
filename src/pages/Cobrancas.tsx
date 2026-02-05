import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Check, X, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
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
import { useBillings, useUpdateBilling, useGenerateBillings, usePaidMRR } from "@/hooks/useBillings";
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

const Cobrancas = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [confirmPayment, setConfirmPayment] = useState<string | null>(null);

  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();

  const { data: billings, isLoading } = useBillings(currentMonth, currentYear);
  const { data: paidMRR } = usePaidMRR();
  const updateBilling = useUpdateBilling();
  const generateBillings = useGenerateBillings();

  const stats = useMemo(() => {
    if (!billings) return { total: 0, paid: 0, pending: 0, paidValue: 0, pendingValue: 0 };
    const paid = billings.filter((b) => b.is_paid);
    const pending = billings.filter((b) => !b.is_paid);
    return {
      total: billings.length,
      paid: paid.length,
      pending: pending.length,
      paidValue: paid.reduce((acc, b) => acc + b.amount, 0),
      pendingValue: pending.reduce((acc, b) => acc + b.amount, 0),
    };
  }, [billings]);

  const handleGenerateBillings = async () => {
    try {
      const result = await generateBillings.mutateAsync({ month: currentMonth, year: currentYear });
      toast.success(`${result.created} cobranças geradas!`);
    } catch {
      toast.error("Erro ao gerar cobranças");
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await updateBilling.mutateAsync({
        id,
        is_paid: true,
        paid_at: new Date().toISOString(),
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
      });
      toast.success("Pagamento removido!");
    } catch {
      toast.error("Erro ao remover pagamento");
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedDate(direction === "prev" ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1));
  };

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

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleGenerateBillings}
              disabled={generateBillings.isPending}
            >
              <RefreshCw size={12} className={cn("mr-1", generateBillings.isPending && "animate-spin")} />
              Gerar Cobranças
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
              title="Total do Mês"
              value={`R$ ${(stats.paidValue + stats.pendingValue).toLocaleString("pt-BR")}`}
              subtitle={`${stats.total} cobranças`}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <KPICard
              title="Pagos"
              value={stats.paid}
              subtitle={`R$ ${stats.paidValue.toLocaleString("pt-BR")}`}
              icon={<Check size={16} />}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <KPICard
              title="Pendentes"
              value={stats.pending}
              subtitle={`R$ ${stats.pendingValue.toLocaleString("pt-BR")}`}
              icon={<AlertCircle size={16} />}
            />
          </motion.div>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Cliente</TableHead>
                <TableHead className="text-xs">Valor</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Pago em</TableHead>
                <TableHead className="text-xs w-24">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    Nenhuma cobrança para este mês. Clique em "Gerar Cobranças" para criar.
                  </TableCell>
                </TableRow>
              ) : (
                billings?.map((billing) => (
                  <TableRow key={billing.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{billing.client?.name}</p>
                        <p className="text-xs text-muted-foreground">{billing.client?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      R$ {billing.amount.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "text-[10px]",
                          billing.is_paid
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                        )}
                      >
                        {billing.is_paid ? "Pago" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {billing.paid_at ? format(new Date(billing.paid_at), "dd/MM/yy") : "-"}
                    </TableCell>
                    <TableCell>
                      {billing.is_paid ? (
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
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setConfirmPayment(billing.id)}
                        >
                          <Check size={12} className="mr-1" />
                          Pago
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

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
      </div>
    </AppLayout>
  );
};

export default Cobrancas;
