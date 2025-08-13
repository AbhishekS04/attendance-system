"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Users, Calendar, FileSpreadsheet } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AttendanceStats {
  total_records: number
  present_count: number
  absent_count: number
  late_count: number
  attendance_percentage: number
}

interface Class {
  id: number
  name: string
}

interface Subject {
  id: number
  name: string
  code: string
}

interface AttendanceStatisticsProps {
  user: any
  showFilters?: boolean
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b"]

export default function AttendanceStatistics({ user, showFilters = true }: AttendanceStatisticsProps) {
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("30")
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (showFilters) {
      fetchClasses()
      fetchSubjects()
    }
    fetchStats()
  }, [selectedClass, selectedSubject, dateRange])

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      const data = await response.json()
      setClasses(data)
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects")
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const fetchStats = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedClass !== "all") params.append("classId", selectedClass)
      if (selectedSubject !== "all") params.append("subjectId", selectedSubject)
      if (user.role === "student") params.append("studentId", user.id.toString())

      // Add date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - Number.parseInt(dateRange))
      params.append("startDate", startDate.toISOString().split("T")[0])
      params.append("endDate", endDate.toISOString().split("T")[0])

      const response = await fetch(`/api/attendance/stats?${params}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (selectedClass !== "all") params.append("classId", selectedClass)
      if (selectedSubject !== "all") params.append("subjectId", selectedSubject)
      if (user.role === "student") params.append("studentId", user.id.toString())

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - Number.parseInt(dateRange))
      params.append("startDate", startDate.toISOString().split("T")[0])
      params.append("endDate", endDate.toISOString().split("T")[0])

      const response = await fetch(`/api/attendance/export?${params}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `attendance-report-${new Date().toISOString().split("T")[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)

        toast({
          title: "Export Successful",
          description: "Attendance report has been downloaded",
        })
      } else {
        throw new Error("Export failed")
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export attendance report",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const pieData = stats
    ? [
        { name: "Present", value: stats.present_count, color: "#10b981" },
        { name: "Absent", value: stats.absent_count, color: "#ef4444" },
        { name: "Late", value: stats.late_count, color: "#f59e0b" },
      ]
    : []

  const barData = stats
    ? [
        { name: "Present", count: stats.present_count, fill: "#10b981" },
        { name: "Absent", count: stats.absent_count, fill: "#ef4444" },
        { name: "Late", count: stats.late_count, fill: "#f59e0b" },
      ]
    : []

  return (
    <div className="space-y-6">
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Attendance Analytics
              </span>
              <Button onClick={handleExport} disabled={exporting} className="flex items-center gap-2">
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                Export Excel
              </Button>
            </CardTitle>
            <CardDescription>Comprehensive attendance statistics and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={fetchStats} className="w-full">
                  Update Stats
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_records}</div>
                <p className="text-xs text-muted-foreground">Attendance entries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.attendance_percentage}%</div>
                <p className="text-xs text-muted-foreground">Overall attendance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.present_count}</div>
                <p className="text-xs text-muted-foreground">Days present</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.absent_count}</div>
                <p className="text-xs text-muted-foreground">Days absent</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Distribution</CardTitle>
                <CardDescription>Breakdown of attendance status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
                <CardDescription>Detailed breakdown by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Insights</CardTitle>
              <CardDescription>Key attendance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">{stats.attendance_percentage}%</div>
                  <p className="text-sm text-gray-600">Overall Attendance Rate</p>
                  <Badge
                    className={
                      stats.attendance_percentage >= 85
                        ? "bg-green-100 text-green-800"
                        : stats.attendance_percentage >= 75
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {stats.attendance_percentage >= 85
                      ? "Excellent"
                      : stats.attendance_percentage >= 75
                        ? "Good"
                        : "Needs Improvement"}
                  </Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{stats.present_count + stats.late_count}</div>
                  <p className="text-sm text-gray-600">Total Attended</p>
                  <Badge variant="outline">Present + Late</Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600 mb-2">{stats.absent_count}</div>
                  <p className="text-sm text-gray-600">Days Missed</p>
                  <Badge variant="outline" className="text-red-600">
                    Absent
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
