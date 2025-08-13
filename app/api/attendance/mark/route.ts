import { type NextRequest, NextResponse } from "next/server"
import { ensureDefaultClassAndSubject, getOrCreateStudentByRollNumber, markAttendance } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { attendanceRecords } = await request.json()

    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return NextResponse.json({ error: "Invalid attendance records" }, { status: 400 })
    }

    const defaults = await ensureDefaultClassAndSubject()

    // Mark attendance for each student
    const results = await Promise.all(
      attendanceRecords.map(async (record: any) => {
        // Get or create student by roll number
        const student = await getOrCreateStudentByRollNumber(record.rollNumber || record.studentId)

        return await markAttendance(
          student.id,
          record.classId || defaults.class.id,
          record.subjectId || defaults.subject.id,
          record.date,
          record.status,
          record.markedBy || "admin",
          record.notes,
        )
      }),
    )

    return NextResponse.json({
      message: "Attendance marked successfully",
      results,
    })
  } catch (error) {
    console.error("Error marking attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
