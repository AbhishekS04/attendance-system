import { NextResponse } from "next/server"
import { getAllClasses } from "@/lib/db"

export async function GET() {
  try {
    const classes = await getAllClasses()
    return NextResponse.json(classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
