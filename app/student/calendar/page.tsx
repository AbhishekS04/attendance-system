import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import AttendanceCalendar from "@/components/attendance-calendar"

export default async function StudentCalendarPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "student") {
    redirect("/")
  }

  return (
    <DashboardLayout user={user} title="Attendance Calendar">
      <AttendanceCalendar studentId={user.id.toString()} />
    </DashboardLayout>
  )
}
