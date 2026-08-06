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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_email_allowlist: {
        Row: {
          created_at: string
          email: string
          note: string | null
        }
        Insert: {
          created_at?: string
          email: string
          note?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          note?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image_key: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          tagline: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_key?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          tagline?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_key?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_document_versions: {
        Row: {
          content: string
          created_at: string
          document_id: string
          id: string
          intro: string
          published_by: string | null
          published_by_email: string
          title: string
        }
        Insert: {
          content?: string
          created_at?: string
          document_id: string
          id?: string
          intro?: string
          published_by?: string | null
          published_by_email?: string
          title?: string
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          id?: string
          intro?: string
          published_by?: string | null
          published_by_email?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          created_at: string
          draft_content: string
          eyebrow: string
          id: string
          intro: string
          page_label: string
          published_at: string | null
          published_content: string
          slug: string
          title: string
          updated_at: string
          updated_by: string | null
          updated_by_email: string
        }
        Insert: {
          created_at?: string
          draft_content?: string
          eyebrow?: string
          id?: string
          intro?: string
          page_label?: string
          published_at?: string | null
          published_content?: string
          slug: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          updated_by_email?: string
        }
        Update: {
          created_at?: string
          draft_content?: string
          eyebrow?: string
          id?: string
          intro?: string
          page_label?: string
          published_at?: string | null
          published_content?: string
          slug?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          updated_by_email?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          customization: Json
          id: string
          installation_fee: number
          line_total: number
          order_id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          screw_color: string | null
          size_id: string | null
          size_label: string | null
          sku: string | null
          unit_price: number
          with_installation: boolean
        }
        Insert: {
          created_at?: string
          customization?: Json
          id?: string
          installation_fee?: number
          line_total?: number
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity?: number
          screw_color?: string | null
          size_id?: string | null
          size_label?: string | null
          sku?: string | null
          unit_price?: number
          with_installation?: boolean
        }
        Update: {
          created_at?: string
          customization?: Json
          id?: string
          installation_fee?: number
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          screw_color?: string | null
          size_id?: string | null
          size_label?: string | null
          sku?: string | null
          unit_price?: number
          with_installation?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string
          discount: number
          fulfillment_type: string
          id: string
          installation_fee: number
          notes: string | null
          order_number: number
          payment_meta: Json
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          shipping_address: Json
          shipping_fee: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          discount?: number
          fulfillment_type?: string
          id?: string
          installation_fee?: number
          notes?: string | null
          order_number?: number
          payment_meta?: Json
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address?: Json
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          discount?: number
          fulfillment_type?: string
          id?: string
          installation_fee?: number
          notes?: string | null
          order_number?: number
          payment_meta?: Json
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address?: Json
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      page_seo: {
        Row: {
          breadcrumb_title: string
          canonical_url: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          keywords: string
          og_description: string
          og_image: string
          og_title: string
          page_label: string
          robots_follow: boolean
          robots_index: boolean
          route_path: string
          schema_jsonld: Json
          title: string
          twitter_card: string
          updated_at: string
        }
        Insert: {
          breadcrumb_title?: string
          canonical_url?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          keywords?: string
          og_description?: string
          og_image?: string
          og_title?: string
          page_label?: string
          robots_follow?: boolean
          robots_index?: boolean
          route_path: string
          schema_jsonld?: Json
          title?: string
          twitter_card?: string
          updated_at?: string
        }
        Update: {
          breadcrumb_title?: string
          canonical_url?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          keywords?: string
          og_description?: string
          og_image?: string
          og_title?: string
          page_label?: string
          robots_follow?: boolean
          robots_index?: boolean
          route_path?: string
          schema_jsonld?: Json
          title?: string
          twitter_card?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          best_seller: boolean
          category_id: string | null
          colors: string[]
          created_at: string
          description: string
          display_mode: string
          id: string
          image_key: string
          is_hidden: boolean
          name: string
          orientation: Database["public"]["Enums"]["artwork_orientation"]
          sku: string | null
          slug: string
          sort_order: number
          style: string
          updated_at: string
        }
        Insert: {
          best_seller?: boolean
          category_id?: string | null
          colors?: string[]
          created_at?: string
          description?: string
          display_mode?: string
          id?: string
          image_key?: string
          is_hidden?: boolean
          name: string
          orientation?: Database["public"]["Enums"]["artwork_orientation"]
          sku?: string | null
          slug: string
          sort_order?: number
          style?: string
          updated_at?: string
        }
        Update: {
          best_seller?: boolean
          category_id?: string | null
          colors?: string[]
          created_at?: string
          description?: string
          display_mode?: string
          id?: string
          image_key?: string
          is_hidden?: boolean
          name?: string
          orientation?: Database["public"]["Enums"]["artwork_orientation"]
          sku?: string | null
          slug?: string
          sort_order?: number
          style?: string
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
      site_settings: {
        Row: {
          address: string
          business_hours: Json
          company_name: string
          contact_email: string
          contact_phone: string
          facebook_pixel_id: string
          facebook_url: string
          ga4_measurement_id: string
          google_business_url: string
          google_maps_url: string
          gsc_verification: string
          gtm_container_id: string
          id: boolean
          instagram_url: string
          large_size_install_note: string
          logo_url: string
          payment_methods: Json
          pickup_address: string
          pickup_enabled: boolean
          pickup_instructions: string
          shipping_lead_time_text: string
          show_warranty: boolean
          site_description: string
          site_title: string
          social_image_url: string
          tiktok_url: string
          updated_at: string
          whatsapp_number: string
          youtube_url: string
        }
        Insert: {
          address?: string
          business_hours?: Json
          company_name?: string
          contact_email?: string
          contact_phone?: string
          facebook_pixel_id?: string
          facebook_url?: string
          ga4_measurement_id?: string
          google_business_url?: string
          google_maps_url?: string
          gsc_verification?: string
          gtm_container_id?: string
          id?: boolean
          instagram_url?: string
          large_size_install_note?: string
          logo_url?: string
          payment_methods?: Json
          pickup_address?: string
          pickup_enabled?: boolean
          pickup_instructions?: string
          shipping_lead_time_text?: string
          show_warranty?: boolean
          site_description?: string
          site_title?: string
          social_image_url?: string
          tiktok_url?: string
          updated_at?: string
          whatsapp_number?: string
          youtube_url?: string
        }
        Update: {
          address?: string
          business_hours?: Json
          company_name?: string
          contact_email?: string
          contact_phone?: string
          facebook_pixel_id?: string
          facebook_url?: string
          ga4_measurement_id?: string
          google_business_url?: string
          google_maps_url?: string
          gsc_verification?: string
          gtm_container_id?: string
          id?: boolean
          instagram_url?: string
          large_size_install_note?: string
          logo_url?: string
          payment_methods?: Json
          pickup_address?: string
          pickup_enabled?: boolean
          pickup_instructions?: string
          shipping_lead_time_text?: string
          show_warranty?: boolean
          site_description?: string
          site_title?: string
          social_image_url?: string
          tiktok_url?: string
          updated_at?: string
          whatsapp_number?: string
          youtube_url?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      place_order: {
        Args: {
          _customer: Json
          _fulfillment: string
          _items: Json
          _notes: string
          _payment_meta: Json
          _payment_method: string
          _shipping_address: Json
        }
        Returns: {
          order_id: string
          order_number: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator"
      artwork_orientation: "square" | "rectangle"
      order_status:
        | "pending_payment"
        | "under_review"
        | "customer_contact"
        | "in_production"
        | "completed"
        | "cancelled"
      payment_method: "bank_transfer" | "bit" | "cash" | "online"
      payment_status: "pending" | "paid" | "refunded" | "failed"
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
      app_role: ["admin", "user", "moderator"],
      artwork_orientation: ["square", "rectangle"],
      order_status: [
        "pending_payment",
        "under_review",
        "customer_contact",
        "in_production",
        "completed",
        "cancelled",
      ],
      payment_method: ["bank_transfer", "bit", "cash", "online"],
      payment_status: ["pending", "paid", "refunded", "failed"],
    },
  },
} as const
