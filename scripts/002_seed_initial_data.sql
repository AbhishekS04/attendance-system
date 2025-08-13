-- Insert sample data for testing

-- Insert default users with proper password hashes
-- Admin/CR user: soetcr@gmail.com / soetcr2023
INSERT INTO attendance.users (email, name, password_hash, role, student_id) VALUES 
('soetcr@gmail.com', 'SOET CR Administrator', '$2b$10$YourHashedPasswordForSoetcr2023GoesHere', 'admin', NULL)
ON CONFLICT (email) DO NOTHING;

-- Student user: student2023@gmail.com / student2023  
INSERT INTO attendance.users (email, name, password_hash, role, student_id) VALUES 
('student2023@gmail.com', 'Test Student', '$2b$10$YourHashedPasswordForStudent2023GoesHere', 'student', 'STU2023001')
ON CONFLICT (email) DO NOTHING;

-- Insert additional sample users for testing
INSERT INTO attendance.users (email, name, password_hash, role, student_id) VALUES 
('teacher@school.edu', 'Sample Teacher', '$2b$10$SampleTeacherHashGoesHere', 'teacher', NULL),
('cr@school.edu', 'Class Representative', '$2b$10$SampleCRHashGoesHere', 'cr', 'CR2023001')
ON CONFLICT (email) DO NOTHING;

-- Insert sample classes
INSERT INTO attendance.classes (name, code, description) VALUES 
('Computer Science A', 'CS-A', 'Advanced Computer Science Class'),
('Computer Science B', 'CS-B', 'Intermediate Computer Science Class'),
('Mathematics 101', 'MATH-101', 'Basic Mathematics Course')
ON CONFLICT (code) DO NOTHING;

-- Insert sample subjects
INSERT INTO attendance.subjects (name, code, description) VALUES 
('Data Structures', 'DS', 'Data Structures and Algorithms'),
('Database Systems', 'DB', 'Database Management Systems'),
('Web Development', 'WEB', 'Full Stack Web Development'),
('Calculus', 'CALC', 'Differential and Integral Calculus'),
('Linear Algebra', 'LA', 'Linear Algebra and Matrix Theory')
ON CONFLICT (code) DO NOTHING;

-- Link subjects to classes
INSERT INTO attendance.class_subjects (class_id, subject_id) 
SELECT c.id, s.id 
FROM attendance.classes c, attendance.subjects s 
WHERE (c.code = 'CS-A' AND s.code IN ('DS', 'DB', 'WEB'))
   OR (c.code = 'CS-B' AND s.code IN ('DS', 'WEB'))
   OR (c.code = 'MATH-101' AND s.code IN ('CALC', 'LA'))
ON CONFLICT (class_id, subject_id) DO NOTHING;

-- Assign users to classes
INSERT INTO attendance.user_classes (user_id, class_id, role)
SELECT u.id, c.id, 'student'
FROM attendance.users u, attendance.classes c
WHERE u.email = 'student2023@gmail.com' AND c.code = 'CS-A'
ON CONFLICT (user_id, class_id) DO NOTHING;

INSERT INTO attendance.user_classes (user_id, class_id, role)
SELECT u.id, c.id, 'cr'
FROM attendance.users u, attendance.classes c
WHERE u.email = 'soetcr@gmail.com' AND c.code = 'CS-A'
ON CONFLICT (user_id, class_id) DO NOTHING;
