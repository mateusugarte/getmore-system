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
import { Users, DollarSign, Target, TrendingUp, Plus, Phone, Calendar } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const pipelineColors = [
  { stage: "contato_feito", color: "#3B82F6", label: "Contato" },
  { stage: "aquecendo", color: "#F59E0B", label: "Aquecendo" },
  { stage: "proposta_enviada", color: "#8B5CF6", label: "Proposta" },
  { stage: "venda_concluida", color: "#10B981", label: "Fechado" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  const pipelineData = useMemo(() => {
    if (!stats) return [];
    return pipelineColors.map(({ stage, color, label }) => ({
      name: label,
      value: stats.stageCounts[stage as keyof typeof stats.stageCounts] || 0,
      color,
    }));
  }, [stats]);

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

  const goalProgress = stats?.monthGoal
    ? Math.min(100, Math.round(((stats.monthGoal.current_value || 0) / (stats.monthGoal.target_value || 1)) * 100))
    : 0;

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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate("/pipeline")}>
              <Plus size={14} className="mr-1" />
              Lead
            </Button>
            <Button size="sm" onClick={() => navigate("/clientes")}>
              <Plus size={14} className="mr-1" />
              Cliente
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
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
              title="Vendas do Mês"
              value={`R$ ${(stats?.monthRevenue || 0).toLocaleString("pt-BR")}`}
              subtitle={`${stats?.salesCount || 0} vendas`}
              icon={<DollarSign size={16} />}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <KPICard
              title="Conversão"
              value={`${stats?.conversionRate || 0}%`}
              subtitle="Lead → Cliente"
              icon={<TrendingUp size={16} />}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <KPICard
              title="Meta do Mês"
              value={`${goalProgress}%`}
              subtitle={stats?.monthGoal ? `R$ ${(stats.monthGoal.current_value || 0).toLocaleString("pt-BR")} / ${(stats.monthGoal.target_value || 0).toLocaleString("pt-BR")}` : "Sem meta"}
              icon={<Target size={16} />}
              highlight
            />
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Leads Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card-elevated p-4 lg:col-span-2"
          >
            <h3 className="mb-3 text-sm font-medium text-foreground">Leads da Semana</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekChartData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={30} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorLeads)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pipeline Donut */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-elevated p-4"
          >
            <h3 className="mb-3 text-sm font-medium text-foreground">Pipeline</h3>
            <div className="flex flex-col items-center">
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                {pipelineData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">
                      {item.name}: <span className="font-medium text-foreground">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent Leads */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card-elevated p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Leads Recentes</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/pipeline")} className="text-xs h-7">
                Ver todos
              </Button>
            </div>
            <div className="space-y-2">
              {stats?.recentLeads?.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum lead ainda</p>
              ) : (
                stats?.recentLeads?.slice(0, 4).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-md border border-border p-2.5 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/pipeline")}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {lead.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone size={10} />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={10} />
                      {format(new Date(lead.created_at), "dd/MM")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-elevated p-4"
          >
            <h3 className="text-sm font-medium text-foreground mb-3">Resumo</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats?.totalLeads || 0}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats?.totalClients || 0}</p>
                <p className="text-xs text-muted-foreground">Clientes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-500">
                  R$ {((stats?.monthlyRecurrence || 0) / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-muted-foreground">MRR</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
