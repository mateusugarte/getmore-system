import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Goal = Tables<"goals">;
export type GoalInsert = TablesInsert<"goals">;
export type GoalUpdate = TablesUpdate<"goals">;

export const useGoals = () => {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      
      if (error) throw error;
      return data as Goal[];
    },
  });
};

export const useGoalsByMonth = (month: number, year: number) => {
  return useQuery({
    queryKey: ["goals", month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("month", month)
        .eq("year", year);
      
      if (error) throw error;
      return data as Goal[];
    },
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (goal: Omit<GoalInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("goals")
        .insert({ ...goal, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: GoalUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

// Utility to ensure faturamento goal exists for a month
export const useEnsureFaturamentoGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      // Check if faturamento goal exists
      const { data: existing } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year)
        .eq("type", "faturamento")
        .single();
      
      if (existing) return existing;
      
      // Create default faturamento goal
      const { data, error } = await supabase
        .from("goals")
        .insert({
          user_id: user.id,
          title: "Faturamento",
          target_value: 0,
          current_value: 0,
          type: "faturamento",
          month,
          year,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};
