import { NextResponse } from "next/server"
import { getAttendanceStats } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId") || "001" // Default student ID
    const classId = searchParams.get("classId") || "default-class"

    // Get attendance statistics from database
    const stats = await getAttendanceStats({
      studentId,
      classId,
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Last 90 days
      endDate: new Date().toISOString().split("T")[0],
    })

    // Calculate percentage
    const percentage =
      stats.totalRecords > 0 ? Math.round(((stats.presentCount + stats.officialCount) / stats.totalRecords) * 100) : 0

    const responseData = {
      totalClasses: stats.totalRecords,
      attendedClasses: stats.presentCount + stats.officialCount,
      percentage,
      recentAttendance: [], // This would need a separate query for recent records
      presentCount: stats.presentCount,
      absentCount: stats.absentCount,
      officialCount: stats.officialCount || 0,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching student stats:", error)

    // Fallback to mock data if database fails
    const fallbackData = {
      totalClasses: 0,
      attendedClasses: 0,
      percentage: 0,
      recentAttendance: [],
      presentCount: 0,
      absentCount: 0,
      officialCount: 0,
    }

    return NextResponse.json(fallbackData)
  }
}
