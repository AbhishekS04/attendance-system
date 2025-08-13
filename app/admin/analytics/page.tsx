import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import AttendanceStatistics from "@/components/attendance-statistics"

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/")
  }

  return (
    <DashboardLayout user={user} title="Attendance Analytics">
      <AttendanceStatistics user={user} showFilters={true} />
    </DashboardLayout>
  )
}
