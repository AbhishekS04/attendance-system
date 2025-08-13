"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Save } from "lucide-react"
import type { User, Class, Subject } from "@/lib/db"

interface AttendanceMarkerProps {
  user: User
}

interface Student {
  id: number
  full_name: string
  student_id: string
  status?: "present" | "absent" | "late"
}

export default function AttendanceMarker({ user }: AttendanceMarkerProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchClasses()
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
    }
  }, [selectedClass])

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

  const fetchStudents = async () => {
    if (!selectedClass) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/classes/${selectedClass}/students`)
      const data = await response.json()

      // Initialize all students as present by default
      const studentsWithStatus = data.map((student: Student) => ({
        ...student,
        status: "present" as const,
      }))

      setStudents(studentsWithStatus)
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStudentStatus = (studentId: number, status: "present" | "absent" | "late") => {
    setStudents((prev) => prev.map((student) => (student.id === studentId ? { ...student, status } : student)))
  }

  const saveAttendance = async () => {
    if (!selectedClass || !selectedSubject) {
      alert("Please select both class and subject")
      return
    }

    setIsSaving(true)
    try {
      const attendanceData = students.map((student) => ({
        studentId: student.id,
        classId: Number.parseInt(selectedClass),
        subjectId: Number.parseInt(selectedSubject),
        date: selectedDate,
        status: student.status || "present",
        markedBy: user.id,
      }))

      const response = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceRecords: attendanceData }),
      })

      if (response.ok) {
        alert("Attendance saved successfully!")
      } else {
        alert("Error saving attendance")
      }
    } catch (error) {
      console.error("Error saving attendance:", error)
      alert("Error saving attendance")
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "late":
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "late":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const presentCount = students.filter((s) => s.status === "present").length
  const absentCount = students.filter((s) => s.status === "absent").length
  const lateCount = students.filter((s) => s.status === "late").length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>Select class, subject, and date to mark attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name} ({cls.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  Present: {presentCount}
                </Badge>
                <Badge variant="outline" className="bg-red-50">
                  <XCircle className="h-4 w-4 mr-1 text-red-500" />
                  Absent: {absentCount}
                </Badge>
                <Badge variant="outline" className="bg-orange-50">
                  <Clock className="h-4 w-4 mr-1 text-orange-500" />
                  Late: {lateCount}
                </Badge>
                <Badge variant="outline">Total: {students.length}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
              <CardDescription>Click on status to change attendance</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading students...</div>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-gray-500">ID: {student.student_id}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={student.status === "present" ? "default" : "outline"}
                          onClick={() => updateStudentStatus(student.id, "present")}
                          className={student.status === "present" ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={student.status === "late" ? "default" : "outline"}
                          onClick={() => updateStudentStatus(student.id, "late")}
                          className={student.status === "late" ? "bg-orange-600 hover:bg-orange-700" : ""}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Late
                        </Button>
                        <Button
                          size="sm"
                          variant={student.status === "absent" ? "default" : "outline"}
                          onClick={() => updateStudentStatus(student.id, "absent")}
                          className={student.status === "absent" ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Absent
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveAttendance} disabled={isSaving} size="lg">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Attendance
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
