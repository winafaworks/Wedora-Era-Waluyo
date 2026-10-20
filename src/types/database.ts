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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      booking_items: {
        Row: {
          booking_id: string
          catalog_item_id: string
          dibuat_pada: string | null
          id: string
        }
        Insert: {
          booking_id: string
          catalog_item_id: string
          dibuat_pada?: string | null
          id?: string
        }
        Update: {
          booking_id?: string
          catalog_item_id?: string
          dibuat_pada?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          catatan_khusus: string | null
          dekorasi: string | null
          dibuat_oleh: string | null
          dibuat_pada: string | null
          dikonfirmasi_pada: string | null
          dp_diterima: boolean | null
          dp_nominal: number | null
          fotografer: string | null
          hiburan: string | null
          id: string
          items_adat: Json | null
          items_dekorasi: Json | null
          items_mua: Json | null
          jam_adat: string | null
          jam_akad: string | null
          jam_resepsi: string | null
          kebaya_baju: string | null
          lokasi: string
          lokasi_makeup: string | null
          makeup: string | null
          mc: string | null
          nama_pelanggan: string
          no_wa: string
          package_id: string | null
          sisa_pembayaran: number | null
          status: string | null
          tanggal_acara: string
          token_konfirmasi: string
          total_biaya: number | null
          ukuran: string | null
          updated_at: string | null
          video: string | null
        }
        Insert: {
          catatan_khusus?: string | null
          dekorasi?: string | null
          dibuat_oleh?: string | null
          dibuat_pada?: string | null
          dikonfirmasi_pada?: string | null
          dp_diterima?: boolean | null
          dp_nominal?: number | null
          fotografer?: string | null
          hiburan?: string | null
          id?: string
          items_adat?: Json | null
          items_dekorasi?: Json | null
          items_mua?: Json | null
          jam_adat?: string | null
          jam_akad?: string | null
          jam_resepsi?: string | null
          kebaya_baju?: string | null
          lokasi: string
          lokasi_makeup?: string | null
          makeup?: string | null
          mc?: string | null
          nama_pelanggan: string
          no_wa: string
          package_id?: string | null
          sisa_pembayaran?: number | null
          status?: string | null
          tanggal_acara: string
          token_konfirmasi: string
          total_biaya?: number | null
          ukuran?: string | null
          updated_at?: string | null
          video?: string | null
        }
        Update: {
          catatan_khusus?: string | null
          dekorasi?: string | null
          dibuat_oleh?: string | null
          dibuat_pada?: string | null
          dikonfirmasi_pada?: string | null
          dp_diterima?: boolean | null
          dp_nominal?: number | null
          fotografer?: string | null
          hiburan?: string | null
          id?: string
          items_adat?: Json | null
          items_dekorasi?: Json | null
          items_mua?: Json | null
          jam_adat?: string | null
          jam_akad?: string | null
          jam_resepsi?: string | null
          kebaya_baju?: string | null
          lokasi?: string
          lokasi_makeup?: string | null
          makeup?: string | null
          mc?: string | null
          nama_pelanggan?: string
          no_wa?: string
          package_id?: string | null
          sisa_pembayaran?: number | null
          status?: string | null
          tanggal_acara?: string
          token_konfirmasi?: string
          total_biaya?: number | null
          ukuran?: string | null
          updated_at?: string | null
          video?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          aktif: boolean | null
          deskripsi: string | null
          dibuat_pada: string | null
          id: string
          jenis: string
          nama: string
          ukuran: string | null
          updated_at: string | null
        }
        Insert: {
          aktif?: boolean | null
          deskripsi?: string | null
          dibuat_pada?: string | null
          id?: string
          jenis: string
          nama: string
          ukuran?: string | null
          updated_at?: string | null
        }
        Update: {
          aktif?: boolean | null
          deskripsi?: string | null
          dibuat_pada?: string | null
          id?: string
          jenis?: string
          nama?: string
          ukuran?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      catalog_photos: {
        Row: {
          dibuat_pada: string | null
          id: string
          item_id: string
          url: string
          urutan: number | null
        }
        Insert: {
          dibuat_pada?: string | null
          id?: string
          item_id: string
          url: string
          urutan?: number | null
        }
        Update: {
          dibuat_pada?: string | null
          id?: string
          item_id?: string
          url?: string
          urutan?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_photos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          booking_id: string
          dibuat_pada: string | null
          dimuat: boolean | null
          dimuat_pada: string | null
          id: string
          kembali: boolean | null
          kembali_pada: string | null
          nama_barang: string
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          dibuat_pada?: string | null
          dimuat?: boolean | null
          dimuat_pada?: string | null
          id?: string
          kembali?: boolean | null
          kembali_pada?: string | null
          nama_barang: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          dibuat_pada?: string | null
          dimuat?: boolean | null
          dimuat_pada?: string | null
          id?: string
          kembali?: boolean | null
          kembali_pada?: string | null
          nama_barang?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          dibuat_pada: string | null
          id: string
          nama_barang: string
          package_id: string
        }
        Insert: {
          dibuat_pada?: string | null
          id?: string
          nama_barang: string
          package_id: string
        }
        Update: {
          dibuat_pada?: string | null
          id?: string
          nama_barang?: string
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_templates_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          booking_id: string
          dibuat_pada: string | null
          id: string
          isi: string
        }
        Insert: {
          booking_id: string
          dibuat_pada?: string | null
          id?: string
          isi: string
        }
        Update: {
          booking_id?: string
          dibuat_pada?: string | null
          id?: string
          isi?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          aktif: boolean | null
          deskripsi: string | null
          dibuat_pada: string | null
          harga_dasar: number | null
          id: string
          nama: string
          updated_at: string | null
        }
        Insert: {
          aktif?: boolean | null
          deskripsi?: string | null
          dibuat_pada?: string | null
          harga_dasar?: number | null
          id?: string
          nama: string
          updated_at?: string | null
        }
        Update: {
          aktif?: boolean | null
          deskripsi?: string | null
          dibuat_pada?: string | null
          harga_dasar?: number | null
          id?: string
          nama?: string
          updated_at?: string | null
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
