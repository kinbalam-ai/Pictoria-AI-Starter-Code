export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      generated_hanzi: {
        Row: {
          created_at: string
          guidance_scale: number | null
          id: number
          image_name: string | null
          model: string
          num_inference_steps: number | null
          prompt: string | null
          standard_character: string
          traditional_character: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guidance_scale?: number | null
          id?: never
          image_name?: string | null
          model?: string
          num_inference_steps?: number | null
          prompt?: string | null
          standard_character: string
          traditional_character?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guidance_scale?: number | null
          id?: never
          image_name?: string | null
          model?: string
          num_inference_steps?: number | null
          prompt?: string | null
          standard_character?: string
          traditional_character?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          aspect_ratio: string | null
          created_at: string
          guidance: number | null
          height: number | null
          id: number
          image_name: string | null
          model: string | null
          num_inference_steps: number | null
          output_format: string | null
          prompt: string | null
          user_id: string | null
          width: number | null
        }
        Insert: {
          aspect_ratio?: string | null
          created_at?: string
          guidance?: number | null
          height?: number | null
          id?: never
          image_name?: string | null
          model?: string | null
          num_inference_steps?: number | null
          output_format?: string | null
          prompt?: string | null
          user_id?: string | null
          width?: number | null
        }
        Update: {
          aspect_ratio?: string | null
          created_at?: string
          guidance?: number | null
          height?: number | null
          id?: never
          image_name?: string | null
          model?: string | null
          num_inference_steps?: number | null
          output_format?: string | null
          prompt?: string | null
          user_id?: string | null
          width?: number | null
        }
        Relationships: []
      }
      hanzis: {
        Row: {
          created_at: string
          definition: string
          frequency_rank: number | null
          hsk_level: number
          id: number
          is_identical: boolean
          pinyin: Json
          simplified_radical_ids: Json
          simplified_stroke_count: number
          standard_character: string
          traditional_character: string
          traditional_radical_ids: Json
          traditional_stroke_count: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          definition: string
          frequency_rank?: number | null
          hsk_level: number
          id?: number
          is_identical?: boolean
          pinyin?: Json
          simplified_radical_ids?: Json
          simplified_stroke_count: number
          standard_character: string
          traditional_character: string
          traditional_radical_ids?: Json
          traditional_stroke_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          definition?: string
          frequency_rank?: number | null
          hsk_level?: number
          id?: number
          is_identical?: boolean
          pinyin?: Json
          simplified_radical_ids?: Json
          simplified_stroke_count?: number
          standard_character?: string
          traditional_character?: string
          traditional_radical_ids?: Json
          traditional_stroke_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      radicals: {
        Row: {
          created_at: string
          forms: Json
          hsk_level: number | null
          id: number
          kangxi_number: number
          meaning: string
          name_en: string
          pinyin: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          forms?: Json
          hsk_level?: number | null
          id?: never
          kangxi_number: number
          meaning: string
          name_en: string
          pinyin?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          forms?: Json
          hsk_level?: number | null
          id?: never
          kangxi_number?: number
          meaning?: string
          name_en?: string
          pinyin?: Json
          user_id?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
