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
      chats: {
        Row: {
          broker_id: string
          buyer_id: string
          created_at: string | null
          id: string
          last_message: string | null
          last_message_at: string | null
          property_id: string | null
          requirement_id: string | null
          updated_at: string | null
        }
        Insert: {
          broker_id: string
          buyer_id: string
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          property_id?: string | null
          requirement_id?: string | null
          updated_at?: string | null
        }
        Update: {
          broker_id?: string
          buyer_id?: string
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          property_id?: string | null
          requirement_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          broker_id: string
          buyer_id: string
          created_at: string | null
          id: string
          notes: string | null
          property_id: string | null
          requirement_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          broker_id: string
          buyer_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          requirement_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          broker_id?: string
          buyer_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          requirement_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_leads_property_id"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_leads_requirement_id"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: string[] | null
          chat_id: string
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          sender_id: string
        }
        Insert: {
          attachments?: string[] | null
          chat_id: string
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          sender_id: string
        }
        Update: {
          attachments?: string[] | null
          chat_id?: string
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_license: string | null
          coin_balance: number | null
          company_name: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          kyc_status: string | null
          last_name: string | null
          mobile: string | null
          operating_areas: Json | null
          rating: number | null
          subscription_expires_at: string | null
          subscription_type: string | null
          total_reviews: number | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          avatar_url?: string | null
          business_license?: string | null
          coin_balance?: number | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          kyc_status?: string | null
          last_name?: string | null
          mobile?: string | null
          operating_areas?: Json | null
          rating?: number | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          avatar_url?: string | null
          business_license?: string | null
          coin_balance?: number | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          kyc_status?: string | null
          last_name?: string | null
          mobile?: string | null
          operating_areas?: Json | null
          rating?: number | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      properties: {
        Row: {
          amenities: string[] | null
          approval_id: string | null
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          broker_id: string
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          location: Json | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          status: Database["public"]["Enums"]["property_status"] | null
          title: string
          updated_at: string | null
          user_status: Database["public"]["Enums"]["user_property_status"]
        }
        Insert: {
          amenities?: string[] | null
          approval_id?: string | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          broker_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          location?: Json | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          status?: Database["public"]["Enums"]["property_status"] | null
          title: string
          updated_at?: string | null
          user_status?: Database["public"]["Enums"]["user_property_status"]
        }
        Update: {
          amenities?: string[] | null
          approval_id?: string | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          broker_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          location?: Json | null
          price?: number
          property_type?: Database["public"]["Enums"]["property_type"]
          status?: Database["public"]["Enums"]["property_status"] | null
          title?: string
          updated_at?: string | null
          user_status?: Database["public"]["Enums"]["user_property_status"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_properties_approval_id"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "property_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "property_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_approvals: {
        Row: {
          admin_notes: string | null
          amenities: string[] | null
          approved_at: string | null
          approved_by: string | null
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          broker_id: string
          category: string | null
          created_at: string
          description: string | null
          documents: string[] | null
          id: string
          images: string[] | null
          location: Json | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          status: Database["public"]["Enums"]["approval_status"] | null
          submitted_at: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amenities?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          broker_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          documents?: string[] | null
          id?: string
          images?: string[] | null
          location?: Json | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          status?: Database["public"]["Enums"]["approval_status"] | null
          submitted_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amenities?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          broker_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          documents?: string[] | null
          id?: string
          images?: string[] | null
          location?: Json | null
          price?: number
          property_type?: Database["public"]["Enums"]["property_type"]
          status?: Database["public"]["Enums"]["approval_status"] | null
          submitted_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      property_matches: {
        Row: {
          broker_id: string
          buyer_id: string
          created_at: string
          id: string
          is_lead_purchased: boolean
          match_score: number
          property_id: string
          purchased_at: string | null
          requirement_id: string
          updated_at: string
        }
        Insert: {
          broker_id: string
          buyer_id: string
          created_at?: string
          id?: string
          is_lead_purchased?: boolean
          match_score?: number
          property_id: string
          purchased_at?: string | null
          requirement_id: string
          updated_at?: string
        }
        Update: {
          broker_id?: string
          buyer_id?: string
          created_at?: string
          id?: string
          is_lead_purchased?: boolean
          match_score?: number
          property_id?: string
          purchased_at?: string | null
          requirement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_property_matches_property_id"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_property_matches_requirement_id"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          amenities: string[] | null
          area_max: number | null
          area_min: number | null
          bathrooms: number | null
          bedrooms: number | null
          budget_max: number | null
          budget_min: number | null
          buyer_id: string
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          lead_price: number | null
          location: Json | null
          property_type: Database["public"]["Enums"]["property_type"]
          rejection_rate: number | null
          status: Database["public"]["Enums"]["requirement_status"] | null
          title: string
          type: string | null
          updated_at: string | null
          urgency: Database["public"]["Enums"]["urgency_level"] | null
        }
        Insert: {
          amenities?: string[] | null
          area_max?: number | null
          area_min?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          budget_max?: number | null
          budget_min?: number | null
          buyer_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lead_price?: number | null
          location?: Json | null
          property_type: Database["public"]["Enums"]["property_type"]
          rejection_rate?: number | null
          status?: Database["public"]["Enums"]["requirement_status"] | null
          title: string
          type?: string | null
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Update: {
          amenities?: string[] | null
          area_max?: number | null
          area_min?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          budget_max?: number | null
          budget_min?: number | null
          buyer_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lead_price?: number | null
          location?: Json | null
          property_type?: Database["public"]["Enums"]["property_type"]
          rejection_rate?: number | null
          status?: Database["public"]["Enums"]["requirement_status"] | null
          title?: string
          type?: string | null
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Relationships: [
          {
            foreignKeyName: "requirements_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      sent_leads: {
        Row: {
          broker_id: string | null
          budget_max: number | null
          budget_min: number | null
          buyer_id: string | null
          category: string | null
          created_at: string | null
          id: string | null
          lead_price: number | null
          location: Json | null
          notes: string | null
          property_id: string | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          rejection_rate: number | null
          requirement_id: string | null
          requirement_status:
            | Database["public"]["Enums"]["requirement_status"]
            | null
          status: string | null
          type: string | null
          updated_at: string | null
          urgency: Database["public"]["Enums"]["urgency_level"] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_leads_property_id"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_leads_requirement_id"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      approve_property: {
        Args: { _admin_id: string; _approval_id: string }
        Returns: string
      }
      calculate_property_match_score: {
        Args: { _property_id: string; _requirement_id: string }
        Returns: number
      }
      get_account_type_by_email: {
        Args: { _email: string }
        Returns: string
      }
      get_profile_public: {
        Args: { target_user_id: string }
        Returns: {
          company_name: string
          first_name: string
          last_name: string
        }[]
      }
      get_user_chats: {
        Args: { _user_id: string }
        Returns: {
          broker_id: string
          buyer_id: string
          created_at: string
          id: string
          last_message: string
          last_message_at: string
          property_id: string
          requirement_id: string
          updated_at: string
        }[]
      }
      get_user_profile: {
        Args: { _user_id: string }
        Returns: {
          avatar_url: string
          coin_balance: number
          company_name: string
          created_at: string
          email: string
          first_name: string
          id: string
          kyc_status: string
          last_name: string
          mobile: string
          rating: number
          total_reviews: number
          user_type: Database["public"]["Enums"]["user_type"]
        }[]
      }
      match_properties_to_requirement: {
        Args: { _requirement_id: string }
        Returns: {
          broker_id: string
          location: Json
          match_score: number
          price: number
          property_id: string
          title: string
        }[]
      }
      purchase_lead: {
        Args:
          | { _broker_id: string; _match_id: string }
          | {
              p_buyer_id: string
              p_lead_price: number
              p_match_id: string
              p_requirement_id: string
            }
        Returns: Json
      }
      refresh_broker_property_matches: {
        Args: { _broker_id: string }
        Returns: number
      }
      reject_property: {
        Args: { _admin_id: string; _admin_notes?: string; _approval_id: string }
        Returns: boolean
      }
      update_user_coin_balance: {
        Args: {
          _amount: number
          _description?: string
          _reference_id?: string
          _transaction_type: Database["public"]["Enums"]["transaction_type"]
          _user_id: string
        }
        Returns: boolean
      }
      user_has_chat_access: {
        Args: { _chat_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      approval_status: "pending" | "approved" | "rejected"
      property_status: "active" | "sold" | "inactive"
      property_type:
        | "apartment"
        | "villa"
        | "house"
        | "plot"
        | "commercial"
        | "office"
      requirement_status: "active" | "matched" | "closed"
      transaction_type: "debit" | "credit" | "refund"
      urgency_level: "low" | "medium" | "high" | "urgent"
      user_property_status: "active" | "sold" | "inactive"
      user_type: "buyer" | "broker"
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
      approval_status: ["pending", "approved", "rejected"],
      property_status: ["active", "sold", "inactive"],
      property_type: [
        "apartment",
        "villa",
        "house",
        "plot",
        "commercial",
        "office",
      ],
      requirement_status: ["active", "matched", "closed"],
      transaction_type: ["debit", "credit", "refund"],
      urgency_level: ["low", "medium", "high", "urgent"],
      user_property_status: ["active", "sold", "inactive"],
      user_type: ["buyer", "broker"],
    },
  },
} as const
