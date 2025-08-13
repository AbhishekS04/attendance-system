"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Users, BookOpen, Shield, GraduationCap, Sparkles, Settings, RefreshCw } from "lucide-react"
import AttendanceManager from "@/components/attendance-manager"
import ClassStatusManager from "@/components/class-status-manager"
import StudentManager from "@/components/student-manager"
import SubjectManager from "@/components/subject-manager"
import ScheduleManager from "@/components/schedule-manager"
import SuccessPopup from "@/components/success-popup"

interface Subject {
  id: number
  name: string
  code: string
  faculty: string
  time: string
  status: "active" | "completed" | "free"
  day: string
}

interface Student {
  id: number
  name: string
  rollNumber: string
  class: string
}

export default function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: 1,
      name: "Mathematics",
      code: "MATH101",
      faculty: "Dr. Smith",
      time: "9:00 AM - 10:00 AM",
      status: "active",
      day: "Monday",
    },
    {
      id: 2,
      name: "Physics",
      code: "PHY101",
      faculty: "Prof. Johnson",
      time: "10:00 AM - 11:00 AM",
      status: "free",
      day: "Monday",
    },
    {
      id: 3,
      name: "Chemistry",
      code: "CHEM101",
      faculty: "Dr. Brown",
      time: "11:00 AM - 12:00 PM",
      status: "completed",
      day: "Monday",
    },
    {
      id: 4,
      name: "English",
      code: "ENG101",
      faculty: "Ms. Davis",
      time: "1:00 PM - 2:00 PM",
      status: "free",
      day: "Monday",
    },
    {
      id: 5,
      name: "Computer Science",
      code: "CS101",
      faculty: "Dr. Wilson",
      time: "2:00 PM - 3:00 PM",
      status: "free",
      day: "Monday",
    },
  ])

  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "John Doe", rollNumber: "001", class: "CSE-A" },
    { id: 2, name: "Jane Smith", rollNumber: "002", class: "CSE-A" },
    { id: 3, name: "Mike Johnson", rollNumber: "003", class: "CSE-A" },
    { id: 4, name: "Sarah Wilson", rollNumber: "004", class: "CSE-A" },
    { id: 5, name: "David Brown", rollNumber: "005", class: "CSE-A" },
  ])

  const [studentAttendance, setStudentAttendance] = useState({
    totalClasses: 0,
    attendedClasses: 0,
    percentage: 0,
    recentAttendance: [],
  })
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)

  const headerRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const scheduleRef = useRef<HTMLDivElement>(null)

  const handleAdminLogin = () => {
    if (adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAdmin(true)
      setIsDialogOpen(false)
      setAdminPassword("")
      showSuccessMessage("Admin access granted!")
    } else {
      alert("Incorrect password!")
    }
  }

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 animate-pulse-green"
      case "completed":
        return "bg-red-500"
      case "free":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Class Ongoing"
      case "completed":
        return "Class Over"
      case "free":
        return "Free Period"
      default:
        return "Unknown"
    }
  }

  const getCurrentDaySubjects = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
    return subjects.filter((subject) => subject.day === today)
  }

  const fetchStudentAttendance = async () => {
    setIsLoadingAttendance(true)
    try {
      const response = await fetch("/api/attendance/student-stats")
      if (response.ok) {
        const data = await response.json()
        setStudentAttendance(data)
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
      setStudentAttendance({
        totalClasses: 0,
        attendedClasses: 0,
        percentage: 0,
        recentAttendance: [],
      })
    } finally {
      setIsLoadingAttendance(false)
    }
  }

  const updateLiveClassStatus = () => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" })

    setSubjects((prevSubjects) =>
      prevSubjects.map((subject) => {
        if (subject.day !== currentDay) return { ...subject, status: "free" as const }

        const [startTime, endTime] = subject.time.split(" - ")
        const startMinutes = parseTimeToMinutes(startTime)
        const endMinutes = parseTimeToMinutes(endTime)

        if (currentTime >= startMinutes && currentTime <= endMinutes) {
          return { ...subject, status: "active" as const }
        } else if (currentTime > endMinutes) {
          return { ...subject, status: "completed" as const }
        } else {
          return { ...subject, status: "free" as const }
        }
      }),
    )
  }

  const parseTimeToMinutes = (timeStr: string) => {
    const [time, period] = timeStr.split(" ")
    const [hours, minutes] = time.split(":").map(Number)
    let totalMinutes = hours * 60 + minutes
    if (period === "PM" && hours !== 12) totalMinutes += 12 * 60
    if (period === "AM" && hours === 12) totalMinutes -= 12 * 60
    return totalMinutes
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.gsap) {
      const tl = window.gsap.timeline()

      tl.fromTo(headerRef.current, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })

      tl.fromTo(
        ".stat-card",
        { y: 60, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        "-=0.4",
      )

      tl.fromTo(
        ".schedule-item",
        { x: -80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=0.3",
      )

      ;(window as any).gsap.to(".float-icon", {
        y: -10,
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.2,
      })
    }

    fetchStudentAttendance()
    updateLiveClassStatus()

    const statusInterval = setInterval(updateLiveClassStatus, 60000)
    const attendanceInterval = setInterval(fetchStudentAttendance, 300000)

    return () => {
      clearInterval(statusInterval)
      clearInterval(attendanceInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <header ref={headerRef} className="glass-header shadow-2xl px-6 py-6 sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-blue-400 float-icon" />
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-lg opacity-20 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text font-serif">AttendanceHub</h1>
              <p className="text-slate-300 font-light">Smart Attendance Management System</p>
            </div>
          </div>

          <div className="flex gap-3">
            {isAdmin && (
              <div className="flex gap-2">
                {[
                  { key: "dashboard", label: "Dashboard", icon: null },
                  { key: "students", label: "Students", icon: Users },
                  { key: "subjects", label: "Subjects", icon: BookOpen },
                  { key: "schedule", label: "Schedule", icon: Calendar },
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={activeTab === key ? "default" : "outline"}
                    onClick={() => setActiveTab(key)}
                    size="sm"
                    className={`transition-all duration-300 ${
                      activeTab === key
                        ? "btn-gradient text-white shadow-lg"
                        : "glass-card hover:bg-slate-700/50 text-slate-300 hover:text-white"
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4 mr-1" />}
                    {label}
                  </Button>
                ))}
              </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant={isAdmin ? "default" : "outline"}
                  className={`flex items-center gap-2 transition-all duration-300 ${
                    isAdmin
                      ? "btn-gradient text-white shadow-lg"
                      : "glass-card hover:bg-slate-700/50 text-slate-300 hover:text-white"
                  }`}
                >
                  <Shield className="h-4 w-4 float-icon" />
                  {isAdmin ? "Admin Mode" : "Admin Access"}
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-slate-600">
                <DialogHeader>
                  <DialogTitle className="text-white gradient-text">Admin Authentication</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password" className="text-slate-300">
                      Enter Admin Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter password"
                      onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                      className="glass-card border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 transition-all duration-300"
                    />
                  </div>
                  <Button onClick={handleAdminLogin} className="w-full btn-gradient">
                    Login as Admin
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {activeTab === "dashboard" && (
          <>
            <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  title: "Total Students",
                  value: students.length,
                  subtitle: "Active students",
                  icon: Users,
                  color: "blue",
                },
                {
                  title: "Today's Classes",
                  value: getCurrentDaySubjects().length,
                  subtitle: "Scheduled classes",
                  icon: BookOpen,
                  color: "green",
                },
                { title: "Present Today", value: "198", subtitle: "80.8% attendance", icon: Calendar, color: "purple" },
                {
                  title: "Current Time",
                  value: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  subtitle: new Date().toLocaleDateString(),
                  icon: Clock,
                  color: "orange",
                },
              ].map((stat, index) => (
                <Card key={index} className="stat-card glass-card hover:scale-105 transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-400 float-icon`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <p className="text-xs text-slate-400">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-8 glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <BookOpen className="h-6 w-6 text-blue-400 float-icon" />
                  <span className="gradient-text">Today's Class Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getCurrentDaySubjects().map((subject, index) => (
                    <div
                      key={subject.id}
                      className="schedule-item flex items-center justify-between p-5 glass-card rounded-xl hover:scale-[1.02] transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(subject.status)} relative`}>
                          {subject.status === "active" && (
                            <div className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-75"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:gradient-text transition-all">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-slate-300">
                            {subject.time} • {subject.faculty}
                          </p>
                          <p className="text-xs text-slate-400">{subject.code}</p>
                        </div>
                      </div>
                      <Badge
                        variant={subject.status === "active" ? "default" : "secondary"}
                        className={`${
                          subject.status === "active"
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                            : "glass-card text-slate-300"
                        } transition-all duration-300`}
                      >
                        {getStatusText(subject.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {isAdmin && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
                <ClassStatusManager subjects={subjects} setSubjects={setSubjects} />
                <AttendanceManager students={students} subjects={subjects} showSuccess={showSuccessMessage} />
              </div>
            )}

            {!isAdmin && (
              <div className="space-y-8 animate-slide-up">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <Settings className="h-6 w-6 text-green-400 float-icon" />
                      <span className="gradient-text">Live Class Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getCurrentDaySubjects().map((subject) => (
                        <div
                          key={subject.id}
                          className="p-4 glass-card rounded-xl hover:scale-[1.02] transition-all duration-300 group"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full ${getStatusColor(subject.status)} relative shadow-lg`}
                              >
                                {subject.status === "active" && (
                                  <div className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-75"></div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-white group-hover:gradient-text transition-all">
                                  {subject.name}
                                </h4>
                                <p className="text-sm text-slate-300">{subject.time}</p>
                                <p className="text-xs text-slate-400">{subject.faculty}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-center">
                            <Badge
                              variant={subject.status === "active" ? "default" : "secondary"}
                              className={`${
                                subject.status === "active"
                                  ? "bg-green-500 text-white shadow-lg shadow-green-500/30 animate-pulse-subtle"
                                  : subject.status === "completed"
                                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              } transition-all duration-300 px-4 py-1`}
                            >
                              {subject.status === "active" && "🟢 "}
                              {subject.status === "completed" && "🔴 "}
                              {subject.status === "free" && "🔵 "}
                              {getStatusText(subject.status)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <GraduationCap className="h-6 w-6 text-blue-400 float-icon" />
                      <span className="gradient-text">My Attendance Overview</span>
                      <Button
                        onClick={fetchStudentAttendance}
                        size="sm"
                        variant="ghost"
                        className="ml-auto text-slate-400 hover:text-white transition-colors"
                        disabled={isLoadingAttendance}
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoadingAttendance ? "animate-spin" : ""}`} />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAttendance ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-16 glass-card rounded-lg shimmer"></div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center p-6 glass-card rounded-xl hover:scale-105 transition-all duration-300">
                            <div className="text-4xl font-bold gradient-text mb-2">{studentAttendance.percentage}%</div>
                            <p className="text-slate-300 font-medium">Overall Attendance</p>
                            <div className="w-full bg-slate-700 rounded-full h-3 mt-4">
                              <div
                                className={`h-3 rounded-full transition-all duration-1000 ${
                                  studentAttendance.percentage >= 75
                                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                    : "bg-gradient-to-r from-red-400 to-orange-500"
                                }`}
                                style={{ width: `${Math.min(studentAttendance.percentage, 100)}%` }}
                              ></div>
                            </div>
                            <p
                              className={`text-xs mt-2 ${
                                studentAttendance.percentage >= 75 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {studentAttendance.percentage >= 75
                                ? "✓ Meeting Requirements"
                                : "⚠ Below 75% Requirement"}
                            </p>
                          </div>

                          <div className="text-center p-6 glass-card rounded-xl hover:scale-105 transition-all duration-300">
                            <div className="text-4xl font-bold text-green-400 mb-2">
                              {studentAttendance.attendedClasses}
                            </div>
                            <p className="text-slate-300 font-medium">Classes Attended</p>
                            <p className="text-sm text-slate-400 mt-2">Out of {studentAttendance.totalClasses} total</p>
                            <div className="flex justify-center mt-3">
                              <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                                Present
                              </Badge>
                            </div>
                          </div>

                          <div className="text-center p-6 glass-card rounded-xl hover:scale-105 transition-all duration-300">
                            <div className="text-4xl font-bold text-red-400 mb-2">
                              {studentAttendance.totalClasses - studentAttendance.attendedClasses}
                            </div>
                            <p className="text-slate-300 font-medium">Classes Missed</p>
                            <p className="text-sm text-slate-400 mt-2">
                              {(
                                ((studentAttendance.totalClasses - studentAttendance.attendedClasses) /
                                  Math.max(studentAttendance.totalClasses, 1)) *
                                100
                              ).toFixed(1)}
                              % absence rate
                            </p>
                            <div className="flex justify-center mt-3">
                              <Badge className="bg-red-500/20 text-red-300 border border-red-500/30">Absent</Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-lg font-semibold text-white mb-4">Subject-wise Attendance</h4>
                          {getCurrentDaySubjects().map((subject, index) => {
                            const subjectAttendance = Math.floor(Math.random() * 30) + 70 // This should come from real data
                            return (
                              <div
                                key={subject.id}
                                className="flex items-center justify-between p-4 glass-card rounded-xl hover:scale-[1.02] transition-all duration-300 group"
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-3 h-3 rounded-full ${getStatusColor(subject.status)} shadow-lg`}>
                                    {subject.status === "active" && (
                                      <div className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-75"></div>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-white group-hover:gradient-text transition-all">
                                      {subject.name}
                                    </h4>
                                    <p className="text-sm text-slate-300">
                                      {subject.code} • {subject.faculty}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-white">{subjectAttendance}%</div>
                                  <Badge
                                    className={`${
                                      subjectAttendance >= 75
                                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                                    }`}
                                  >
                                    {subjectAttendance >= 75 ? "Good" : "Low"}
                                  </Badge>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="text-center py-12">
                    <div className="relative mb-6">
                      <Users className="h-16 w-16 text-slate-400 mx-auto float-icon" />
                      <div className="absolute inset-0 bg-purple-400 rounded-full blur-2xl opacity-10 animate-pulse"></div>
                    </div>
                    <h3 className="text-2xl font-semibold gradient-text mb-3">Student Portal</h3>
                    <p className="text-slate-300 mb-4 max-w-md mx-auto">
                      Track your attendance, view class schedules, and stay updated with real-time class status.
                    </p>
                    <div className="flex justify-center gap-4 text-sm text-slate-400">
                      <span>📚 Active Student</span>
                      <span>•</span>
                      <span>
                        🎯 {studentAttendance.percentage >= 75 ? "Meeting Requirements" : "Needs Improvement"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {activeTab === "students" && isAdmin && (
          <div className="animate-slide-up">
            <StudentManager students={students} setStudents={setStudents} showSuccess={showSuccessMessage} />
          </div>
        )}

        {activeTab === "subjects" && isAdmin && (
          <div className="animate-slide-up">
            <SubjectManager subjects={subjects} setSubjects={setSubjects} showSuccess={showSuccessMessage} />
          </div>
        )}

        {activeTab === "schedule" && isAdmin && (
          <div className="animate-slide-up">
            <ScheduleManager subjects={subjects} setSubjects={setSubjects} showSuccess={showSuccessMessage} />
          </div>
        )}
      </main>

      <SuccessPopup show={showSuccess} message={successMessage} />
    </div>
  )
}
