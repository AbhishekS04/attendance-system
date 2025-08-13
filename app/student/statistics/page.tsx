import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import AttendanceStatistics from "@/components/attendance-statistics"

export default async function StudentStatisticsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "student") {
    redirect("/")
  }

  return (
    <DashboardLayout user={user} title="My Attendance Statistics">
      <AttendanceStatistics user={user} showFilters={false} />
    </DashboardLayout>
  )
}
