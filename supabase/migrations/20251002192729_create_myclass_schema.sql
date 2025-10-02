/*
  # MyClass Academic Management System - Database Schema

  ## Overview
  Complete database schema for the MyClass academic support and resource management system.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, references auth.users)
  - `full_name` (text)
  - `role` (text) - 'admin' or 'guest'
  - `email` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. students
  - `id` (uuid, primary key)
  - `student_id` (text, unique) - Official student ID
  - `full_name` (text)
  - `faculty` (text)
  - `program` (text) - Class/program name
  - `gender` (text)
  - `contact_phone` (text)
  - `contact_email` (text)
  - `photo_url` (text) - URL to student photo
  - `documents` (jsonb) - Array of document URLs
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. staff
  - `id` (uuid, primary key)
  - `staff_id` (text, unique)
  - `full_name` (text)
  - `position` (text)
  - `department` (text)
  - `contact_phone` (text)
  - `contact_email` (text)
  - `hostel_room` (text) - Room assignment
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. lecture_rooms
  - `id` (uuid, primary key)
  - `room_name` (text, unique)
  - `capacity` (integer)
  - `location` (text)
  - `equipment` (text)
  - `status` (text) - 'available' or 'occupied'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. room_assignments
  - `id` (uuid, primary key)
  - `room_id` (uuid, references lecture_rooms)
  - `staff_id` (uuid, references staff)
  - `date` (date)
  - `start_time` (time)
  - `end_time` (time)
  - `purpose` (text)
  - `created_at` (timestamptz)

  ### 6. medical_records
  - `id` (uuid, primary key)
  - `student_id` (uuid, references students)
  - `illness_description` (text)
  - `treatment_type` (text) - 'in-school' or 'external'
  - `status` (text) - 'active', 'recovering', 'discharged'
  - `check_in_date` (timestamptz)
  - `check_out_date` (timestamptz)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. materials
  - `id` (uuid, primary key)
  - `material_name` (text)
  - `category` (text)
  - `quantity` (integer)
  - `location` (text)
  - `status` (text) - 'available', 'low_stock', 'out_of_stock'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 8. material_distributions
  - `id` (uuid, primary key)
  - `material_id` (uuid, references materials)
  - `recipient_name` (text)
  - `quantity_distributed` (integer)
  - `distribution_date` (timestamptz)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 9. external_practice_sessions
  - `id` (uuid, primary key)
  - `session_name` (text)
  - `location` (text)
  - `date` (date)
  - `start_time` (time)
  - `end_time` (time)
  - `students_attending` (jsonb) - Array of student IDs
  - `materials_needed` (jsonb) - Array of material requirements
  - `transport_details` (text)
  - `status` (text) - 'planned', 'in-progress', 'completed'
  - `preparation_checklist` (jsonb)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 10. announcements
  - `id` (uuid, primary key)
  - `title` (text)
  - `content` (text)
  - `category` (text)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 11. chatbot_messages
  - `id` (uuid, primary key)
  - `user_name` (text)
  - `user_email` (text)
  - `message` (text)
  - `response` (text)
  - `status` (text) - 'pending', 'answered'
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Admin users have full access
  - Guest users have read-only access to most tables
  - Public can submit chatbot messages
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'guest' CHECK (role IN ('admin', 'guest')),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  faculty text NOT NULL,
  program text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  contact_phone text,
  contact_email text,
  photo_url text,
  documents jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  position text NOT NULL,
  department text NOT NULL,
  contact_phone text,
  contact_email text,
  hostel_room text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lecture_rooms table
CREATE TABLE IF NOT EXISTS lecture_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_name text UNIQUE NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  location text NOT NULL,
  equipment text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create room_assignments table
CREATE TABLE IF NOT EXISTS room_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES lecture_rooms ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES staff ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  purpose text,
  created_at timestamptz DEFAULT now()
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students ON DELETE CASCADE,
  illness_description text NOT NULL,
  treatment_type text NOT NULL CHECK (treatment_type IN ('in-school', 'external')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'recovering', 'discharged')),
  check_in_date timestamptz DEFAULT now(),
  check_out_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  location text NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'low_stock', 'out_of_stock')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create material_distributions table
CREATE TABLE IF NOT EXISTS material_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES materials ON DELETE CASCADE,
  recipient_name text NOT NULL,
  quantity_distributed integer NOT NULL,
  distribution_date timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create external_practice_sessions table
CREATE TABLE IF NOT EXISTS external_practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name text NOT NULL,
  location text NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  students_attending jsonb DEFAULT '[]'::jsonb,
  materials_needed jsonb DEFAULT '[]'::jsonb,
  transport_details text,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed')),
  preparation_checklist jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  created_by uuid REFERENCES profiles ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chatbot_messages table
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_email text,
  message text NOT NULL,
  response text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Students policies (admin full access, guest read-only)
CREATE POLICY "Authenticated users can read students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Staff policies
CREATE POLICY "Authenticated users can read staff"
  ON staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert staff"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update staff"
  ON staff FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete staff"
  ON staff FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Lecture rooms policies
CREATE POLICY "Authenticated users can read lecture rooms"
  ON lecture_rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert lecture rooms"
  ON lecture_rooms FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update lecture rooms"
  ON lecture_rooms FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete lecture rooms"
  ON lecture_rooms FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Room assignments policies
CREATE POLICY "Authenticated users can read room assignments"
  ON room_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert room assignments"
  ON room_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update room assignments"
  ON room_assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete room assignments"
  ON room_assignments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Medical records policies
CREATE POLICY "Authenticated users can read medical records"
  ON medical_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert medical records"
  ON medical_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update medical records"
  ON medical_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete medical records"
  ON medical_records FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Materials policies
CREATE POLICY "Authenticated users can read materials"
  ON materials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert materials"
  ON materials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update materials"
  ON materials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete materials"
  ON materials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Material distributions policies
CREATE POLICY "Authenticated users can read material distributions"
  ON material_distributions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert material distributions"
  ON material_distributions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete material distributions"
  ON material_distributions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- External practice sessions policies
CREATE POLICY "Authenticated users can read external practice sessions"
  ON external_practice_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert external practice sessions"
  ON external_practice_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update external practice sessions"
  ON external_practice_sessions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete external practice sessions"
  ON external_practice_sessions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Announcements policies
CREATE POLICY "Authenticated users can read announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Chatbot messages policies (anyone can submit, admin can read/update)
CREATE POLICY "Anyone can insert chatbot messages"
  ON chatbot_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin users can read chatbot messages"
  ON chatbot_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update chatbot messages"
  ON chatbot_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_faculty ON students(faculty);
CREATE INDEX IF NOT EXISTS idx_students_program ON students(program);
CREATE INDEX IF NOT EXISTS idx_room_assignments_date ON room_assignments(date);
CREATE INDEX IF NOT EXISTS idx_medical_records_student ON medical_records(student_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status);
CREATE INDEX IF NOT EXISTS idx_external_practice_date ON external_practice_sessions(date);
CREATE INDEX IF NOT EXISTS idx_chatbot_status ON chatbot_messages(status);