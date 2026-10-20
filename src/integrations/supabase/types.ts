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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          ativo: boolean
          chip_id: string | null
          created_at: string
          data_inicio: string
          destino_id: string | null
          horario: string | null
          id: string
          intervalo_dias: number | null
          proximo_envio: string | null
          repeticao: string
          texto: string | null
          titulo: string
          ultimo_envio: string | null
          updated_at: string
          usar_chip: boolean
          usar_destino: boolean
          usar_horario: boolean
          usar_repeticao: boolean
          usar_texto: boolean
        }
        Insert: {
          ativo?: boolean
          chip_id?: string | null
          created_at?: string
          data_inicio?: string
          destino_id?: string | null
          horario?: string | null
          id?: string
          intervalo_dias?: number | null
          proximo_envio?: string | null
          repeticao?: string
          texto?: string | null
          titulo?: string
          ultimo_envio?: string | null
          updated_at?: string
          usar_chip?: boolean
          usar_destino?: boolean
          usar_horario?: boolean
          usar_repeticao?: boolean
          usar_texto?: boolean
        }
        Update: {
          ativo?: boolean
          chip_id?: string | null
          created_at?: string
          data_inicio?: string
          destino_id?: string | null
          horario?: string | null
          id?: string
          intervalo_dias?: number | null
          proximo_envio?: string | null
          repeticao?: string
          texto?: string | null
          titulo?: string
          ultimo_envio?: string | null
          updated_at?: string
          usar_chip?: boolean
          usar_destino?: boolean
          usar_horario?: boolean
          usar_repeticao?: boolean
          usar_texto?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_chip_id_fkey"
            columns: ["chip_id"]
            isOneToOne: false
            referencedRelation: "chips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_destino_id_fkey"
            columns: ["destino_id"]
            isOneToOne: false
            referencedRelation: "destinos"
            referencedColumns: ["id"]
          },
        ]
      }
      chips: {
        Row: {
          api_key: string | null
          created_at: string
          evolution_url: string
          id: string
          instancia: string
          nome: string
          numero: string
          status: string
          status_atualizado_em: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          evolution_url?: string
          id?: string
          instancia?: string
          nome: string
          numero?: string
          status?: string
          status_atualizado_em?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string
          evolution_url?: string
          id?: string
          instancia?: string
          nome?: string
          numero?: string
          status?: string
          status_atualizado_em?: string | null
        }
        Relationships: []
      }
      destinos: {
        Row: {
          created_at: string
          id: string
          identificador: string
          nome: string
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          identificador: string
          nome: string
          tipo?: string
        }
        Update: {
          created_at?: string
          id?: string
          identificador?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      envios: {
        Row: {
          agendamento_id: string | null
          enviado_em: string
          id: string
          resposta: string | null
          sucesso: boolean
        }
        Insert: {
          agendamento_id?: string | null
          enviado_em?: string
          id?: string
          resposta?: string | null
          sucesso?: boolean
        }
        Update: {
          agendamento_id?: string | null
          enviado_em?: string
          id?: string
          resposta?: string | null
          sucesso?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "envios_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
