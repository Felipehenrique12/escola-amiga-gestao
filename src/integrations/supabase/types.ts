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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      alunos: {
        Row: {
          alergia: string | null
          created_at: string | null
          data_nascimento: string
          endereco: string | null
          id: string
          nome_completo: string
          nome_mae: string | null
          nome_pai: string | null
          telefone1: string | null
          telefone2: string | null
        }
        Insert: {
          alergia?: string | null
          created_at?: string | null
          data_nascimento: string
          endereco?: string | null
          id?: string
          nome_completo: string
          nome_mae?: string | null
          nome_pai?: string | null
          telefone1?: string | null
          telefone2?: string | null
        }
        Update: {
          alergia?: string | null
          created_at?: string | null
          data_nascimento?: string
          endereco?: string | null
          id?: string
          nome_completo?: string
          nome_mae?: string | null
          nome_pai?: string | null
          telefone1?: string | null
          telefone2?: string | null
        }
        Relationships: []
      }
      disciplina_turma: {
        Row: {
          disciplina_id: string
          id: string
          turma_id: string
        }
        Insert: {
          disciplina_id: string
          id?: string
          turma_id: string
        }
        Update: {
          disciplina_id?: string
          id?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disciplina_turma_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplina_turma_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinas: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          professor: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          professor: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          professor?: string
        }
        Relationships: []
      }
      eventos: {
        Row: {
          created_at: string | null
          descricao: string | null
          dia_inteiro: boolean | null
          fim: string | null
          id: string
          inicio: string
          tipo: string | null
          titulo: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          dia_inteiro?: boolean | null
          fim?: string | null
          id?: string
          inicio: string
          tipo?: string | null
          titulo: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          dia_inteiro?: boolean | null
          fim?: string | null
          id?: string
          inicio?: string
          tipo?: string | null
          titulo?: string
        }
        Relationships: []
      }
      matriculas: {
        Row: {
          aluno_id: string
          ano_letivo: number
          ativo: boolean | null
          id: string
          turma_id: string
        }
        Insert: {
          aluno_id: string
          ano_letivo: number
          ativo?: boolean | null
          id?: string
          turma_id: string
        }
        Update: {
          aluno_id?: string
          ano_letivo?: number
          ativo?: boolean | null
          id?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      notas: {
        Row: {
          aluno_id: string
          ano_letivo: number
          disciplina_id: string
          id: string
          u1: number | null
          u2: number | null
          u3: number | null
          u4: number | null
          updated_at: string | null
        }
        Insert: {
          aluno_id: string
          ano_letivo: number
          disciplina_id: string
          id?: string
          u1?: number | null
          u2?: number | null
          u3?: number | null
          u4?: number | null
          updated_at?: string | null
        }
        Update: {
          aluno_id?: string
          ano_letivo?: number
          disciplina_id?: string
          id?: string
          u1?: number | null
          u2?: number | null
          u3?: number | null
          u4?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          aluno_id: string
          ano_letivo: number
          id: string
          mes: number
          obs: string | null
          pago: boolean
          pago_em: string | null
        }
        Insert: {
          aluno_id: string
          ano_letivo: number
          id?: string
          mes: number
          obs?: string | null
          pago?: boolean
          pago_em?: string | null
        }
        Update: {
          aluno_id?: string
          ano_letivo?: number
          id?: string
          mes?: number
          obs?: string | null
          pago?: boolean
          pago_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          ano_letivo: number
          created_at: string | null
          id: string
          nome: string
          turno: string | null
        }
        Insert: {
          ano_letivo: number
          created_at?: string | null
          id?: string
          nome: string
          turno?: string | null
        }
        Update: {
          ano_letivo?: number
          created_at?: string | null
          id?: string
          nome?: string
          turno?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
