import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import BulkAttendance from "@/components/bulk-attendance"
import { User } from "@/lib/db"

export default async function BulkAttendancePage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "cr") {
    redirect("/")
  }

  return (
    <DashboardLayout user={user as User} title="Bulk Attendance">
      <BulkAttendance user={user} />
    </DashboardLayout>
  )
}
