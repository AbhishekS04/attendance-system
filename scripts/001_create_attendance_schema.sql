-- Create attendance management schema
CREATE SCHEMA IF NOT EXISTS attendance;

-- Create roles enum
CREATE TYPE attendance.user_role AS ENUM ('admin', 'cr', 'teacher', 'student');

-- Create attendance status enum  
CREATE TYPE attendance.attendance_status AS ENUM ('present', 'absent', 'late');

-- Extend users table with attendance-specific fields
CREATE TABLE IF NOT EXISTS attendance.users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role attendance.user_role NOT NULL DEFAULT 'student',
    student_id TEXT UNIQUE,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create classes table
CREATE TABLE IF NOT EXISTS attendance.classes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS attendance.subjects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_subjects junction table
CREATE TABLE IF NOT EXISTS attendance.class_subjects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    class_id TEXT NOT NULL REFERENCES attendance.classes(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES attendance.subjects(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES attendance.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, subject_id)
);

-- Create user_classes junction table (for students and CRs)
CREATE TABLE IF NOT EXISTS attendance.user_classes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES attendance.users(id) ON DELETE CASCADE,
    class_id TEXT NOT NULL REFERENCES attendance.classes(id) ON DELETE CASCADE,
    is_cr BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, class_id)
);

-- Create attendance records table
CREATE TABLE IF NOT EXISTS attendance.attendance_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL REFERENCES attendance.users(id) ON DELETE CASCADE,
    class_id TEXT NOT NULL REFERENCES attendance.classes(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES attendance.subjects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance.attendance_status NOT NULL DEFAULT 'absent',
    marked_by TEXT REFERENCES attendance.users(id) ON DELETE SET NULL,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, class_id, subject_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON attendance.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON attendance.users(email);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON attendance.attendance_records(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject ON attendance.attendance_records(subject_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION attendance.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON attendance.users FOR EACH ROW EXECUTE FUNCTION attendance.update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON attendance.classes FOR EACH ROW EXECUTE FUNCTION attendance.update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON attendance.subjects FOR EACH ROW EXECUTE FUNCTION attendance.update_updated_at_column();
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance.attendance_records FOR EACH ROW EXECUTE FUNCTION attendance.update_updated_at_column();
