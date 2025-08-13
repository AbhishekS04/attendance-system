import { type NextRequest, NextResponse } from "next/server"
import { getAttendanceRecords } from "@/lib/db"
import * as XLSX from "xlsx"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      classId: searchParams.get("classId") || undefined,
      subjectId: searchParams.get("subjectId") || undefined,
      studentId: searchParams.get("studentId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    }

    const records = await getAttendanceRecords(filters)

    // Transform data for Excel export
    const excelData = records.map((record: any) => ({
      Date: new Date(record.date).toLocaleDateString(),
      "Student Name": record.student_name,
      "Student ID": record.student_id,
      Class: record.class_name,
      Subject: record.subject_name,
      Status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
      Notes: record.notes || "",
      "Marked At": new Date(record.created_at).toLocaleString(),
    }))

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Auto-size columns
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 20 }, // Student Name
      { wch: 15 }, // Student ID
      { wch: 15 }, // Class
      { wch: 20 }, // Subject
      { wch: 10 }, // Status
      { wch: 30 }, // Notes
      { wch: 20 }, // Marked At
    ]
    worksheet["!cols"] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report")

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="attendance-report-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error exporting attendance data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
