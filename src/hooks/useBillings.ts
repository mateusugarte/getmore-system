import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Billing {
  id: string;
  user_id: string;
  client_id: string;
  month: number;
  year: number;
  amount: number;
  is_paid: boolean | null;
  paid_at: string | null;
  notes: string | null;
  status: "pending" | "paid" | "cancelled" | "overdue";
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    name: string;
    email: string | null;
    phone: string | null;
    recurrence_date: number | null;
    contract_end_date: string | null;
  };
}

export interface RecurringClient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  recurrence_value: number | null;
  recurrence_date: number | null;
  contract_end_date: string | null;
  is_recurrent: boolean | null;
  status: string | null;
  created_at: string;
}

// Get billings for a specific month/year
export const useBillings = (month?: number, year?: number) => {
  return useQuery({
    queryKey: ["billings", month, year],
    queryFn: async () => {
      let query = supabase
        .from("billings")
        .select(`
          *,
          client:clients(name, email, phone, recurrence_date, contract_end_date)
        `)
        .order("created_at", { ascending: false });

      if (month && year) {
        query = query.eq("month", month).eq("year", year);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Billing[];
    },
  });
};

// Get recurring clients that should have billings for a given month
export const useRecurringClientsForMonth = (month: number, year: number) => {
  return useQuery({
    queryKey: ["recurring-clients", month, year],
    queryFn: async () => {
      // Get all recurring clients that are active (not cancelled)
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .eq("is_recurrent", true)
        .neq("status", "cancelado")
        .not("recurrence_value", "is", null);

      if (clientsError) throw clientsError;

      // Get existing billings for this month
      const { data: existingBillings, error: billingsError } = await supabase
        .from("billings")
        .select("client_id, status")
        .eq("month", month)
        .eq("year", year);

      if (billingsError) throw billingsError;

      const billingMap = new Map(existingBillings?.map(b => [b.client_id, b.status]));
      const monthDate = new Date(year, month - 1, 1);
      const today = new Date();

      // Filter clients that should appear this month
      return clients?.filter(client => {
        const clientCreatedAt = new Date(client.created_at);
        const contractEnd = client.contract_end_date ? new Date(client.contract_end_date) : null;
        
        // Client must have been created before or during this month
        if (clientCreatedAt > new Date(year, month, 0)) return false;
        
        // If contract has ended before this month, don't show
        if (contractEnd && contractEnd < monthDate) return false;
        
        // If billing was cancelled for this client, don't show
        const billingStatus = billingMap.get(client.id);
        if (billingStatus === "cancelled") return false;
        
        return true;
      }) as RecurringClient[];
    },
  });
};

// Generate or get billings for the month, including overdue detection
export const useMonthBillingsWithStatus = (month: number, year: number) => {
  return useQuery({
    queryKey: ["billings-with-status", month, year],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Get all recurring clients
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .eq("is_recurrent", true)
        .not("recurrence_value", "is", null);

      if (clientsError) throw clientsError;

      // Get existing billings for this month
      const { data: existingBillings, error: billingsError } = await supabase
        .from("billings")
        .select(`
          *,
          client:clients(name, email, phone, recurrence_date, contract_end_date, status)
        `)
        .eq("month", month)
        .eq("year", year);

      if (billingsError) throw billingsError;

      const existingClientIds = new Set(existingBillings?.map(b => b.client_id));
      const today = new Date();
      const monthDate = new Date(year, month - 1, 1);

      // Create billings for clients that don't have one yet
      const clientsNeedingBilling = clients?.filter(client => {
        if (existingClientIds.has(client.id)) return false;
        if (client.status === "cancelado") return false;
        
        const clientCreatedAt = new Date(client.created_at);
        const contractEnd = client.contract_end_date ? new Date(client.contract_end_date) : null;
        
        // Only create billing if client existed before/during this month
        if (clientCreatedAt > new Date(year, month, 0)) return false;
        
        // Don't create billing if contract ended before this month
        if (contractEnd && contractEnd < monthDate) return false;
        
        return true;
      });

      // Auto-create billings for clients that need one
      if (clientsNeedingBilling && clientsNeedingBilling.length > 0) {
        const newBillings = clientsNeedingBilling.map(client => ({
          user_id: user.id,
          client_id: client.id,
          month,
          year,
          amount: client.recurrence_value || 0,
          is_paid: false,
          status: "pending" as const,
        }));

        await supabase.from("billings").insert(newBillings);
        
        // Re-fetch to get complete data
        const { data: refreshedBillings } = await supabase
          .from("billings")
          .select(`
            *,
            client:clients(name, email, phone, recurrence_date, contract_end_date, status)
          `)
          .eq("month", month)
          .eq("year", year);

        return processOverdueStatus(refreshedBillings || [], today, month, year);
      }

      return processOverdueStatus(existingBillings || [], today, month, year);
    },
  });
};

// Helper to determine overdue status
function processOverdueStatus(billings: any[], today: Date, month: number, year: number): Billing[] {
  return billings.map(billing => {
    if (billing.status === "paid" || billing.status === "cancelled") {
      return billing;
    }

    const recurrenceDate = billing.client?.recurrence_date || 1;
    const dueDate = new Date(year, month - 1, recurrenceDate);
    
    if (today > dueDate && billing.status === "pending") {
      return { ...billing, status: "overdue" as const };
    }
    
    return billing;
  });
}

export const usePendingBillings = () => {
  return useQuery({
    queryKey: ["billings", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billings")
        .select(`
          *,
          client:clients(name, email, phone, recurrence_date)
        `)
        .eq("is_paid", false)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Billing[];
    },
  });
};

export const useUpdateBilling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      is_paid?: boolean;
      paid_at?: string | null;
      notes?: string | null;
      status?: "pending" | "paid" | "cancelled" | "overdue";
      cancelled_at?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("billings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};

// Cancel billing and mark as churn
export const useCancelBilling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("billings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          is_paid: false,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};

export const useGenerateBillings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id, recurrence_value, contract_end_date, status, created_at")
        .eq("is_recurrent", true)
        .not("recurrence_value", "is", null);

      if (clientsError) throw clientsError;

      const { data: existing, error: existingError } = await supabase
        .from("billings")
        .select("client_id")
        .eq("month", month)
        .eq("year", year);

      if (existingError) throw existingError;

      const existingClientIds = new Set(existing?.map((b) => b.client_id));
      const monthDate = new Date(year, month - 1, 1);

      const newBillings = clients
        ?.filter((c) => {
          if (existingClientIds.has(c.id)) return false;
          if (c.status === "cancelado") return false;
          
          const clientCreatedAt = new Date(c.created_at);
          const contractEnd = c.contract_end_date ? new Date(c.contract_end_date) : null;
          
          if (clientCreatedAt > new Date(year, month, 0)) return false;
          if (contractEnd && contractEnd < monthDate) return false;
          
          return true;
        })
        .map((c) => ({
          user_id: user.id,
          client_id: c.id,
          month,
          year,
          amount: c.recurrence_value,
          is_paid: false,
          status: "pending" as const,
        }));

      if (newBillings && newBillings.length > 0) {
        const { error } = await supabase.from("billings").insert(newBillings);
        if (error) throw error;
      }

      return { created: newBillings?.length || 0 };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billings"] });
    },
  });
};

export const usePaidMRR = () => {
  return useQuery({
    queryKey: ["billings", "mrr"],
    queryFn: async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const { data, error } = await supabase
        .from("billings")
        .select("amount")
        .eq("month", month)
        .eq("year", year)
        .eq("is_paid", true);

      if (error) throw error;

      return data?.reduce((acc, b) => acc + (b.amount || 0), 0) || 0;
    },
  });
};

// Churn count for current month
export const useMonthlyChurn = () => {
  return useQuery({
    queryKey: ["billings", "churn"],
    queryFn: async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const { data, error } = await supabase
        .from("billings")
        .select("id, amount")
        .eq("month", month)
        .eq("year", year)
        .eq("status", "cancelled");

      if (error) throw error;

      return {
        count: data?.length || 0,
        value: data?.reduce((acc, b) => acc + (b.amount || 0), 0) || 0,
      };
    },
  });
};

// Total revenue = sales from clients + paid recurrences
export const useMonthlyRevenue = () => {
  return useQuery({
    queryKey: ["revenue", "monthly"],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("sale_value, recurrence_value, is_recurrent")
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);

      if (clientsError) throw clientsError;

      const salesRevenue = clients?.reduce((acc, c) => acc + (c.sale_value || 0), 0) || 0;

      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const { data: billings, error: billingsError } = await supabase
        .from("billings")
        .select("amount")
        .eq("month", month)
        .eq("year", year)
        .eq("is_paid", true);

      if (billingsError) throw billingsError;

      const recurrenceRevenue = billings?.reduce((acc, b) => acc + (b.amount || 0), 0) || 0;

      return {
        sales: salesRevenue,
        recurrence: recurrenceRevenue,
        total: salesRevenue + recurrenceRevenue,
      };
    },
  });
};
