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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bill_payments: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          provider: string
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          id?: string
          provider: string
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          provider?: string
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      bnpl_orders: {
        Row: {
          amount: number
          category: string
          created_at: string
          daily_repayment: number
          duration_days: number
          id: string
          status: string | null
          total_repaid: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          daily_repayment: number
          duration_days: number
          id?: string
          status?: string | null
          total_repaid?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          daily_repayment?: number
          duration_days?: number
          id?: string
          status?: string | null
          total_repaid?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gold_investments: {
        Row: {
          amount_inr: number
          created_at: string
          date: string
          gold_grams: number
          id: string
          price_per_gram: number
          user_id: string
        }
        Insert: {
          amount_inr: number
          created_at?: string
          date?: string
          gold_grams: number
          id?: string
          price_per_gram: number
          user_id: string
        }
        Update: {
          amount_inr?: number
          created_at?: string
          date?: string
          gold_grams?: number
          id?: string
          price_per_gram?: number
          user_id?: string
        }
        Relationships: []
      }
      group_savings: {
        Row: {
          created_at: string
          current_round: number
          id: string
          members: number
          monthly_contribution: number
          name: string
          status: string | null
          total_pool: number
          total_rounds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_round?: number
          id?: string
          members?: number
          monthly_contribution: number
          name: string
          status?: string | null
          total_pool?: number
          total_rounds: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_round?: number
          id?: string
          members?: number
          monthly_contribution?: number
          name?: string
          status?: string | null
          total_pool?: number
          total_rounds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      income_logs: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          payment_type: string | null
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          id?: string
          payment_type?: string | null
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          payment_type?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      insurance_policies: {
        Row: {
          coverage_amount: number
          created_at: string
          daily_premium: number
          end_date: string
          id: string
          start_date: string
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          coverage_amount: number
          created_at?: string
          daily_premium: number
          end_date: string
          id?: string
          start_date?: string
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          coverage_amount?: number
          created_at?: string
          daily_premium?: number
          end_date?: string
          id?: string
          start_date?: string
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      loan_ledger: {
        Row: {
          balance_after_paise: number
          created_at: string
          credit_paise: number
          debit_paise: number
          description: string
          entry_type: string
          id: string
          loan_id: string
          posted_at: string
          reference_id: string | null
          user_id: string
        }
        Insert: {
          balance_after_paise: number
          created_at?: string
          credit_paise?: number
          debit_paise?: number
          description?: string
          entry_type: string
          id?: string
          loan_id: string
          posted_at?: string
          reference_id?: string | null
          user_id: string
        }
        Update: {
          balance_after_paise?: number
          created_at?: string
          credit_paise?: number
          debit_paise?: number
          description?: string
          entry_type?: string
          id?: string
          loan_id?: string
          posted_at?: string
          reference_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          amount: number
          applied_at: string
          approved_at: string | null
          created_at: string
          due_date: string | null
          duration: number
          id: string
          interest_rate: number
          repaid_amount: number
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          applied_at?: string
          approved_at?: string | null
          created_at?: string
          due_date?: string | null
          duration: number
          id?: string
          interest_rate?: number
          repaid_amount?: number
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          applied_at?: string
          approved_at?: string | null
          created_at?: string
          due_date?: string | null
          duration?: number
          id?: string
          interest_rate?: number
          repaid_amount?: number
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      otp_attempts: {
        Row: {
          attempted_at: string
          id: string
          phone: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          phone: string
        }
        Update: {
          attempted_at?: string
          id?: string
          phone?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          city: string | null
          created_at: string
          credit_score: number | null
          id: string
          income_type: string | null
          kyc_doc_url: string | null
          kyc_status: string | null
          name: string
          occupation: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          city?: string | null
          created_at?: string
          credit_score?: number | null
          id?: string
          income_type?: string | null
          kyc_doc_url?: string | null
          kyc_status?: string | null
          name?: string
          occupation?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          city?: string | null
          created_at?: string
          credit_score?: number | null
          id?: string
          income_type?: string | null
          kyc_doc_url?: string | null
          kyc_status?: string | null
          name?: string
          occupation?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          coins: number
          created_at: string
          date: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          coins: number
          created_at?: string
          date?: string
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          coins?: number
          created_at?: string
          date?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          auto_save_amount: number
          category: string | null
          created_at: string
          current_amount: number
          id: string
          name: string
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_save_amount?: number
          category?: string | null
          created_at?: string
          current_amount?: number
          id?: string
          name: string
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_save_amount?: number
          category?: string | null
          created_at?: string
          current_amount?: number
          id?: string
          name?: string
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      loan_balances: {
        Row: {
          disbursed_paise: number | null
          fees_paise: number | null
          interest_paise: number | null
          interest_rate: number | null
          loan_id: string | null
          outstanding_paise: number | null
          principal_inr: number | null
          repaid_paise: number | null
          status: string | null
          user_id: string | null
          written_off_paise: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_otp_rate_limit: { Args: { _phone: string }; Returns: boolean }
      disburse_loan: { Args: { _loan_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          _action: string
          _entity_id?: string
          _entity_type?: string
          _metadata?: Json
        }
        Returns: string
      }
      post_loan_entry: {
        Args: {
          _amount_paise: number
          _description?: string
          _entry_type: string
          _loan_id: string
          _reference_id?: string
        }
        Returns: string
      }
      record_otp_attempt: { Args: { _phone: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
