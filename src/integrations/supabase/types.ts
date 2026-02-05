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
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string | null
          created_at: string
          doctor_name: string
          id: string
          medical_record_id: string | null
          notes: string | null
          purpose: string | null
          status: string | null
          updated_at: string
          worker_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time?: string | null
          created_at?: string
          doctor_name: string
          id?: string
          medical_record_id?: string | null
          notes?: string | null
          purpose?: string | null
          status?: string | null
          updated_at?: string
          worker_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string | null
          created_at?: string
          doctor_name?: string
          id?: string
          medical_record_id?: string | null
          notes?: string | null
          purpose?: string | null
          status?: string | null
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          aadhar_number: string | null
          created_at: string | null
          doctor_type: Database["public"]["Enums"]["doctor_type"]
          hospital_name: string
          id: string
          mobile_number: string | null
          name: string
          nmr_id: string | null
          unique_doctor_id: string
          updated_at: string | null
        }
        Insert: {
          aadhar_number?: string | null
          created_at?: string | null
          doctor_type: Database["public"]["Enums"]["doctor_type"]
          hospital_name: string
          id?: string
          mobile_number?: string | null
          name: string
          nmr_id?: string | null
          unique_doctor_id: string
          updated_at?: string | null
        }
        Update: {
          aadhar_number?: string | null
          created_at?: string | null
          doctor_type?: Database["public"]["Enums"]["doctor_type"]
          hospital_name?: string
          id?: string
          mobile_number?: string | null
          name?: string
          nmr_id?: string | null
          unique_doctor_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      medical_documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          medical_record_id: string | null
          uploaded_by: string | null
          worker_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          medical_record_id?: string | null
          uploaded_by?: string | null
          worker_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          medical_record_id?: string | null
          uploaded_by?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_documents_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_documents_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          created_at: string
          diagnosis: string
          doctor_name: string
          doctor_type: string | null
          hospital_name: string | null
          id: string
          next_appointment_date: string | null
          notes: string | null
          prescription: string | null
          suggested_tests: string | null
          test_by_worker: string | null
          updated_at: string
          visit_date: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          diagnosis: string
          doctor_name: string
          doctor_type?: string | null
          hospital_name?: string | null
          id?: string
          next_appointment_date?: string | null
          notes?: string | null
          prescription?: string | null
          suggested_tests?: string | null
          test_by_worker?: string | null
          updated_at?: string
          visit_date?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          diagnosis?: string
          doctor_name?: string
          doctor_type?: string | null
          hospital_name?: string | null
          id?: string
          next_appointment_date?: string | null
          notes?: string | null
          prescription?: string | null
          suggested_tests?: string | null
          test_by_worker?: string | null
          updated_at?: string
          visit_date?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_otp: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          mobile_number: string
          otp_code: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          mobile_number: string
          otp_code: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          mobile_number?: string
          otp_code?: string
        }
        Relationships: []
      }
      workers: {
        Row: {
          aadhar_number: string
          address: string
          created_at: string
          date_of_birth: string
          district: string | null
          email: string
          id: string
          mobile_number: string
          name: string
          unique_worker_id: string
          updated_at: string
        }
        Insert: {
          aadhar_number: string
          address: string
          created_at?: string
          date_of_birth: string
          district?: string | null
          email: string
          id?: string
          mobile_number: string
          name: string
          unique_worker_id: string
          updated_at?: string
        }
        Update: {
          aadhar_number?: string
          address?: string
          created_at?: string
          date_of_birth?: string
          district?: string | null
          email?: string
          id?: string
          mobile_number?: string
          name?: string
          unique_worker_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_otp: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      doctor_type: "government" | "private"
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
      doctor_type: ["government", "private"],
    },
  },
} as const
