/*
  # Complete English Spark Database Schema

  1. New Tables
    - `profiles` - User profiles with roles
    - `classes` - Class management
    - `quizzes` - Quiz management
    - `questions` - Quiz questions
    - `quiz_assignments` - Quiz assignments to classes
    - `student_submissions` - Student quiz submissions
    - `materials` - Learning materials
    - `achievements` - Achievement system
    - `user_achievements` - User achievements
    - `notifications` - System notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  class_id uuid,
  points integer DEFAULT 0,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  temp_password text,
  must_change_password boolean DEFAULT false
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name text NOT NULL,
  teacher_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'fill_in_the_blank')),
  media_type text DEFAULT 'none' CHECK (media_type IN ('image', 'youtube', 'none')),
  media_url text,
  options jsonb,
  difficulty text DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points_value integer DEFAULT 2,
  explanation text,
  created_at timestamptz DEFAULT now()
);

-- Create quiz_assignments table
CREATE TABLE IF NOT EXISTS quiz_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  due_date timestamptz,
  assigned_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'draft'))
);

-- Create student_submissions table
CREATE TABLE IF NOT EXISTS student_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES quiz_assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  score integer,
  submitted_at timestamptz DEFAULT now(),
  answers jsonb
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('document', 'video', 'audio', 'image', 'link')),
  category text,
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time integer DEFAULT 0,
  file_url text,
  youtube_url text,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon_url text,
  points_reward integer DEFAULT 0,
  trigger_condition text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  link_url text,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for class_id in profiles
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_class_id 
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Classes policies
CREATE POLICY "Teachers can read their classes" ON classes
  FOR SELECT USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage classes" ON classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Quizzes policies
CREATE POLICY "Teachers can manage their quizzes" ON quizzes
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Questions policies
CREATE POLICY "Teachers can manage questions for their quizzes" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE id = quiz_id AND created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Quiz assignments policies
CREATE POLICY "Teachers can manage assignments for their classes" ON quiz_assignments
  FOR ALL USING (
    assigned_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Student submissions policies
CREATE POLICY "Students can manage their submissions" ON student_submissions
  FOR ALL USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM quiz_assignments qa
      JOIN classes c ON qa.class_id = c.id
      WHERE qa.id = assignment_id AND c.teacher_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Materials policies
CREATE POLICY "Teachers can manage their materials" ON materials
  FOR ALL USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Students can read materials" ON materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('student', 'teacher', 'admin')
    )
  );

-- Achievements policies
CREATE POLICY "Everyone can read achievements" ON achievements
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage achievements" ON achievements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User achievements policies
CREATE POLICY "Users can read their achievements" ON user_achievements
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can read their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());