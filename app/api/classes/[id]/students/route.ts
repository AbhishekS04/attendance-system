import { type NextRequest, NextResponse } from "next/server"
import { getStudentsByClass } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const classId = Number.parseInt(params.id)
    const students = await getStudentsByClass(classId)
    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
