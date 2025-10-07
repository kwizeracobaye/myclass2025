/*
  # Create Hostel Management System

  ## New Tables
  
  1. **hostel_houses**
    - `id` (uuid, primary key)
    - `house_name` (text, unique)
    - `house_number` (integer)
    - `description` (text)
    - `created_at` (timestamptz)
    
  2. **hostel_rooms**
    - `id` (uuid, primary key)
    - `house_id` (uuid, foreign key)
    - `room_number` (text)
    - `capacity` (integer, default 1)
    - `status` (text: available, occupied)
    - `created_at` (timestamptz)
    
  3. **hostel_occupants**
    - `id` (uuid, primary key)
    - `room_id` (uuid, foreign key)
    - `staff_id` (uuid, foreign key to staff)
    - `occupant_name` (text)
    - `gender` (text: male, female)
    - `subject_teaching` (text)
    - `year_level` (text)
    - `check_in_date` (date)
    - `check_out_date` (date, nullable)
    - `status` (text: checked_in, checked_out)
    - `notes` (text)
    - `created_at` (timestamptz)
    
  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users
*/

-- Create hostel_houses table
CREATE TABLE IF NOT EXISTS hostel_houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  house_name text UNIQUE NOT NULL,
  house_number integer UNIQUE NOT NULL CHECK (house_number >= 1 AND house_number <= 5),
  description text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create hostel_rooms table
CREATE TABLE IF NOT EXISTS hostel_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id uuid REFERENCES hostel_houses(id) ON DELETE CASCADE NOT NULL,
  room_number text NOT NULL,
  capacity integer DEFAULT 1 CHECK (capacity > 0),
  status text DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(house_id, room_number)
);

-- Create hostel_occupants table
CREATE TABLE IF NOT EXISTS hostel_occupants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES hostel_rooms(id) ON DELETE CASCADE NOT NULL,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  occupant_name text NOT NULL,
  gender text CHECK (gender IN ('male', 'female')) NOT NULL,
  subject_teaching text NOT NULL,
  year_level text NOT NULL,
  check_in_date date DEFAULT CURRENT_DATE NOT NULL,
  check_out_date date,
  status text DEFAULT 'checked_in' CHECK (status IN ('checked_in', 'checked_out')) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE hostel_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_occupants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view hostel houses" ON hostel_houses;
DROP POLICY IF EXISTS "Admins can manage hostel houses" ON hostel_houses;
DROP POLICY IF EXISTS "Users can view hostel rooms" ON hostel_rooms;
DROP POLICY IF EXISTS "Admins can manage hostel rooms" ON hostel_rooms;
DROP POLICY IF EXISTS "Users can view hostel occupants" ON hostel_occupants;
DROP POLICY IF EXISTS "Admins can manage hostel occupants" ON hostel_occupants;

-- Policies for hostel_houses
CREATE POLICY "Users can view hostel houses"
  ON hostel_houses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage hostel houses"
  ON hostel_houses FOR ALL
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

-- Policies for hostel_rooms
CREATE POLICY "Users can view hostel rooms"
  ON hostel_rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage hostel rooms"
  ON hostel_rooms FOR ALL
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

-- Policies for hostel_occupants
CREATE POLICY "Users can view hostel occupants"
  ON hostel_occupants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage hostel occupants"
  ON hostel_occupants FOR ALL
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hostel_rooms_house_id ON hostel_rooms(house_id);
CREATE INDEX IF NOT EXISTS idx_hostel_rooms_status ON hostel_rooms(status);
CREATE INDEX IF NOT EXISTS idx_hostel_occupants_room_id ON hostel_occupants(room_id);
CREATE INDEX IF NOT EXISTS idx_hostel_occupants_staff_id ON hostel_occupants(staff_id);
CREATE INDEX IF NOT EXISTS idx_hostel_occupants_status ON hostel_occupants(status);

-- Insert default houses (5 houses)
INSERT INTO hostel_houses (house_name, house_number, description) VALUES
  ('House A', 1, 'Main hostel building - Ground floor'),
  ('House B', 2, 'Main hostel building - First floor'),
  ('House C', 3, 'South wing hostel'),
  ('House D', 4, 'North wing hostel'),
  ('House E', 5, 'Staff quarters annex')
ON CONFLICT (house_number) DO NOTHING;

-- Insert 3 rooms for each house
DO $$
DECLARE
  house_record RECORD;
BEGIN
  FOR house_record IN SELECT id, house_name FROM hostel_houses LOOP
    INSERT INTO hostel_rooms (house_id, room_number, capacity) VALUES
      (house_record.id, 'Room 1', 1),
      (house_record.id, 'Room 2', 1),
      (house_record.id, 'Room 3', 1)
    ON CONFLICT (house_id, room_number) DO NOTHING;
  END LOOP;
END $$;
