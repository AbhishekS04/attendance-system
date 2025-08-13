import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import AttendanceCalendar from "@/components/attendance-calendar"

export default async function TeacherAttendancePage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "teacher") {
    redirect("/")
  }

  return (
    <DashboardLayout user={user} title="Class Attendance Overview">
      <div className="space-y-6">
        <AttendanceCalendar />
      </div>
    </DashboardLayout>
  )
}
