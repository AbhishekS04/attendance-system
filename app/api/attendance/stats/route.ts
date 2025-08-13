import { type NextRequest, NextResponse } from "next/server"
import { getAttendanceStats } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      classId: searchParams.get("classId") ? Number.parseInt(searchParams.get("classId")!) : undefined,
      subjectId: searchParams.get("subjectId") ? Number.parseInt(searchParams.get("subjectId")!) : undefined,
      studentId: searchParams.get("studentId") ? Number.parseInt(searchParams.get("studentId")!) : undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    }

    const stats = await getAttendanceStats(filters)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching attendance stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
