import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { KPICard } from "@/components/KPICard";
import { ProgressRing } from "@/components/ProgressRing";
import { Users, DollarSign, Target, TrendingUp } from "lucide-react";

// Mock data
const leadsData = [
  { day: "Seg", value: 4 },
  { day: "Ter", value: 6 },
  { day: "Qua", value: 8 },
  { day: "Qui", value: 5 },
  { day: "Sex", value: 12 },
  { day: "Sáb", value: 9 },
  { day: "Hoje", value: 15 },
];

const pipelineData = [
  { name: "Contato Feito", value: 12, color: "#3B82F6" },
  { name: "Aquecendo", value: 8, color: "#E1AD01" },
  { name: "Proposta", value: 5, color: "#8B5CF6" },
  { name: "Vendido", value: 3, color: "#10B981" },
];

const sourceData = [
  { name: "Instagram", value: 45 },
  { name: "Tráfego Pago", value: 32 },
  { name: "Indicação", value: 18 },
  { name: "Prospecção", value: 12 },
];

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Visão geral do seu negócio
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <KPICard
              title="Leads Hoje"
              value="15"
              subtitle="Novos contatos"
              icon={<Users size={24} />}
              trend={{ value: 12, isPositive: true }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <KPICard
              title="Vendas no Mês"
              value="R$ 24.500"
              subtitle="3 vendas fechadas"
              icon={<DollarSign size={24} />}
              trend={{ value: 8, isPositive: true }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <KPICard
              title="Taxa de Conversão"
              value="18%"
              subtitle="Lead → Cliente"
              icon={<TrendingUp size={24} />}
              trend={{ value: 3, isPositive: true }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <KPICard
              title="Meta do Mês"
              value="68%"
              subtitle="R$ 24.5k de R$ 36k"
              icon={<Target size={24} />}
            />
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Leads Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-elevated p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Evolução de Leads
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pipeline Donut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card-elevated p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Distribuição do Pipeline
            </h3>
            <div className="flex items-center justify-center gap-8">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
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
                        borderRadius: "0.75rem",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {pipelineData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: <span className="font-medium text-foreground">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Source Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-elevated p-6"
        >
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Origem dos Leads
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
