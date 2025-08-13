import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Type definitions
export interface User {
  id: string
  email: string
  name: string
  full_name: string
  password_hash: string
  role: "admin" | "cr" | "teacher" | "student"
  student_id?: string
  phone?: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export interface Class {
  id: string
  name: string
  code: string
  description?: string
  created_at: Date
  updated_at: Date
  student_count?: number
}

export interface Subject {
  id: string
  name: string
  code: string
  description?: string
  created_at: Date
  updated_at: Date
  class_count?: number
}

// Database helper functions
export async function getUser(email: string) {
  const result = await sql`
    SELECT * FROM attendance.users 
    WHERE email = ${email} AND deleted_at IS NULL
  `
  return result[0] || null
}

export async function getUserById(id: string) {
  const result = await sql`
    SELECT * FROM attendance.users 
    WHERE id = ${id} AND deleted_at IS NULL
  `
  return result[0] || null
}

export async function createUser(userData: {
  email: string
  name: string
  password_hash: string
  role: "admin" | "cr" | "teacher" | "student"
  student_id?: string
  phone?: string
}) {
  const result = await sql`
    INSERT INTO attendance.users (email, name, password_hash, role, student_id, phone)
    VALUES (${userData.email}, ${userData.name}, ${userData.password_hash}, ${userData.role}, ${userData.student_id || null}, ${userData.phone || null})
    RETURNING *
  `
  return result[0]
}

export async function getClasses() {
  return await sql`
    SELECT * FROM attendance.classes 
    ORDER BY name
  `
}

export async function getSubjects() {
  return await sql`
    SELECT * FROM attendance.subjects 
    ORDER BY name
  `
}

export async function getAllClasses() {
  return await sql`
    SELECT c.*, COUNT(uc.user_id) as student_count
    FROM attendance.classes c
    LEFT JOIN attendance.user_classes uc ON c.id = uc.class_id
    GROUP BY c.id, c.name, c.code, c.description, c.created_at, c.updated_at
    ORDER BY c.name
  `
}

export async function getAllSubjects() {
  return await sql`
    SELECT s.*, COUNT(cs.class_id) as class_count
    FROM attendance.subjects s
    LEFT JOIN attendance.class_subjects cs ON s.id = cs.subject_id
    GROUP BY s.id, s.name, s.code, s.description, s.created_at, s.updated_at
    ORDER BY s.name
  `
}

export async function getStudentsByClass(classId: string) {
  return await sql`
    SELECT u.id, u.name, u.email, u.student_id, u.phone, uc.is_cr
    FROM attendance.users u
    JOIN attendance.user_classes uc ON u.id = uc.user_id
    WHERE uc.class_id = ${classId} AND u.role IN ('student', 'cr') AND u.deleted_at IS NULL
    ORDER BY u.name
  `
}

export async function getAttendanceRecords(filters: {
  classId?: string
  subjectId?: string
  date?: string
  studentId?: string
  startDate?: string
  endDate?: string
}) {
  // Date range filter is present
  if (filters.startDate && filters.endDate) {
    // Build query with date range and any additional filters
    return await sql`
      SELECT ar.*, u.name as student_name, u.student_id, c.name as class_name, s.name as subject_name
      FROM attendance.attendance_records ar
      JOIN attendance.users u ON ar.student_id = u.id
      JOIN attendance.classes c ON ar.class_id = c.id
      JOIN attendance.subjects s ON ar.subject_id = s.id
      WHERE ar.date >= ${filters.startDate} AND ar.date <= ${filters.endDate}
      ${filters.classId ? sql`AND ar.class_id = ${filters.classId}` : sql``}
      ${filters.subjectId ? sql`AND ar.subject_id = ${filters.subjectId}` : sql``}
      ${filters.studentId ? sql`AND ar.student_id = ${filters.studentId}` : sql``}
      ORDER BY ar.date DESC, u.name
    `
  }
  // Original implementation for specific date or no date filters
  else if (filters.classId && filters.subjectId && filters.date && filters.studentId) {
    return await sql`
      SELECT ar.*, u.name as student_name, u.student_id, c.name as class_name, s.name as subject_name
      FROM attendance.attendance_records ar
      JOIN attendance.users u ON ar.student_id = u.id
      JOIN attendance.classes c ON ar.class_id = c.id
      JOIN attendance.subjects s ON ar.subject_id = s.id
      WHERE ar.class_id = ${filters.classId} 
      AND ar.subject_id = ${filters.subjectId}
      AND ar.date = ${filters.date}
      AND ar.student_id = ${filters.studentId}
      ORDER BY ar.date DESC, u.name
    `
  } else if (filters.classId && filters.subjectId && filters.date) {
    return await sql`
      SELECT ar.*, u.name as student_name, u.student_id, c.name as class_name, s.name as subject_name
      FROM attendance.attendance_records ar
      JOIN attendance.users u ON ar.student_id = u.id
      JOIN attendance.classes c ON ar.class_id = c.id
      JOIN attendance.subjects s ON ar.subject_id = s.id
      WHERE ar.class_id = ${filters.classId} 
      AND ar.subject_id = ${filters.subjectId}
      AND ar.date = ${filters.date}
      ORDER BY ar.date DESC, u.name
    `
  } else if (filters.classId && filters.subjectId) {
    return await sql`
      SELECT ar.*, u.name as student_name, u.student_id, c.name as class_name, s.name as subject_name
      FROM attendance.attendance_records ar
      JOIN attendance.users u ON ar.student_id = u.id
      JOIN attendance.classes c ON ar.class_id = c.id
      JOIN attendance.subjects s ON ar.subject_id = s.id
      WHERE ar.class_id = ${filters.classId} 
      AND ar.subject_id = ${filters.subjectId}
      ORDER BY ar.date DESC, u.name
    `
  } else if (filters.studentId) {
    return await sql`
      SELECT ar.*, u.name as student_name, u.student_id, c.name as class_name, s.name as subject_name
      FROM attendance.attendance_records ar
      JOIN attendance.users u ON ar.student_id = u.id
      JOIN attendance.classes c ON ar.class_id = c.id
      JOIN attendance.subjects s ON ar.subject_id = s.id
      WHERE ar.student_id = ${filters.studentId}
      ORDER BY ar.date DESC, u.name
    `
  } else {
    return await sql`
      SELECT ar.*, u.name as student_name, u.student_id, c.name as class_name, s.name as subject_name
      FROM attendance.attendance_records ar
      JOIN attendance.users u ON ar.student_id = u.id
      JOIN attendance.classes c ON ar.class_id = c.id
      JOIN attendance.subjects s ON ar.subject_id = s.id
      ORDER BY ar.date DESC, u.name
    `
  }
}

export async function markAttendance(
  studentId: string | number,
  classId: string | number,
  subjectId: string | number,
  date: string,
  status: "present" | "absent" | "late",
  markedBy: string | number,
  notes?: string,
) {
  // Ensure all IDs are strings as required by the database schema
  const studentIdStr = String(studentId);
  const classIdStr = String(classId);
  const subjectIdStr = String(subjectId);
  const markedByStr = String(markedBy);

  try {
    // Check if attendance already exists for this student, class, subject, and date
    const existing = await sql`
      SELECT id FROM attendance.attendance_records
      WHERE student_id = ${studentIdStr} AND class_id = ${classIdStr} 
      AND subject_id = ${subjectIdStr} AND date = ${date}
    `

    if (existing.length > 0) {
      // Update existing record
      return await sql`
        UPDATE attendance.attendance_records
        SET status = ${status}, marked_by = ${markedByStr}, notes = ${notes || null}, updated_at = NOW()
        WHERE id = ${existing[0].id}
        RETURNING *
      `
    } else {
      // Create new record
      return await sql`
        INSERT INTO attendance.attendance_records (student_id, class_id, subject_id, date, status, marked_by, notes)
        VALUES (${studentIdStr}, ${classIdStr}, ${subjectIdStr}, ${date}, ${status}, ${markedByStr}, ${notes || null})
        RETURNING *
      `
    }
  } catch (error) {
    console.error('Error in markAttendance:', error);
    throw new Error('Failed to save attendance');
  }
}

export async function getOrCreateStudentByRollNumber(rollNumber: string | number, className = "Default Class") {
  // Ensure rollNumber is a string as required by the database schema
  const rollNumberStr = String(rollNumber);
  
  try {
    // First check if student exists
    const student = await sql`
      SELECT * FROM attendance.users 
      WHERE student_id = ${rollNumberStr} AND role = 'student' AND deleted_at IS NULL
    `

    if (student.length > 0) {
      return student[0]
    }

    // Create student if doesn't exist
    const newStudent = await sql`
      INSERT INTO attendance.users (
        email, 
        name, 
        password_hash, 
        role, 
        student_id
      )
      VALUES (
        ${`student${rollNumberStr}@college.edu`}, 
        ${`Student ${rollNumberStr}`}, 
        ${"$2b$10$defaulthash"}, 
        'student', 
        ${rollNumberStr}
      )
      RETURNING *
    `

    return newStudent[0]
  } catch (error) {
    console.error('Error in getOrCreateStudentByRollNumber:', error);
    throw new Error('Failed to get or create student');
  }
}

export async function saveStudentsToDB(students: Array<{name: string, rollNumber: string, class: string}>) {
  try {
    const results = [];
    
    for (const student of students) {
      // Check if student exists
      const existingStudent = await sql`
        SELECT * FROM attendance.users 
        WHERE student_id = ${student.rollNumber} AND role = 'student' AND deleted_at IS NULL
      `;
      
      if (existingStudent.length > 0) {
        // Update existing student
        const updated = await sql`
          UPDATE attendance.users
          SET name = ${student.name}, updated_at = NOW()
          WHERE student_id = ${student.rollNumber} AND role = 'student'
          RETURNING *
        `;
        results.push(updated[0]);
      } else {
        // Create new student
        const newStudent = await sql`
          INSERT INTO attendance.users (
            email, 
            name, 
            password_hash, 
            role, 
            student_id
          )
          VALUES (
            ${`student${student.rollNumber}@college.edu`}, 
            ${student.name}, 
            ${"$2b$10$defaulthash"}, 
            'student', 
            ${student.rollNumber}
          )
          RETURNING *
        `;
        results.push(newStudent[0]);
      }
      
      // Ensure class exists
      let classRecord = await sql`
        SELECT * FROM attendance.classes WHERE name = ${student.class}
      `;
      
      if (classRecord.length === 0) {
        // Create class if it doesn't exist
        classRecord = await sql`
          INSERT INTO attendance.classes (name, code, description)
          VALUES (${student.class}, ${student.class.replace(/\s+/g, '').toUpperCase()}, 'Class created from student import')
          RETURNING *
        `;
      }
      
      // Check if student is already in the class
      const existingUserClass = await sql`
        SELECT * FROM attendance.user_classes 
        WHERE user_id = ${results[results.length - 1].id} AND class_id = ${classRecord[0].id}
      `;
      
      if (existingUserClass.length === 0) {
        // Add student to class
        await sql`
          INSERT INTO attendance.user_classes (user_id, class_id, is_cr)
          VALUES (${results[results.length - 1].id}, ${classRecord[0].id}, false)
        `;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in saveStudentsToDB:', error);
    throw new Error('Failed to save students to database');
  }
}

export async function ensureDefaultClassAndSubject() {
  try {
    // Ensure default class exists
    let defaultClass = await sql`
      SELECT * FROM attendance.classes WHERE code = 'DEFAULT'
    `

    if (defaultClass.length === 0) {
      defaultClass = await sql`
        INSERT INTO attendance.classes (name, code, description)
        VALUES ('Default Class', 'DEFAULT', 'Default class for attendance')
        RETURNING *
      `
    }

    // Ensure default subject exists
    let defaultSubject = await sql`
      SELECT * FROM attendance.subjects WHERE code = 'DEFAULT'
    `

    if (defaultSubject.length === 0) {
      defaultSubject = await sql`
        INSERT INTO attendance.subjects (name, code, description)
        VALUES ('Default Subject', 'DEFAULT', 'Default subject for attendance')
        RETURNING *
      `
    }

    return {
      class: defaultClass[0],
      subject: defaultSubject[0],
    }
  } catch (error) {
    console.error('Error in ensureDefaultClassAndSubject:', error);
    throw new Error('Failed to ensure default class and subject');
  }
}

export async function getAttendanceStats(filters: {
  classId?: string
  subjectId?: string
  studentId?: string
  startDate?: string
  endDate?: string
}) {
  if (filters.studentId && filters.classId && filters.startDate && filters.endDate) {
    const result = await sql`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
        ROUND(
          (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) as attendance_percentage
      FROM attendance.attendance_records ar
      WHERE ar.student_id = ${filters.studentId}
      AND ar.class_id = ${filters.classId}
      AND ar.date >= ${filters.startDate}
      AND ar.date <= ${filters.endDate}
    `
    return {
      totalRecords: Number.parseInt(result[0]?.total_records || "0"),
      presentCount: Number.parseInt(result[0]?.present_count || "0"),
      absentCount: Number.parseInt(result[0]?.absent_count || "0"),
      lateCount: Number.parseInt(result[0]?.late_count || "0"),
      attendancePercentage: Number.parseFloat(result[0]?.attendance_percentage || "0"),
    }
  } else if (filters.studentId) {
    const result = await sql`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
        ROUND(
          (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) as attendance_percentage
      FROM attendance.attendance_records ar
      WHERE ar.student_id = ${filters.studentId}
    `
    return {
      totalRecords: Number.parseInt(result[0]?.total_records || "0"),
      presentCount: Number.parseInt(result[0]?.present_count || "0"),
      absentCount: Number.parseInt(result[0]?.absent_count || "0"),
      lateCount: Number.parseInt(result[0]?.late_count || "0"),
      attendancePercentage: Number.parseFloat(result[0]?.attendance_percentage || "0"),
    }
  } else {
    const result = await sql`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
        ROUND(
          (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) as attendance_percentage
      FROM attendance.attendance_records ar
    `
    return {
      totalRecords: Number.parseInt(result[0]?.total_records || "0"),
      presentCount: Number.parseInt(result[0]?.present_count || "0"),
      absentCount: Number.parseInt(result[0]?.absent_count || "0"),
      lateCount: Number.parseInt(result[0]?.late_count || "0"),
      attendancePercentage: Number.parseFloat(result[0]?.attendance_percentage || "0"),
    }
  }
}
