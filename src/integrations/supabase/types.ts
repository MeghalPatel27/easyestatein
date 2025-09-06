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
      disputes: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          dispute_type: string
          evidence_files: string[] | null
          id: string
          resolution_amount: number | null
          sent_lead_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          dispute_type: string
          evidence_files?: string[] | null
          id?: string
          resolution_amount?: number | null
          sent_lead_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          dispute_type?: string
          evidence_files?: string[] | null
          id?: string
          resolution_amount?: number | null
          sent_lead_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_sent_lead_id_fkey"
            columns: ["sent_lead_id"]
            isOneToOne: false
            referencedRelation: "sent_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          area_max: number | null
          area_min: number | null
          bathrooms: number | null
          bedrooms: number | null
          budget_max: number | null
          budget_min: number | null
          buyer_id: string
          category: string
          created_at: string
          description: string | null
          id: string
          lead_price: number | null
          location: Json
          rejection_rate: number | null
          specifications: Json | null
          status: string | null
          title: string
          type: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          area_max?: number | null
          area_min?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          budget_max?: number | null
          budget_min?: number | null
          buyer_id: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          lead_price?: number | null
          location?: Json
          rejection_rate?: number | null
          specifications?: Json | null
          status?: string | null
          title: string
          type: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          area_max?: number | null
          area_min?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          budget_max?: number | null
          budget_min?: number | null
          buyer_id?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          lead_price?: number | null
          location?: Json
          rejection_rate?: number | null
          specifications?: Json | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string
          urgency?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_license: string | null
          coin_balance: number | null
          company_name: string | null
          created_at: string
          display_name: string | null
          id: string
          kyc_status: string | null
          operating_areas: Json | null
          phone: string | null
          rating: number | null
          subscription_expires_at: string | null
          subscription_type: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          business_license?: string | null
          coin_balance?: number | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          kyc_status?: string | null
          operating_areas?: Json | null
          phone?: string | null
          rating?: number | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          business_license?: string | null
          coin_balance?: number | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          kyc_status?: string | null
          operating_areas?: Json | null
          phone?: string | null
          rating?: number | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          area: number
          bathrooms: number | null
          bedrooms: number | null
          category: Database["public"]["Enums"]["property_category"]
          completion_date: string | null
          created_at: string
          description: string | null
          documents: string[] | null
          id: string
          images: string[] | null
          location: Json
          price: number
          specifications: Json | null
          status: Database["public"]["Enums"]["property_status"]
          title: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          area: number
          bathrooms?: number | null
          bedrooms?: number | null
          category: Database["public"]["Enums"]["property_category"]
          completion_date?: string | null
          created_at?: string
          description?: string | null
          documents?: string[] | null
          id?: string
          images?: string[] | null
          location?: Json
          price: number
          specifications?: Json | null
          status?: Database["public"]["Enums"]["property_status"]
          title: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: number
          bathrooms?: number | null
          bedrooms?: number | null
          category?: Database["public"]["Enums"]["property_category"]
          completion_date?: string | null
          created_at?: string
          description?: string | null
          documents?: string[] | null
          id?: string
          images?: string[] | null
          location?: Json
          price?: number
          specifications?: Json | null
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      requirements: {
        Row: {
          area_max: number | null
          area_min: number | null
          bathrooms: number | null
          bedrooms: number | null
          budget_max: number | null
          budget_min: number | null
          buyer_id: string
          created_at: string
          description: string | null
          id: string
          location: Json
          property_type: string
          status: string | null
          title: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          area_max?: number | null
          area_min?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          budget_max?: number | null
          budget_min?: number | null
          buyer_id: string
          created_at?: string
          description?: string | null
          id?: string
          location?: Json
          property_type: string
          status?: string | null
          title: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          area_max?: number | null
          area_min?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          budget_max?: number | null
          budget_min?: number | null
          buyer_id?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: Json
          property_type?: string
          status?: string | null
          title?: string
          updated_at?: string
          urgency?: string | null
        }
        Relationships: []
      }
      sent_leads: {
        Row: {
          broker_id: string
          broker_notes: string | null
          buyer_feedback: string | null
          coins_spent: number
          created_at: string
          id: string
          lead_id: string
          property_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          broker_id: string
          broker_notes?: string | null
          buyer_feedback?: string | null
          coins_spent?: number
          created_at?: string
          id?: string
          lead_id: string
          property_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          broker_id?: string
          broker_notes?: string | null
          buyer_feedback?: string | null
          coins_spent?: number
          created_at?: string
          id?: string
          lead_id?: string
          property_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sent_leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sent_leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          payment_id: string | null
          reference_id: string | null
          status: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          payment_id?: string | null
          reference_id?: string | null
          status?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          payment_id?: string | null
          reference_id?: string | null
          status?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_properties: {
        Row: {
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          category: Database["public"]["Enums"]["property_category"] | null
          completion_date: string | null
          created_at: string | null
          description: string | null
          id: string | null
          images: string[] | null
          location: Json | null
          price: number | null
          specifications: Json | null
          status: Database["public"]["Enums"]["property_status"] | null
          title: string | null
          type: Database["public"]["Enums"]["property_type"] | null
          updated_at: string | null
        }
        Insert: {
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          category?: Database["public"]["Enums"]["property_category"] | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: string[] | null
          location?: Json | null
          price?: number | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["property_status"] | null
          title?: string | null
          type?: Database["public"]["Enums"]["property_type"] | null
          updated_at?: string | null
        }
        Update: {
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          category?: Database["public"]["Enums"]["property_category"] | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: string[] | null
          location?: Json | null
          price?: number | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["property_status"] | null
          title?: string | null
          type?: Database["public"]["Enums"]["property_type"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      property_category: "residential" | "commercial" | "industrial" | "land"
      property_status: "available" | "sold" | "rented" | "under_offer"
      property_type:
        | "apartment"
        | "villa"
        | "townhouse"
        | "penthouse"
        | "office"
        | "retail"
        | "warehouse"
        | "showroom"
        | "factory"
        | "logistics"
        | "manufacturing"
        | "plot"
        | "farm"
        | "commercial_land"
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
      property_category: ["residential", "commercial", "industrial", "land"],
      property_status: ["available", "sold", "rented", "under_offer"],
      property_type: [
        "apartment",
        "villa",
        "townhouse",
        "penthouse",
        "office",
        "retail",
        "warehouse",
        "showroom",
        "factory",
        "logistics",
        "manufacturing",
        "plot",
        "farm",
        "commercial_land",
      ],
    },
  },
} as const
