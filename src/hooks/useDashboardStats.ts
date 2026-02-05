import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).toISOString();
      
      // Leads hoje
      const { count: leadsToday } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfDay);
      
      // Total leads
      const { count: totalLeads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });
      
      // Leads por estágio
      const { data: leadsByStage } = await supabase
        .from("leads")
        .select("stage");
      
      const stageCounts = {
        contato_feito: 0,
        aquecendo: 0,
        proposta_enviada: 0,
        venda_concluida: 0,
      };
      
      leadsByStage?.forEach((lead) => {
        if (lead.stage && lead.stage in stageCounts) {
          stageCounts[lead.stage as keyof typeof stageCounts]++;
        }
      });
      
      // Clientes
      const { count: totalClients } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });
      
      // Clientes por status
      const { data: clientsByStatus } = await supabase
        .from("clients")
        .select("status");
      
      const statusCounts = {
        entregue: 0,
        andamento: 0,
        cancelado: 0,
      };
      
      clientsByStatus?.forEach((client) => {
        if (client.status && client.status in statusCounts) {
          statusCounts[client.status as keyof typeof statusCounts]++;
        }
      });

      // Clientes recorrentes
      const { count: recurringClients } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("is_recurrent", true);
      
      // Vendas do mês (clientes com sale_value)
      const { data: monthSales } = await supabase
        .from("clients")
        .select("sale_value")
        .gte("created_at", startOfMonth);
      
      const monthRevenue = monthSales?.reduce((acc, c) => acc + (c.sale_value || 0), 0) || 0;
      const salesCount = monthSales?.filter(c => c.sale_value && c.sale_value > 0).length || 0;
      
      // Recorrentes (valor total mensal potencial)
      const { data: recurrents } = await supabase
        .from("clients")
        .select("recurrence_value")
        .eq("is_recurrent", true)
        .neq("status", "cancelado");
      
      const monthlyRecurrence = recurrents?.reduce((acc, c) => acc + (c.recurrence_value || 0), 0) || 0;

      // MRR pago do mês atual
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const { data: paidBillings } = await supabase
        .from("billings")
        .select("amount")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .eq("is_paid", true);
      
      const paidMRR = paidBillings?.reduce((acc, b) => acc + (b.amount || 0), 0) || 0;

      // Churn do mês
      const { data: churnBillings } = await supabase
        .from("billings")
        .select("amount")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .eq("status", "cancelled");
      
      const churnValue = churnBillings?.reduce((acc, b) => acc + (b.amount || 0), 0) || 0;
      const churnCount = churnBillings?.length || 0;
      
      // Meta do mês
      const { data: monthGoal } = await supabase
        .from("goals")
        .select("*")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .eq("type", "faturamento")
        .single();
      
      // Leads da semana para gráfico
      const { data: weekLeads } = await supabase
        .from("leads")
        .select("created_at")
        .gte("created_at", startOfWeek);
      
      // Leads por fonte
      const { data: leadsBySource } = await supabase
        .from("leads")
        .select("source");
      
      const sourceCounts: Record<string, number> = {};
      leadsBySource?.forEach((lead) => {
        const source = lead.source || "outro";
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });
      
      // Últimos leads
      const { data: recentLeads } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      // Cobranças pendentes
      const { data: pendingBillings } = await supabase
        .from("billings")
        .select("amount")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .eq("is_paid", false)
        .neq("status", "cancelled");
      
      const pendingAmount = pendingBillings?.reduce((acc, b) => acc + (b.amount || 0), 0) || 0;
      const pendingCount = pendingBillings?.length || 0;

      // Valor total de vendas (histórico)
      const { data: allSales } = await supabase
        .from("clients")
        .select("sale_value");
      
      const totalSalesValue = allSales?.reduce((acc, c) => acc + (c.sale_value || 0), 0) || 0;
      
      // Taxa de conversão
      const conversionRate = totalLeads && totalLeads > 0 
        ? Math.round((stageCounts.venda_concluida / totalLeads) * 100) 
        : 0;

      // Churn rate
      const churnRate = recurringClients && recurringClients > 0
        ? Math.round((churnCount / recurringClients) * 100)
        : 0;

      // Faturamento total do mês (vendas + recorrência paga)
      const totalMonthRevenue = monthRevenue + paidMRR;
      
      return {
        leadsToday: leadsToday || 0,
        totalLeads: totalLeads || 0,
        stageCounts,
        totalClients: totalClients || 0,
        recurringClients: recurringClients || 0,
        statusCounts,
        monthRevenue,
        salesCount,
        monthlyRecurrence,
        paidMRR,
        totalMonthRevenue,
        pendingAmount,
        pendingCount,
        churnValue,
        churnCount,
        churnRate,
        totalSalesValue,
        monthGoal,
        weekLeads,
        sourceCounts,
        recentLeads: recentLeads || [],
        conversionRate,
      };
    },
  });
};
