/*
  # Add Incident Tracking System

  ## Changes Made
  
  1. **Students Table Updates**
    - Add `incident_type` column (none, repeat, dismissed, medical_discharge)
    
  2. **New Tables**
    - `student_incidents` - Track all incident records
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `incident_type` (text: repeat, dismissed, medical_discharge)
      - `incident_date` (date)
      - `reason` (text)
      - `notes` (text)
      - `reported_by` (uuid, foreign key to profiles)
      - `created_at` (timestamptz)
      
    - `class_assignments` - Link rooms to classes/faculties
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key)
      - `faculty_id` (uuid, foreign key)
      - `year` (integer)
      - `class_name` (text)
      - `assigned_at` (timestamptz)
      
  3. **Security**
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Add incident_type column to students if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'incident_type'
  ) THEN
    ALTER TABLE students ADD COLUMN incident_type text CHECK (incident_type IN ('none', 'repeat', 'dismissed', 'medical_discharge')) DEFAULT 'none';
  END IF;
END $$;

-- Create student_incidents table
CREATE TABLE IF NOT EXISTS student_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  incident_type text CHECK (incident_type IN ('repeat', 'dismissed', 'medical_discharge')) NOT NULL,
  incident_date date DEFAULT CURRENT_DATE NOT NULL,
  reason text,
  notes text,
  reported_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create class_assignments table (different from existing room_assignments)
CREATE TABLE IF NOT EXISTS class_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES lecture_rooms(id) ON DELETE CASCADE NOT NULL,
  faculty_id uuid REFERENCES faculties(id) ON DELETE CASCADE NOT NULL,
  year integer CHECK (year >= 1 AND year <= 7) NOT NULL,
  class_name text NOT NULL,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(room_id, faculty_id, year)
);

-- Enable RLS
ALTER TABLE student_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all incidents" ON student_incidents;
DROP POLICY IF EXISTS "Admins can insert incidents" ON student_incidents;
DROP POLICY IF EXISTS "Admins can update incidents" ON student_incidents;
DROP POLICY IF EXISTS "Admins can delete incidents" ON student_incidents;
DROP POLICY IF EXISTS "Users can view all class assignments" ON class_assignments;
DROP POLICY IF EXISTS "Admins can insert class assignments" ON class_assignments;
DROP POLICY IF EXISTS "Admins can update class assignments" ON class_assignments;
DROP POLICY IF EXISTS "Admins can delete class assignments" ON class_assignments;

-- Policies for student_incidents
CREATE POLICY "Users can view all incidents"
  ON student_incidents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert incidents"
  ON student_incidents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update incidents"
  ON student_incidents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete incidents"
  ON student_incidents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies for class_assignments
CREATE POLICY "Users can view all class assignments"
  ON class_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert class assignments"
  ON class_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update class assignments"
  ON class_assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete class assignments"
  ON class_assignments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_student_incidents_student_id ON student_incidents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_incidents_type ON student_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_student_incidents_date ON student_incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_class_assignments_room_id ON class_assignments(room_id);
CREATE INDEX IF NOT EXISTS idx_class_assignments_faculty_id ON class_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_students_incident_type ON students(incident_type);
