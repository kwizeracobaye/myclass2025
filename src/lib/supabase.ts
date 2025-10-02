import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: 'admin' | 'guest';
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      students: {
        Row: {
          id: string;
          student_id: string;
          full_name: string;
          faculty: string;
          program: string;
          gender: 'male' | 'female' | 'other';
          contact_phone: string | null;
          contact_email: string | null;
          photo_url: string | null;
          documents: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['students']['Insert']>;
      };
      staff: {
        Row: {
          id: string;
          staff_id: string;
          full_name: string;
          position: string;
          department: string;
          contact_phone: string | null;
          contact_email: string | null;
          hostel_room: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['staff']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['staff']['Insert']>;
      };
      lecture_rooms: {
        Row: {
          id: string;
          room_name: string;
          capacity: number;
          location: string;
          equipment: string | null;
          status: 'available' | 'occupied';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lecture_rooms']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['lecture_rooms']['Insert']>;
      };
      medical_records: {
        Row: {
          id: string;
          student_id: string;
          illness_description: string;
          treatment_type: 'in-school' | 'external';
          status: 'active' | 'recovering' | 'discharged';
          check_in_date: string;
          check_out_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['medical_records']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['medical_records']['Insert']>;
      };
      materials: {
        Row: {
          id: string;
          material_name: string;
          category: string;
          quantity: number;
          location: string;
          status: 'available' | 'low_stock' | 'out_of_stock';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['materials']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['materials']['Insert']>;
      };
      external_practice_sessions: {
        Row: {
          id: string;
          session_name: string;
          location: string;
          date: string;
          start_time: string;
          end_time: string;
          students_attending: any[];
          materials_needed: any[];
          transport_details: string | null;
          status: 'planned' | 'in-progress' | 'completed';
          preparation_checklist: any[];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['external_practice_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['external_practice_sessions']['Insert']>;
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>;
      };
    };
  };
};
