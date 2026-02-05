export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      client_processes: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_processes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          is_recurrent: boolean | null
          lead_id: string | null
          name: string
          notes: string | null
          phone: string | null
          product_sold: string | null
          recurrence_date: number | null
          recurrence_value: number | null
          sale_value: number | null
          status: Database["public"]["Enums"]["client_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_recurrent?: boolean | null
          lead_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          product_sold?: string | null
          recurrence_date?: number | null
          recurrence_value?: number | null
          sale_value?: number | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_recurrent?: boolean | null
          lead_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          product_sold?: string | null
          recurrence_date?: number | null
          recurrence_value?: number | null
          sale_value?: number | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      coleta_analise_leads: {
        Row: {
          enviar_mensagem: string | null
          id: string
          instagram: string | null
          mensagem: string | null
          mensagem_enviada: string | null
          nicho: string | null
          nome: string | null
          numero_whatsapp: string | null
          plataforma: string | null
          "resumo-call": string | null
        }
        Insert: {
          enviar_mensagem?: string | null
          id?: string
          instagram?: string | null
          mensagem?: string | null
          mensagem_enviada?: string | null
          nicho?: string | null
          nome?: string | null
          numero_whatsapp?: string | null
          plataforma?: string | null
          "resumo-call"?: string | null
        }
        Update: {
          enviar_mensagem?: string | null
          id?: string
          instagram?: string | null
          mensagem?: string | null
          mensagem_enviada?: string | null
          nicho?: string | null
          nome?: string | null
          numero_whatsapp?: string | null
          plataforma?: string | null
          "resumo-call"?: string | null
        }
        Relationships: []
      }
      contatos_getmore: {
        Row: {
          agendamento: string | null
          created_at: string
          email: string | null
          faturamento: string | null
          "follow-up": string | null
          id: string
          lembrete: string | null
          nicho: string | null
          nome: string | null
          nome_empresa: string | null
          número: string | null
          qualificação: string | null
          resumo: string | null
          ultima_mensagem: string | null
        }
        Insert: {
          agendamento?: string | null
          created_at: string
          email?: string | null
          faturamento?: string | null
          "follow-up"?: string | null
          id?: string
          lembrete?: string | null
          nicho?: string | null
          nome?: string | null
          nome_empresa?: string | null
          número?: string | null
          qualificação?: string | null
          resumo?: string | null
          ultima_mensagem?: string | null
        }
        Update: {
          agendamento?: string | null
          created_at?: string
          email?: string | null
          faturamento?: string | null
          "follow-up"?: string | null
          id?: string
          lembrete?: string | null
          nicho?: string | null
          nome?: string | null
          nome_empresa?: string | null
          número?: string | null
          qualificação?: string | null
          resumo?: string | null
          ultima_mensagem?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          current_value: number | null
          id: string
          month: number
          target_value: number
          title: string
          type: string | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          id?: string
          month: number
          target_value: number
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          current_value?: number | null
          id?: string
          month?: number
          target_value?: number
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      ideias: {
        Row: {
          created_at: string
          id: string
          ideia: string | null
        }
        Insert: {
          created_at: string
          id?: string
          ideia?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ideia?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          estimated_value: number | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: Database["public"]["Enums"]["lead_source"] | null
          stage: Database["public"]["Enums"]["lead_stage"] | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          stage?: Database["public"]["Enums"]["lead_stage"] | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          stage?: Database["public"]["Enums"]["lead_stage"] | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          acao_mensagem: string | null
          horario_envio: string | null
          id: string
          mensagem: string | null
          nome: string | null
          numero_telefone: string | null
          tipo_mensagem: string | null
        }
        Insert: {
          acao_mensagem?: string | null
          horario_envio?: string | null
          id?: string
          mensagem?: string | null
          nome?: string | null
          numero_telefone?: string | null
          tipo_mensagem?: string | null
        }
        Update: {
          acao_mensagem?: string | null
          horario_envio?: string | null
          id?: string
          mensagem?: string | null
          nome?: string | null
          numero_telefone?: string | null
          tipo_mensagem?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendas: {
        Row: {
          data_venda: string | null
          id: string
          modelo: string | null
          nome: string | null
          produto: string | null
          valor: string | null
        }
        Insert: {
          data_venda?: string | null
          id?: string
          modelo?: string | null
          nome?: string | null
          produto?: string | null
          valor?: string | null
        }
        Update: {
          data_venda?: string | null
          id?: string
          modelo?: string | null
          nome?: string | null
          produto?: string | null
          valor?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_client_owner: { Args: { _client_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      client_status: "entregue" | "andamento" | "cancelado"
      lead_source:
        | "instagram"
        | "prospeccao"
        | "trafego_pago"
        | "indicacao"
        | "outro"
      lead_stage:
        | "contato_feito"
        | "aquecendo"
        | "proposta_enviada"
        | "venda_concluida"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      client_status: ["entregue", "andamento", "cancelado"],
      lead_source: [
        "instagram",
        "prospeccao",
        "trafego_pago",
        "indicacao",
        "outro",
      ],
      lead_stage: [
        "contato_feito",
        "aquecendo",
        "proposta_enviada",
        "venda_concluida",
      ],
    },
  },
} as const
