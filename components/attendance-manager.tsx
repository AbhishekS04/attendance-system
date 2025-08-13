"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MessageSquare, Users, TrendingUp, RefreshCw, FileText, FileSpreadsheet, Upload } from "lucide-react"

interface Student {
  id: number
  name: string
  rollNumber: string
  class: string
}

interface Subject {
  id: number
  name: string
  code: string
  faculty: string
  time: string
  status: string
  day: string
}

interface AttendanceRecord {
  rollNumber: string
  name: string
  status: "present" | "absent" | "official"
  remarks?: string
}

interface AttendanceManagerProps {
  students: Student[]
  subjects: Subject[]
  showSuccess: (message: string) => void
}

export default function AttendanceManager({ students, subjects, showSuccess }: AttendanceManagerProps) {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [remarks, setRemarks] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Initialize attendance with all students as absent
    const initialAttendance = students.map((student) => ({
      rollNumber: student.rollNumber,
      name: student.name,
      status: "absent" as const,
      remarks: "",
    }))
    setAttendance(initialAttendance)
  }, [students])

  useEffect(() => {
    // Enhanced GSAP animations
    if (typeof window !== "undefined" && window.gsap) {
      // Calendar button animation
      const calendarBtn = document.querySelector(".calendar-btn")
      if (calendarBtn) {
        window.gsap.set(calendarBtn, { scale: 1 })

        const handleClick = () => {
          window.gsap.to(calendarBtn, {
            scale: 0.9,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
            onComplete: () => {
              window.gsap.to(calendarBtn, {
                rotation: 360,
                duration: 0.8,
                ease: "back.out(1.7)",
              })
            },
          })
        }

        calendarBtn.addEventListener("click", handleClick)
        return () => calendarBtn.removeEventListener("click", handleClick)
      }

      // Roll number grid animation
      window.gsap.fromTo(
        ".roll-grid-item",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          stagger: 0.02,
          ease: "back.out(1.7)",
        },
      )
    }
  }, [attendance])

  const toggleAttendance = (rollNumber: string) => {
    setAttendance((prev) =>
      prev.map((record) =>
        record.rollNumber === rollNumber
          ? {
              ...record,
              status: record.status === "present" ? "absent" : "present",
              remarks: record.status === "present" ? "" : record.remarks,
            }
          : record,
      ),
    )
  }

  const setOfficialLeave = (rollNumber: string) => {
    setAttendance((prev) =>
      prev.map((record) => (record.rollNumber === rollNumber ? { ...record, status: "official" as const } : record)),
    )
    setSelectedStudent(null)
    setRemarks("")
  }

  const addRemarks = () => {
    if (selectedStudent && remarks.trim()) {
      setAttendance((prev) =>
        prev.map((record) => (record.rollNumber === selectedStudent ? { ...record, remarks: remarks.trim() } : record)),
      )
      setSelectedStudent(null)
      setRemarks("")
    }
  }

  const handleSubmitAttendance = async () => {
    if (!selectedSubject) {
      alert("Please select a subject!")
      return
    }

    setIsLoading(true)

    try {
      // Animate button before API call
      if (typeof window !== "undefined" && window.gsap) {
        const submitBtn = document.querySelector(".submit-btn")
        window.gsap.to(submitBtn, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
        })
      }

      const attendanceRecords = attendance.map((record) => ({
        studentId: record.rollNumber,
        classId: "default-class", // You can make this dynamic
        subjectId: selectedSubject,
        date: date,
        status: record.status,
        markedBy: "admin",
        notes: record.remarks || null,
      }))

      const response = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attendanceRecords }),
      })

      if (response.ok) {
        const presentCount = attendance.filter((r) => r.status === "present").length
        const officialCount = attendance.filter((r) => r.status === "official").length
        const absentCount = attendance.filter((r) => r.status === "absent").length

        showSuccess(
          `✅ Attendance saved to database! Present: ${presentCount}, Official: ${officialCount}, Absent: ${absentCount}`,
        )
      } else {
        throw new Error("Failed to save attendance")
      }
    } catch (error) {
      console.error("Error saving attendance:", error)
      alert("Failed to save attendance. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      // Create PDF content
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.text("Attendance Report", 20, 30)

      // Subject and Date info
      doc.setFontSize(12)
      const selectedSubjectData = subjects.find((s) => s.code === selectedSubject)
      doc.text(`Subject: ${selectedSubjectData?.name || "N/A"} (${selectedSubject})`, 20, 50)
      doc.text(`Date: ${new Date(date).toLocaleDateString()}`, 20, 65)

      // Attendance data
      let yPosition = 85
      doc.text("Roll No.", 20, yPosition)
      doc.text("Name", 60, yPosition)
      doc.text("Status", 120, yPosition)
      doc.text("Remarks", 160, yPosition)

      yPosition += 10
      attendance.forEach((record) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 30
        }

        doc.text(record.rollNumber, 20, yPosition)
        doc.text(record.name.substring(0, 15), 60, yPosition)
        doc.text(record.status.toUpperCase(), 120, yPosition)
        doc.text(record.remarks?.substring(0, 20) || "", 160, yPosition)
        yPosition += 10
      })

      doc.save(`attendance-${selectedSubject}-${date}.pdf`)
      showSuccess("📄 PDF exported successfully!")
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Failed to export PDF")
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams({
        classId: "default-class",
        subjectId: selectedSubject,
        date: date,
      })

      const response = await fetch(`/api/attendance/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `attendance-${selectedSubject}-${date}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showSuccess("📊 Excel exported successfully!")
      } else {
        throw new Error("Export failed")
      }
    } catch (error) {
      console.error("Error exporting Excel:", error)
      alert("Failed to export Excel")
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)

    // Animate refresh button
    if (typeof window !== "undefined" && window.gsap) {
      const refreshBtn = document.querySelector(".refresh-btn")
      window.gsap.to(refreshBtn, {
        rotation: 360,
        duration: 1,
        ease: "power2.out",
      })
    }

    try {
      // Reset attendance to initial state
      const initialAttendance = students.map((student) => ({
        rollNumber: student.rollNumber,
        name: student.name,
        status: "absent" as const,
        remarks: "",
      }))
      setAttendance(initialAttendance)
      setSelectedStudent(null)
      setRemarks("")

      showSuccess("🔄 Data refreshed successfully!")
    } catch (error) {
      console.error("Error refreshing:", error)
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000) // Keep animation visible
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500 hover:bg-green-600"
      case "official":
        return "bg-blue-500 hover:bg-blue-600"
      case "absent":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "present":
        return "Present"
      case "official":
        return "Official"
      case "absent":
        return "Absent"
      default:
        return "Unknown"
    }
  }

  const presentCount = attendance.filter((r) => r.status === "present").length
  const officialCount = attendance.filter((r) => r.status === "official").length
  const absentCount = attendance.filter((r) => r.status === "absent").length
  const attendanceRate = (((presentCount + officialCount) / attendance.length) * 100).toFixed(1)

  return (
    <Card className="glass-card border-slate-600 shadow-2xl hover:shadow-3xl transition-all duration-500">
      <CardHeader className="border-b border-slate-600 bg-slate-800/50">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="h-6 w-6 calendar-btn cursor-pointer text-blue-400 transition-all duration-300 hover:text-blue-300 float-icon" />
            </div>
            <span className="font-bold text-xl gradient-text">Attendance Manager</span>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
            className="refresh-btn glass-card border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 bg-slate-900/50">
        {/* Enhanced form controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-slate-300 font-semibold">
              Select Subject
            </Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="glass-card border-slate-600 text-white hover:border-slate-500 transition-all duration-300">
                <SelectValue placeholder="Choose subject" />
              </SelectTrigger>
              <SelectContent className="glass-card border-slate-600">
                {subjects.map((subject) => (
                  <SelectItem
                    key={subject.id}
                    value={subject.code}
                    className="text-white hover:bg-slate-700 focus:bg-slate-700"
                  >
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-slate-300 font-semibold">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="glass-card border-slate-600 text-white hover:border-slate-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Enhanced Roll Number Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            <Label className="text-slate-300 font-semibold">Mark Attendance (Click roll numbers)</Label>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {attendance.map((record, index) => (
              <div key={record.rollNumber} className="text-center space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAttendance(record.rollNumber)}
                  className={`roll-grid-item w-full h-14 text-sm font-bold transition-all duration-300 border-2 relative overflow-hidden ${
                    record.status === "present"
                      ? "glass-card border-green-500 bg-green-500/20 text-green-300 hover:bg-green-500/30 shadow-lg shadow-green-500/20"
                      : record.status === "official"
                        ? "glass-card border-blue-500 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 shadow-lg shadow-blue-500/20"
                        : "glass-card border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                  }`}
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  <span className="relative z-10">{record.rollNumber}</span>
                </Button>
                <p className="text-xs text-slate-400 truncate font-medium">{record.name.split(" ")[0]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAttendance((prev) => prev.map((r) => ({ ...r, status: "present" as const })))}
            className="glass-card border-green-500 bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-all duration-300"
          >
            <Users className="h-4 w-4 mr-2" />
            Mark All Present
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAttendance((prev) => prev.map((r) => ({ ...r, status: "absent" as const, remarks: "" })))}
            className="glass-card border-red-500 bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all duration-300"
          >
            <Users className="h-4 w-4 mr-2" />
            Mark All Absent
          </Button>
        </div>

        {/* Enhanced Remarks Section */}
        <div className="space-y-4 p-4 glass-card border-slate-600 rounded-lg bg-slate-50">
          <Label className="text-slate-300 font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            Add Remarks / Official Leave
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select value={selectedStudent || ""} onValueChange={setSelectedStudent}>
              <SelectTrigger className="glass-card border-slate-600 text-white hover:border-slate-500 transition-all duration-300">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent className="glass-card border-slate-600">
                {students.map((student) => (
                  <SelectItem
                    key={student.rollNumber}
                    value={student.rollNumber}
                    className="text-white hover:bg-slate-700 focus:bg-slate-700"
                  >
                    {student.rollNumber} - {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Enter remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="glass-card border-slate-600 text-white hover:border-slate-500 transition-all duration-300"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={addRemarks}
              size="sm"
              disabled={!selectedStudent || !remarks.trim()}
              className="glass-card border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Remarks
            </Button>
            <Button
              onClick={() => selectedStudent && setOfficialLeave(selectedStudent)}
              size="sm"
              variant="outline"
              disabled={!selectedStudent}
              className="glass-card border-blue-500 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Mark Official Leave
            </Button>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            size="sm"
            variant="outline"
            className="glass-card border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 bg-transparent"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
          <Button
            onClick={handleExportExcel}
            disabled={isExporting}
            size="sm"
            variant="outline"
            className="glass-card border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 bg-transparent"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export Excel"}
          </Button>
        </div>

        <Button
          onClick={handleSubmitAttendance}
          disabled={isLoading}
          className="submit-btn w-full btn-gradient text-white text-lg py-6 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
        >
          <Upload className="h-5 w-5 mr-3" />
          {isLoading ? "Saving to Database..." : "💾 Save to Database"}
        </Button>

        {/* Enhanced Stats Summary */}
        <div className="glass-card border-slate-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <h4 className="font-bold text-white gradient-text">Attendance Summary</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Present", value: presentCount, color: "green-400", bg: "green-500/20" },
              { label: "Official", value: officialCount, color: "blue-400", bg: "blue-500/20" },
              { label: "Absent", value: absentCount, color: "red-400", bg: "red-500/20" },
              { label: "Rate", value: `${attendanceRate}%`, color: "purple-400", bg: "purple-500/20" },
            ].map((stat, index) => (
              <div
                key={index}
                className={`text-center p-4 glass-card border-slate-600 rounded-lg hover:scale-105 transition-all duration-300 bg-${stat.bg}`}
              >
                <div className={`font-bold text-2xl text-${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-slate-300 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
