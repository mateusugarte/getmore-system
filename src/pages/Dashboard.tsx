import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { KPICard } from "@/components/KPICard";
import { ProgressRing } from "@/components/ProgressRing";
import { Users, DollarSign, Target, TrendingUp, TrendingDown, AlertCircle, Calendar, Phone, Repeat, ShoppingCart, CreditCard } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { usePendingBillings } from "@/hooks/useBillings";
import { useGoalsByMonth } from "@/hooks/useGoals";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(var(--gold))", "hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--destructive))"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: pendingBillings } = usePendingBillings();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const { data: monthGoals } = useGoalsByMonth(currentMonth, currentYear);

  const weekChartData = useMemo(() => {
    if (!stats?.weekLeads) return [];
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const counts = new Array(7).fill(0);
    
    stats.weekLeads.forEach((lead) => {
      const day = new Date(lead.created_at).getDay();
      counts[day]++;
    });
    
    return days.map((day, i) => ({ day, leads: counts[i] }));
  }, [stats?.weekLeads]);

  const stageChartData = useMemo(() => {
    if (!stats?.stageCounts) return [];
    return [
      { name: "Contato", value: stats.stageCounts.contato_feito },
      { name: "Aquecendo", value: stats.stageCounts.aquecendo },
      { name: "Proposta", value: stats.stageCounts.proposta_enviada },
      { name: "Fechado", value: stats.stageCounts.venda_concluida },
    ];
  }, [stats?.stageCounts]);

  // Get top 4 goals for display
  const displayGoals = useMemo(() => {
    if (!monthGoals) return [];
    const sorted = [...monthGoals].sort((a, b) => {
      if (a.type === "faturamento") return -1;
      if (b.type === "faturamento") return 1;
      const progA = (a.current_value || 0) / a.target_value;
      const progB = (b.current_value || 0) / b.target_value;
      return progB - progA;
    });
    return sorted.slice(0, 4);
  }, [monthGoals]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* KPI Cards - Row 1: Leads & Clientes */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <KPICard
              title="Leads Hoje"
              value={stats?.leadsToday || 0}
              subtitle={`${stats?.totalLeads || 0} total`}
              icon={<Users size={16} />}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <KPICard
              title="Clientes"
              value={stats?.totalClients || 0}
              subtitle={`${stats?.recurringClients || 0} recorrentes`}
              icon={<ShoppingCart size={16} />}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <KPICard
              title="Conversão"
              value={`${stats?.conversionRate || 0}%`}
              subtitle="Lead → Cliente"
              icon={<Target size={16} />}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <KPICard
              title="Vendas no Mês"
              value={stats?.salesCount || 0}
              subtitle={`R$ ${((stats?.monthRevenue || 0) / 1000).toFixed(1)}k`}
              icon={<CreditCard size={16} />}
            />
          </motion.div>
        </div>

        {/* KPI Cards - Row 2: Financeiro */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <KPICard
              title="Faturamento Mês"
              value={`R$ ${((stats?.totalMonthRevenue || 0) / 1000).toFixed(1)}k`}
              subtitle="Vendas + Recorrência"
              icon={<DollarSign size={16} />}
              highlight
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <KPICard
              title="MRR Pago"
              value={`R$ ${((stats?.paidMRR || 0) / 1000).toFixed(1)}k`}
              subtitle={`${stats?.monthlyRecurrence ? `de R$ ${(stats.monthlyRecurrence / 1000).toFixed(1)}k` : 'Potencial'}`}
              icon={<TrendingUp size={16} />}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <KPICard
              title="Pendente"
              value={stats?.pendingCount || 0}
              subtitle={`R$ ${((stats?.pendingAmount || 0) / 1000).toFixed(1)}k`}
              icon={<AlertCircle size={16} />}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <KPICard
              title="Churn"
              value={stats?.churnCount || 0}
              subtitle={`R$ ${((stats?.churnValue || 0) / 1000).toFixed(1)}k perdido`}
              icon={<TrendingDown size={16} />}
            />
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Chart + Goals */}
          <div className="lg:col-span-2 space-y-4">
            {/* Charts Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Leads Chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="card-elevated p-4"
              >
                <h3 className="mb-3 text-sm font-medium text-foreground">Leads da Semana</h3>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weekChartData}>
                      <defs>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--gold))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--gold))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={25} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                          fontSize: "11px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="leads"
                        stroke="hsl(var(--gold))"
                        strokeWidth={2}
                        fill="url(#colorLeads)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Pipeline Chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card-elevated p-4"
              >
                <h3 className="mb-3 text-sm font-medium text-foreground">Pipeline</h3>
                <div className="h-32 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stageChartData}
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {stageChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                          fontSize: "11px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-3 mt-2">
                  {stageChartData.map((stage, i) => (
                    <div key={stage.name} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-[10px] text-muted-foreground">{stage.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Goals Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="card-elevated p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">Metas do Mês</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/metas")} className="text-xs h-6 px-2">
                  Ver todas
                </Button>
              </div>
              {displayGoals.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Nenhuma meta configurada</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {displayGoals.map((goal) => {
                    const progress = goal.target_value > 0 
                      ? Math.min(100, Math.round(((goal.current_value || 0) / goal.target_value) * 100))
                      : 0;
                    const isFaturamento = goal.type === "faturamento";
                    
                    return (
                      <div
                        key={goal.id}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-lg border border-border",
                          isFaturamento && "bg-gold/5 border-gold/20"
                        )}
                      >
                        <div className="relative">
                          <ProgressRing progress={progress} size={50} strokeWidth={4} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-semibold text-foreground">{progress}%</span>
                          </div>
                        </div>
                        <p className="mt-2 text-xs font-medium text-foreground text-center truncate w-full">
                          {goal.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {isFaturamento
                            ? `R$ ${((goal.current_value || 0) / 1000).toFixed(1)}k / ${(goal.target_value / 1000).toFixed(1)}k`
                            : `${goal.current_value || 0} / ${goal.target_value}`
                          }
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Pending Billings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card-elevated p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-500" />
                  <h3 className="text-sm font-medium text-foreground">Pendentes</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/cobrancas")} className="text-xs h-6 px-2">
                  Ver
                </Button>
              </div>
              {!pendingBillings || pendingBillings.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhuma cobrança pendente</p>
              ) : (
                <div className="space-y-2">
                  {pendingBillings.slice(0, 4).map((billing) => (
                    <div
                      key={billing.id}
                      className="flex items-center justify-between rounded-md border border-border p-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{billing.client?.name}</p>
                      </div>
                      <span className="text-xs font-medium text-gold">
                        R$ {billing.amount.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  ))}
                  {pendingBillings.length > 4 && (
                    <p className="text-[10px] text-muted-foreground text-center">
                      +{pendingBillings.length - 4} mais
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Recent Leads */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="card-elevated p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">Leads Recentes</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/pipeline")} className="text-xs h-6 px-2">
                  Ver
                </Button>
              </div>
              {stats?.recentLeads?.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum lead</p>
              ) : (
                <div className="space-y-2">
                  {stats?.recentLeads?.slice(0, 4).map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between rounded-md border border-border p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate("/pipeline")}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{lead.name}</p>
                        {lead.phone && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Phone size={8} />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar size={8} />
                        {format(new Date(lead.created_at), "dd/MM")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="card-elevated p-4"
            >
              <h3 className="text-sm font-medium text-foreground mb-3">Resumo</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <p className="text-lg font-bold text-gold">{stats?.totalLeads || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Leads</p>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <p className="text-lg font-bold text-foreground">{stats?.totalClients || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Clientes</p>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <p className="text-lg font-bold text-foreground">{stats?.recurringClients || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Recorrentes</p>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <p className="text-lg font-bold text-foreground">
                    R$ {((stats?.totalSalesValue || 0) / 1000).toFixed(0)}k
                  </p>
                  <p className="text-[10px] text-muted-foreground">Vendas Total</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
