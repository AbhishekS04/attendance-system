import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import AttendanceMarker from "@/components/attendance-marker"

export default async function CRAttendancePage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "cr") {
    redirect("/")
  }

  return (
    <DashboardLayout user={user} title="Mark Attendance">
      <AttendanceMarker user={user} />
    </DashboardLayout>
  )
}
