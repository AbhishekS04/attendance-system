import { type NextRequest, NextResponse } from "next/server"
import { getAttendanceRecords } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      classId: searchParams.get("classId") || undefined,
      subjectId: searchParams.get("subjectId") || undefined,
      studentId: searchParams.get("studentId") || undefined,
      date: searchParams.get("date") || undefined,
    }

    const records = await getAttendanceRecords(filters)
    return NextResponse.json(records)
  } catch (error) {
    console.error("Error fetching attendance records:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
