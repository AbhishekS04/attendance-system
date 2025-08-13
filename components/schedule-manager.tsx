"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, RotateCcw } from "lucide-react"

interface Subject {
  id: number
  name: string
  code: string
  faculty: string
  time: string
  status: "active" | "completed" | "free"
  day: string
}

interface ScheduleManagerProps {
  subjects: Subject[]
  setSubjects: (subjects: Subject[]) => void
  showSuccess: (message: string) => void
}

export default function ScheduleManager({ subjects, setSubjects, showSuccess }: ScheduleManagerProps) {
  const [selectedDay, setSelectedDay] = useState("Monday")

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const updateSubjectStatus = (id: number, status: "active" | "completed" | "free") => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, status } : s)))
    showSuccess(`Subject status updated to ${status}`)
  }

  const resetAllStatuses = () => {
    setSubjects(subjects.map((s) => ({ ...s, status: "free" as const })))
    showSuccess("All class statuses reset to free")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
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
    return subjects.filter((subject) => subject.day === selectedDay)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Schedule Management</h2>
        <Button
          onClick={resetAllStatuses}
          variant="outline"
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset All Status
        </Button>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 flex-wrap">
        {days.map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? "default" : "outline"}
            onClick={() => setSelectedDay(day)}
            size="sm"
            className={
              selectedDay === day
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            }
          >
            {day}
          </Button>
        ))}
      </div>

      {/* Schedule for Selected Day */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            {selectedDay} Schedule ({getCurrentDaySubjects().length} classes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getCurrentDaySubjects().map((subject) => (
              <div key={subject.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(subject.status)} ${subject.status === "active" ? "animate-pulse-green" : ""}`}
                    ></div>
                    <div>
                      <h3 className="font-semibold text-white">{subject.name}</h3>
                      <p className="text-sm text-gray-300">
                        {subject.time} • {subject.faculty}
                      </p>
                      <p className="text-xs text-gray-400">{subject.code}</p>
                    </div>
                  </div>
                  <Badge variant={subject.status === "active" ? "default" : "secondary"}>
                    {getStatusText(subject.status)}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateSubjectStatus(subject.id, "active")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={subject.status === "active"}
                  >
                    Start Class
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateSubjectStatus(subject.id, "completed")}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={subject.status === "completed"}
                  >
                    End Class
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateSubjectStatus(subject.id, "free")}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                    disabled={subject.status === "free"}
                  >
                    Mark Free
                  </Button>
                </div>
              </div>
            ))}

            {getCurrentDaySubjects().length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No classes scheduled for {selectedDay}</p>
                <p className="text-sm text-gray-500 mt-2">Add subjects in the Subjects tab to see them here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.map((day) => {
              const daySubjects = subjects.filter((s) => s.day === day)
              const activeCount = daySubjects.filter((s) => s.status === "active").length
              const completedCount = daySubjects.filter((s) => s.status === "completed").length
              const freeCount = daySubjects.filter((s) => s.status === "free").length

              return (
                <div key={day} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                  <h4 className="font-semibold text-white mb-2">{day}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Classes:</span>
                      <span className="text-white font-medium">{daySubjects.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Active:</span>
                      <span className="text-white">{activeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-400">Completed:</span>
                      <span className="text-white">{completedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-400">Free:</span>
                      <span className="text-white">{freeCount}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
