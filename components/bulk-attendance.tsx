"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Student {
  id: number
  name: string
  student_id: string
  is_cr: boolean
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

interface BulkAttendanceProps {
  user: any
}

export default function BulkAttendance({ user }: BulkAttendanceProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [attendanceData, setAttendanceData] = useState<Record<number, "present" | "absent" | "late">>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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

    setLoading(true)
    try {
      const response = await fetch(`/api/classes/${selectedClass}/students`)
      const data = await response.json()
      setStudents(data)

      // Initialize attendance data with all students as present
      const initialAttendance: Record<number, "present" | "absent" | "late"> = {}
      data.forEach((student: Student) => {
        initialAttendance[student.id] = "present"
      })
      setAttendanceData(initialAttendance)
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId: number, status: "present" | "absent" | "late") => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleBulkAction = (status: "present" | "absent" | "late") => {
    const newAttendanceData: Record<number, "present" | "absent" | "late"> = {}
    students.forEach((student) => {
      newAttendanceData[student.id] = status
    })
    setAttendanceData(newAttendanceData)
  }

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSubject || !selectedDate) {
      toast({
        title: "Missing Information",
        description: "Please select class, subject, and date",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const attendanceRecords = students.map((student) => ({
        studentId: student.id,
        classId: Number.parseInt(selectedClass),
        subjectId: Number.parseInt(selectedSubject),
        date: selectedDate,
        status: attendanceData[student.id],
        markedBy: user.id,
      }))

      const response = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attendanceRecords }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Attendance marked successfully",
        })
      } else {
        throw new Error("Failed to mark attendance")
      }
    } catch (error) {
      console.error("Error marking attendance:", error)
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: "present" | "absent" | "late") => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "late":
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusCount = (status: "present" | "absent" | "late") => {
    return Object.values(attendanceData).filter((s) => s === status).length
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Attendance Marking
          </CardTitle>
          <CardDescription>Mark attendance for multiple students at once</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
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
              <Label htmlFor="date">Date</Label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
          </div>

          {students.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("present")}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark All Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("absent")}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Mark All Absent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("late")}
                    className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Mark All Late
                  </Button>
                </div>

                <div className="flex gap-4 text-sm">
                  <Badge variant="outline" className="text-green-600">
                    Present: {getStatusCount("present")}
                  </Badge>
                  <Badge variant="outline" className="text-red-600">
                    Absent: {getStatusCount("absent")}
                  </Badge>
                  <Badge variant="outline" className="text-yellow-600">
                    Late: {getStatusCount("late")}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg">
                <div className="max-h-96 overflow-y-auto">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">
                            {student.student_id}
                            {student.is_cr && (
                              <Badge className="ml-2" variant="secondary">
                                CR
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {(["present", "absent", "late"] as const).map((status) => (
                          <Button
                            key={status}
                            variant={attendanceData[student.id] === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAttendanceChange(student.id, status)}
                            className={
                              attendanceData[student.id] === status
                                ? status === "present"
                                  ? "bg-green-500 hover:bg-green-600"
                                  : status === "absent"
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-yellow-500 hover:bg-yellow-600"
                                : ""
                            }
                          >
                            {getStatusIcon(status)}
                            <span className="ml-1 capitalize">{status}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSubmit} disabled={submitting} className="w-full" size="lg">
                {submitting ? "Marking Attendance..." : "Mark Attendance"}
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
