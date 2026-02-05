import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Billing {
  id: string;
  user_id: string;
  client_id: string;
  month: number;
  year: number;
  amount: number;
  is_paid: boolean;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    name: string;
    email: string | null;
    phone: string | null;
  };
}

export const useBillings = (month?: number, year?: number) => {
  return useQuery({
    queryKey: ["billings", month, year],
    queryFn: async () => {
      let query = supabase
        .from("billings")
        .select(`
          *,
          client:clients(name, email, phone)
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

export const usePendingBillings = () => {
  return useQuery({
    queryKey: ["billings", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billings")
        .select(`
          *,
          client:clients(name, email, phone)
        `)
        .eq("is_paid", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Billing[];
    },
  });
};

export const useCreateBilling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billing: {
      client_id: string;
      month: number;
      year: number;
      amount: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("billings")
        .insert({
          ...billing,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billings"] });
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
    },
  });
};

export const useGenerateBillings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Get all recurring clients
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id, recurrence_value")
        .eq("is_recurrent", true)
        .not("recurrence_value", "is", null);

      if (clientsError) throw clientsError;

      // Check existing billings for this month
      const { data: existing, error: existingError } = await supabase
        .from("billings")
        .select("client_id")
        .eq("month", month)
        .eq("year", year);

      if (existingError) throw existingError;

      const existingClientIds = new Set(existing?.map((b) => b.client_id));

      // Create billings for clients that don't have one yet
      const newBillings = clients
        ?.filter((c) => !existingClientIds.has(c.id))
        .map((c) => ({
          user_id: user.id,
          client_id: c.id,
          month,
          year,
          amount: c.recurrence_value,
          is_paid: false,
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

// Total revenue = sales from clients + paid recurrences
export const useMonthlyRevenue = () => {
  return useQuery({
    queryKey: ["revenue", "monthly"],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      // Get all clients created this month with sale values
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("sale_value, recurrence_value, is_recurrent")
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);

      if (clientsError) throw clientsError;

      // Sum sale values
      const salesRevenue = clients?.reduce((acc, c) => acc + (c.sale_value || 0), 0) || 0;

      // Get paid billings this month
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
