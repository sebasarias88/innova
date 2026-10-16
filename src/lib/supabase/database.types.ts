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
      admin_settings: {
        Row: {
          id: number
          notification_email: string | null
          notification_whatsapp: string | null
          notify_new_bookings: boolean
          notify_new_orders: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          notification_email?: string | null
          notification_whatsapp?: string | null
          notify_new_bookings?: boolean
          notify_new_orders?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          notification_email?: string | null
          notification_whatsapp?: string | null
          notify_new_bookings?: boolean
          notify_new_orders?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string
          display_name: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: number
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      availability_exceptions: {
        Row: {
          created_at: string
          date: string
          end_time: string | null
          id: string
          is_closed: boolean
          note: string | null
          slot_minutes: number
          start_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          is_closed?: boolean
          note?: string | null
          slot_minutes?: number
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          is_closed?: boolean
          note?: string | null
          slot_minutes?: number
          start_time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      availability_rules: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          slot_minutes: number
          start_time: string
          updated_at: string
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean
          slot_minutes?: number
          start_time: string
          updated_at?: string
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          slot_minutes?: number
          start_time?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: []
      }
      booking_settings: {
        Row: {
          auto_confirm: boolean
          id: number
          is_enabled: boolean
          lead_time_hours: number
          max_days_ahead: number
          updated_at: string
        }
        Insert: {
          auto_confirm?: boolean
          id?: number
          is_enabled?: boolean
          lead_time_hours?: number
          max_days_ahead?: number
          updated_at?: string
        }
        Update: {
          auto_confirm?: boolean
          id?: number
          is_enabled?: boolean
          lead_time_hours?: number
          max_days_ahead?: number
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          address: string | null
          booking_number: number
          city: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          ends_at: string
          id: string
          internal_notes: string | null
          notes: string | null
          privacy_accepted_at: string | null
          privacy_version: string | null
          reference: string
          service_slug: string
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          booking_number?: never
          city: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          ends_at: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          privacy_accepted_at?: string | null
          privacy_version?: string | null
          reference?: string
          service_slug: string
          starts_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          booking_number?: never
          city?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          ends_at?: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          privacy_accepted_at?: string | null
          privacy_version?: string | null
          reference?: string
          service_slug?: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          product_slug: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name: string
          product_slug?: string | null
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_slug?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          city: string
          created_at: string
          currency: string
          customer_document: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          internal_notes: string | null
          notes: string | null
          order_number: number
          paid_at: string | null
          privacy_accepted_at: string | null
          privacy_version: string | null
          payment_method: string
          payment_status: string
          reference: string
          shipping_cost: number | null
          shipping_zone_id: string | null
          shipping_zone_name: string
          status: string
          subtotal: number
          total: number
          updated_at: string
          wompi_transaction_id: string | null
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          currency?: string
          customer_document?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number?: never
          paid_at?: string | null
          privacy_accepted_at?: string | null
          privacy_version?: string | null
          payment_method: string
          payment_status?: string
          reference: string
          shipping_cost?: number | null
          shipping_zone_id?: string | null
          shipping_zone_name: string
          status?: string
          subtotal: number
          total: number
          updated_at?: string
          wompi_transaction_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          currency?: string
          customer_document?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number?: never
          paid_at?: string | null
          privacy_accepted_at?: string | null
          privacy_version?: string | null
          payment_method?: string
          payment_status?: string
          reference?: string
          shipping_cost?: number | null
          shipping_zone_id?: string | null
          shipping_zone_name?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          wompi_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_shipping_zone_id_fkey"
            columns: ["shipping_zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          amount_in_cents: number | null
          event: string
          id: number
          payload: Json
          provider: string
          received_at: string
          reference: string | null
          status: string
          transaction_id: string
        }
        Insert: {
          amount_in_cents?: number | null
          event: string
          id?: never
          payload: Json
          provider?: string
          received_at?: string
          reference?: string | null
          status: string
          transaction_id: string
        }
        Update: {
          amount_in_cents?: number | null
          event?: string
          id?: never
          payload?: Json
          provider?: string
          received_at?: string
          reference?: string | null
          status?: string
          transaction_id?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          path: string
          product_id: string
          sort_order: number
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          path: string
          product_id: string
          sort_order?: number
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          path?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category_id: string
          compare_at_price: number | null
          created_at: string
          description: string | null
          id: string
          is_available: boolean
          is_featured: boolean
          is_published: boolean
          name: string
          price: number
          short_description: string | null
          sku: string | null
          slug: string
          sort_order: number
          specs: Json
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category_id: string
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean
          is_featured?: boolean
          is_published?: boolean
          name: string
          price: number
          short_description?: string | null
          sku?: string | null
          slug: string
          sort_order?: number
          specs?: Json
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category_id?: string
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean
          is_featured?: boolean
          is_published?: boolean
          name?: string
          price?: number
          short_description?: string | null
          sku?: string | null
          slug?: string
          sort_order?: number
          specs?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      project_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          path: string
          project_id: string
          sort_order: number
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          path: string
          project_id: string
          sort_order?: number
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          path?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string | null
          completed_on: string | null
          cover_path: string | null
          created_at: string
          description: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          location: string | null
          metrics: Json
          service_slug: string | null
          slug: string
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          completed_on?: string | null
          cover_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          metrics?: Json
          service_slug?: string | null
          slug: string
          sort_order?: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          completed_on?: string | null
          cover_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          metrics?: Json
          service_slug?: string | null
          slug?: string
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipping_zones: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_pickup: boolean
          name: string
          price: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_pickup?: boolean
          name: string
          price?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_pickup?: boolean
          name?: string
          price?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          business_hours: string | null
          city: string | null
          company_name: string
          email: string | null
          facebook_url: string | null
          id: number
          instagram_url: string | null
          phone_label: string
          tiktok_url: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          address?: string | null
          business_hours?: string | null
          city?: string | null
          company_name?: string
          email?: string | null
          facebook_url?: string | null
          id?: number
          instagram_url?: string | null
          phone_label?: string
          tiktok_url?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          address?: string | null
          business_hours?: string | null
          city?: string | null
          company_name?: string
          email?: string | null
          facebook_url?: string | null
          id?: number
          instagram_url?: string | null
          phone_label?: string
          tiktok_url?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_dashboard_stats: { Args: never; Returns: Json }
      apply_payment_event: {
        Args: {
          p_amount_in_cents: number
          p_event: string
          p_payload: Json
          p_reference: string
          p_status: string
          p_transaction_id: string
        }
        Returns: string
      }
      check_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: boolean
      }
      create_booking: {
        Args: { p_customer: Json; p_service_slug: string; p_starts_at: string }
        Returns: Json
      }
      create_order: {
        Args: {
          p_customer: Json
          p_items: Json
          p_payment_method: string
          p_shipping_zone_id: string
        }
        Returns: Json
      }
      get_available_slots: {
        Args: { p_from: string; p_to: string }
        Returns: {
          ends_at: string
          starts_at: string
        }[]
      }
      get_order_by_reference: { Args: { p_reference: string }; Returns: Json }
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
