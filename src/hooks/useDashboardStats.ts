import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
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
      
      // Vendas do mês (clientes com sale_value)
      const { data: monthSales } = await supabase
        .from("clients")
        .select("sale_value")
        .gte("created_at", startOfMonth);
      
      const monthRevenue = monthSales?.reduce((acc, c) => acc + (c.sale_value || 0), 0) || 0;
      const salesCount = monthSales?.filter(c => c.sale_value && c.sale_value > 0).length || 0;
      
      // Recorrentes
      const { data: recurrents } = await supabase
        .from("clients")
        .select("recurrence_value")
        .eq("is_recurrent", true);
      
      const monthlyRecurrence = recurrents?.reduce((acc, c) => acc + (c.recurrence_value || 0), 0) || 0;
      
      // Meta do mês
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
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
      
      // Taxa de conversão
      const conversionRate = totalLeads && totalLeads > 0 
        ? Math.round((stageCounts.venda_concluida / totalLeads) * 100) 
        : 0;
      
      return {
        leadsToday: leadsToday || 0,
        totalLeads: totalLeads || 0,
        stageCounts,
        totalClients: totalClients || 0,
        statusCounts,
        monthRevenue,
        salesCount,
        monthlyRecurrence,
        monthGoal,
        weekLeads,
        sourceCounts,
        recentLeads: recentLeads || [],
        conversionRate,
      };
    },
  });
};
